use super::prelude::*;

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn update_visual_novel(
    state: DbState<'_>,
    payload: UpdateVisualNovelRequest,
) -> CommandResult<VisualNovel> {
    todo!()
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn update_tag(state: DbState<'_>, payload: UpdateTagRequest) -> CommandResult<Tag> {
    todo!()
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn update_settings(
    state: DbState<'_>,
    payload: UpdateSettingsRequest,
) -> CommandResult<Setting> {
    todo!()
}

// #[tauri::command]
// #[auto_collect_command]
// #[specta::specta]
// pub async fn update_(state: DbState<'_>) -> CommandResult<()> {
//     todo!()
// }
