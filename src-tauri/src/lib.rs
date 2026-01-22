mod bridge;
mod cli;
mod commands;
mod database;
mod schema;
mod services;
mod utils;

use clap::Parser;
use cli::Cli;
use commands::*;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use specta_typescript::{BigIntExportBehavior, Typescript};
use tauri::Manager;
use tauri_helper::{auto_collect_command, specta_collect_commands};
use tauri_specta::Builder;

const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");
const APP_NAME: &str = "visual-novel-launcher";
const APP_SETTINGS_ID: i32 = 1;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
#[auto_collect_command]
#[specta::specta]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
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
                    let vns = services::scanner::scan_library(&mut conn, library_path.clone());

                    log::info!(
                        "Startup library scan: Found {} new visual novels at {:?}",
                        vns.len(),
                        library_path
                    );
                }
                None => {
                    log::warn!("Startup scan: No library path configured yet");
                }
            },
            Err(db_err) => log::error!("Database error during startup scan: {db_err}"),
        }

        _ = services::scanner::sync_library(&mut conn);
    }

    let specta_builder = Builder::<tauri::Wry>::new().commands(specta_collect_commands!());

    #[cfg(debug_assertions)]
    specta_builder
        .export(
            Typescript::default().bigint(BigIntExportBehavior::Number),
            "../src/bindings.ts",
        )
        .expect("Failed to export typescript bindings");

    tauri::Builder::default()
        .manage(database::connection::DbPoolWrapper { pool })
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(specta_builder.invoke_handler())
        .setup(move |app| {
            specta_builder.mount_events(app);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
