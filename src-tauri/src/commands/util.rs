use nanoid::nanoid;
use std::path::Path;
use std::path::PathBuf;
use std::process::Command;
use std::thread;

use diesel::associations::HasTable;
use diesel::dsl::insert_into;
use diesel::dsl::update;
use tauri_specta::Event;

use super::prelude::*;
use crate::events::GameClosed;
use crate::services;
use crate::APP_SETTINGS_ID;

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn util_scan_library(state: AppState<'_>) -> CommandResult<Vec<VisualNovel>> {
    let mut conn = state.pool.get()?;

    let setting = settings::table
        .find(APP_SETTINGS_ID)
        .first::<SettingEntity>(&mut conn)?;

    if let Some(library_path) = setting.library_path {
        let vn_entities = services::scanner::scan_library(&mut conn, library_path)?;

        let tags = VisualNovelTagEntity::belonging_to(&vn_entities)
            .inner_join(tags::table)
            .select((VisualNovelTagEntity::as_select(), TagEntity::as_select()))
            .load::<(VisualNovelTagEntity, TagEntity)>(&mut conn)?;

        let data: Vec<VisualNovel> = tags
            .grouped_by(&vn_entities)
            .into_iter()
            .zip(vn_entities)
            .map(|(tags_list, vn)| {
                VisualNovel::from_db(vn, tags_list.into_iter().map(|x| x.1).collect())
            })
            .collect();

        return Ok(data);
    }

    Err(CommandError::ScanFailure("Library path is not set".into()))
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn util_sync_library(state: AppState<'_>) -> CommandResult<Vec<VisualNovel>> {
    let mut conn = state.pool.get()?;

    services::scanner::sync_library(&mut conn)?;

    let vns = visual_novels::table.load::<VisualNovelEntity>(&mut conn)?;

    let tags = VisualNovelTagEntity::belonging_to(&vns)
        .inner_join(tags::table)
        .select((VisualNovelTagEntity::as_select(), TagEntity::as_select()))
        .load::<(VisualNovelTagEntity, TagEntity)>(&mut conn)?;

    let data: Vec<VisualNovel> = tags
        .grouped_by(&vns)
        .into_iter()
        .zip(vns)
        .map(|(tags_list, vn)| {
            VisualNovel::from_db(vn, tags_list.into_iter().map(|x| x.1).collect())
        })
        .collect();

    Ok(data)
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn util_open_path(_state: AppState<'_>, path: String) -> CommandResult<()> {
    tauri_plugin_opener::open_path(path, None::<&str>)?;

    Ok(())
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn util_launch_visual_novel(
    state: AppState<'_>,
    app_handle: tauri::AppHandle,
    id: String,
) -> CommandResult<u32> {
    let mut conn: diesel::r2d2::PooledConnection<
        diesel::r2d2::ConnectionManager<SqliteConnection>,
    > = state.pool.get()?;

    let settings = SettingEntity::table()
        .find(APP_SETTINGS_ID)
        .get_result::<SettingEntity>(&mut conn)?;

    let vn = VisualNovelEntity::table()
        .find(id)
        .get_result::<VisualNovelEntity>(&mut conn)?;

    let exe_path = Path::new(&vn.executable_path);

    if !exe_path.exists() {
        return Err(CommandError::LaunchFailure(format!(
            "Executable does not exist: {}",
            exe_path.to_string_lossy()
        )));
    }

    let use_locale_emulator = vn.use_locale_emulator && settings.use_locale_emulator;

    let launch_options_string = vn.launch_options.unwrap_or_default();
    let launch_options = shell_words::split(&launch_options_string)
        .map_err(|e| CommandError::LaunchFailure(format!("Invalid launch options: {e}")))?;

    let locale_exe_path = settings.locale_emulator_executable_path.map(PathBuf::from);
    let locale_option_string = settings.locale_emulator_launch_options.unwrap_or_default();
    let locale_launch_options = shell_words::split(&locale_option_string)
        .map_err(|e| CommandError::LaunchFailure(format!("Invalid launch options: {e}")))?;

    let mut child = if let Some(locale_exe_path) = locale_exe_path {
        if use_locale_emulator {
            if !locale_exe_path.exists() {
                return Err(CommandError::LaunchFailure(format!(
                    "Locale emulator executable does not exist: {}",
                    locale_exe_path.to_string_lossy()
                )));
            }

            Command::new(&locale_exe_path)
                .args(&locale_launch_options)
                .arg(exe_path)
                .args(&launch_options)
                .spawn()?
        } else {
            Command::new(exe_path).args(&launch_options).spawn()?
        }
    } else {
        Command::new(exe_path).args(&launch_options).spawn()?
    };

    let pid = child.id();

    thread::spawn(move || {
        let start_timestamp = Timestamp::now();

        let _ = child.wait();

        let end_timestamp = Timestamp::now();

        let duration_seconds = (end_timestamp.0 / 1000) - (start_timestamp.0 / 1000);
        let new_total_seconds = duration_seconds + vn.playtime;

        if update(visual_novels::table.find(&vn.id))
            .set((
                visual_novels::playtime.eq(new_total_seconds),
                visual_novels::last_time_played_at.eq(end_timestamp),
            ))
            .execute(&mut conn)
            .is_ok()
        {
            let new_play_session = PlaySessionEntity {
                id: nanoid!(),
                visual_novel_id: vn.id.clone(),
                started_time: start_timestamp,
                ended_time: end_timestamp,
                duration_seconds,
            };

            insert_into(play_sessions::table)
                .values(new_play_session)
                .execute(&mut conn)
                .ok();
        }

        let _ = GameClosed {
            pid,
            vn_id: vn.id,
            playtime: new_total_seconds,
            last_time_played_at: end_timestamp,
        }
        .emit(&app_handle);
    });

    Ok(pid)
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn util_close_visual_novel(_state: AppState<'_>, pid: u32) -> CommandResult<()> {
    #[cfg(target_os = "windows")]
    {
        Command::new("taskkill")
            .args(["/F", "/PID", &pid.to_string(), "/T"])
            .spawn()?;
    }

    #[cfg(not(target_os = "windows"))]
    {
        Command::new("kill")
            .args(["-9", &pid.to_string()])
            .spawn()?;
    }

    Ok(())
}

// #[tauri::command]
// #[auto_collect_command]
// #[specta::specta]
// pub async fn util_(state: AppState<'_>) -> CommandResult<()> {
//     todo!()
// }
