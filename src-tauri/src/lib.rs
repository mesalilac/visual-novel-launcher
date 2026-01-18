mod cli;
mod commands;
mod database;
mod models;
mod schema;
mod services;
mod utils;

use clap::Parser;
use cli::Cli;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};

use tauri::Manager;

const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");
const APP_NAME: &str = "visual-novel-launcher";

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let cli = Cli::parse();

    let mut builder = env_logger::Builder::new();

    builder.filter_level(log::LevelFilter::Info);

    if cli.verbose {
        builder.filter_level(log::LevelFilter::Trace);
    }

    builder.init();

    let pool = database::connection::get_connection_pool();

    if let Ok(mut conn) = pool.get() {
        match conn.run_pending_migrations(MIGRATIONS) {
            Ok(_) => {}
            Err(e) => panic!("Failed to run migrations: {e}"),
        }
    }
    tauri::Builder::default()
        .manage(database::connection::DbPoolWrapper { pool })
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
