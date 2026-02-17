use nanoid::nanoid;
use std::path::Path;
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
    use schema::settings::dsl as setting_dsl;
    use schema::tags::dsl as tag_dsl;
    use schema::visual_novels::dsl as vn_dsl;

    let mut conn = state.pool.get()?;

    let setting = setting_dsl::settings
        .find(APP_SETTINGS_ID)
        .first::<SettingEntity>(&mut conn)?;

    if let Some(library_path) = setting.library_path {
        let vn_entities = services::scanner::scan_library(&mut conn, library_path)?;

        let tags = VisualNovelTagEntity::belonging_to(&vn_entities)
            .inner_join(tag_dsl::tags)
            .select((VisualNovelTagEntity::as_select(), TagEntity::as_select()))
            .load::<(VisualNovelTagEntity, TagEntity)>(&mut conn)?;

        let data: Vec<VisualNovel> = tags
            .grouped_by(&vn_entities)
            .into_iter()
            .zip(vn_entities)
            .map(|(tags, vn)| VisualNovel::from_db(vn, tags.into_iter().map(|x| x.1).collect()))
            .collect();

        return Ok(data);
    }

    Err(CommandError::ScanFailure("Library path is not set".into()))
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn util_sync_library(state: AppState<'_>) -> CommandResult<Vec<VisualNovel>> {
    use schema::tags::dsl as tag_dsl;
    use schema::visual_novels::dsl as vn_dsl;

    let mut conn = state.pool.get()?;

    services::scanner::sync_library(&mut conn)?;

    let vns = vn_dsl::visual_novels.load::<VisualNovelEntity>(&mut conn)?;

    let tags = VisualNovelTagEntity::belonging_to(&vns)
        .inner_join(tag_dsl::tags)
        .select((VisualNovelTagEntity::as_select(), TagEntity::as_select()))
        .load::<(VisualNovelTagEntity, TagEntity)>(&mut conn)?;

    let data: Vec<VisualNovel> = tags
        .grouped_by(&vns)
        .into_iter()
        .zip(vns)
        .map(|(tags, vn)| VisualNovel::from_db(vn, tags.into_iter().map(|x| x.1).collect()))
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
    use schema::play_sessions;
    use schema::visual_novels;

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

    // TODO: use locale emulator is it's enabled on vn and in settings

    let mut child = Command::new(&exe_path).spawn()?;

    let pid = child.id();

    thread::spawn(move || {
        let start_timestamp = Timestamp::now();

        let _ = child.wait();

        let end_timestamp = Timestamp::now();

        let duration_seconds = (end_timestamp.0 / 1000) - (start_timestamp.0 / 1000);
        let new_total_seconds = duration_seconds + vn.playtime;

        if let Ok(_) = update(visual_novels::table.find(&vn.id))
            .set((
                visual_novels::playtime.eq(new_total_seconds),
                visual_novels::last_time_played_at.eq(end_timestamp),
            ))
            .execute(&mut conn)
        {
            let new_play_session = PlaySessionEntity {
                id: nanoid!(),
                visual_novel_id: vn.id,
                started_time: start_timestamp,
                ended_time: end_timestamp,
                duration_seconds: duration_seconds,
            };

            insert_into(play_sessions::table)
                .values(new_play_session)
                .execute(&mut conn)
                .ok();
        }

        let _ = GameClosed(pid).emit(&app_handle);
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
