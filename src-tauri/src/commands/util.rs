use super::prelude::*;
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
pub async fn util_open_folder(state: AppState<'_>, path: String) -> CommandResult<()> {
    tauri_plugin_opener::open_path(path, None::<&str>)?;

    Ok(())
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn util_launch_visual_novel(state: AppState<'_>, id: String) -> CommandResult<()> {
    todo!()
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn util_close_visual_novel(state: AppState<'_>, id: String) -> CommandResult<()> {
    todo!()
}

// #[tauri::command]
// #[auto_collect_command]
// #[specta::specta]
// pub async fn util_(state: AppState<'_>) -> CommandResult<()> {
//     todo!()
// }
