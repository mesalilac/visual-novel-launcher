mod bridge;
mod cli;
mod commands;
mod database;
mod events;
mod schema;
mod services;
mod utils;
mod vndb;

use clap::Parser;
use cli::Cli;
use commands::*;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use specta_typescript::{BigIntExportBehavior, Typescript};
use std::io;
use std::process::Command;
use std::{path::Path, time::Duration};
use tauri::{async_runtime, Manager};
use tauri_specta::Event;
use tauri_specta::{collect_commands, collect_events, Builder};
use vndb_api::client::VndbApiClient;

use crate::bridge::dto::VisualNovel;
use crate::commands::prelude::{TagEntity, VisualNovelTagEntity};
use crate::events::{GameClosed, MetadataUpdated};

const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");
const APP_NAME: &str = "com.mesalilac.visual-novel-launcher";
const APP_SETTINGS_ID: i32 = 1;

pub type DbPool = diesel::r2d2::Pool<diesel::r2d2::ConnectionManager<diesel::SqliteConnection>>;

pub struct AppState {
    pub pool: DbPool,
}

pub fn biome(file: &Path) -> io::Result<()> {
    let biome_bin = if cfg!(windows) {
        "../node_modules/.bin/biome.cmd"
    } else {
        "../node_modules/.bin/biome"
    };

    let process = Command::new(biome_bin)
        .arg("check")
        .arg("--write")
        .arg(file)
        .output();

    let output = match process {
        Ok(out) => out,
        Err(e) => {
            println!("Error: Failed to run biome: {e}");

            return Err(e);
        }
    };

    if !output.status.success() {
        let error_message = String::from_utf8_lossy(&output.stderr);
        let out_message = String::from_utf8_lossy(&output.stdout);
        println!("--- Biomejs Error ---");
        println!("Status: {}", output.status);
        println!("Stdout: {}", out_message);
        println!("Stderr: {}", error_message);

        return Err(io::Error::other(format!("Biomejs failed: {error_message}")));
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let cli = Cli::parse();

    let mut env_builder = env_logger::Builder::new();

    env_builder.filter_level(log::LevelFilter::Info);

    if cli.verbose {
        env_builder.filter_level(log::LevelFilter::Trace);
    }

    env_builder.init();

    let pool = database::connection::get_connection_pool();

    // TODO: Go back to `specta_collect_commands!()` after https://github.com/RiadYan/tauri-helper/issues/1 is fixed
    // let specta_builder = Builder::<tauri::Wry>::new().commands(specta_collect_commands!());
    let specta_builder = Builder::<tauri::Wry>::new()
        .commands(collect_commands![
            get_visual_novels,
            get_visual_novel_by_id,
            get_tags,
            get_settings,
            get_play_sessions,
            get_stats,
            create_visual_novel,
            create_tag,
            remove_visual_novel_by_id,
            remove_tag_by_id,
            remove_tag_from_visual_novel_by_id,
            remove_all_visual_novels,
            remove_all_tags,
            update_visual_novel,
            update_tag,
            update_settings,
            util_scan_library,
            util_sync_library,
            util_open_path,
            util_launch_visual_novel,
            util_close_visual_novel
        ])
        .events(collect_events![GameClosed, MetadataUpdated]);

    #[cfg(debug_assertions)]
    specta_builder
        .export(
            Typescript::default()
                .bigint(BigIntExportBehavior::Number)
                .header("/** biome-ignore-all lint: Auto generate */\n/** biome-ignore-all assist/source/organizeImports: Auto generate */")
                .formatter(biome),
            "../src/bindings.ts",
        )
        .expect("Failed to export typescript bindings");

    tauri::Builder::default()
        .manage(AppState { pool })
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(specta_builder.invoke_handler())
        .setup(move |app| {
            specta_builder.mount_events(app);

            let pool = app.state::<AppState>().pool.clone();
            let app_handle = app.handle().clone();

            if let Ok(mut conn) = pool.get() {
                match conn.run_pending_migrations(MIGRATIONS) {
                    Ok(_) => {}
                    Err(e) => panic!("Failed to run migrations: {e}"),
                };

                use database::entities::SettingEntity;
                use diesel::prelude::*;
                use schema::settings::dsl as settings_dsl;

                match settings_dsl::settings
                    .filter(settings_dsl::id.eq(APP_SETTINGS_ID))
                    .get_result::<SettingEntity>(&mut conn)
                {
                    Ok(settings) => match settings.library_path {
                        Some(library_path) => {
                            match services::scanner::scan_library(&mut conn, library_path.clone()) {
                                Ok(vns) => {
                                    log::info!(
                                        "Startup library scan: Found {} new visual novels at {:?}",
                                        vns.len(),
                                        library_path
                                    );
                                    async_runtime::spawn(async move {
                                        let vndb_client = VndbApiClient::new(&String::new());
                                        for vn in vns {
                                            if let Ok(updated_vn_entity) =
                                                vndb::update_metadata(&mut conn, &vndb_client, vn)
                                                    .await
                                            {
                                                let tags = VisualNovelTagEntity::belonging_to(
                                                    &updated_vn_entity,
                                                )
                                                .inner_join(schema::tags::table)
                                                .select(TagEntity::as_select())
                                                .load::<TagEntity>(&mut conn)
                                                .unwrap_or(Vec::new());

                                                let updated_vn =
                                                    VisualNovel::from_db(updated_vn_entity, tags);

                                                _ = MetadataUpdated { vn: updated_vn }
                                                    .emit(&app_handle);
                                            }

                                            std::thread::sleep(Duration::from_secs(2));
                                        }
                                    });
                                }
                                Err(err) => {
                                    log::error!(
                                        "Startup library scan: Failed to scan library: {err}"
                                    );
                                }
                            };
                        }
                        None => {
                            log::warn!("Startup scan: No library path configured yet");
                        }
                    },
                    Err(db_err) => log::error!("Database error during startup scan: {db_err}"),
                }
            }

            if let Ok(mut conn) = pool.get() {
                _ = services::scanner::sync_library(&mut conn);
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
