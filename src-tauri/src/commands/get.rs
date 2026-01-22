use super::prelude::*;

#[tauri::command]
pub async fn get_visual_novels(state: DbState<'_>) -> CommandResult<Vec<VisualNovel>> {
    todo!()
}

#[tauri::command]
pub async fn get_visual_novel_by_id(state: DbState<'_>, id: String) -> CommandResult<VisualNovel> {
    todo!()
}

#[tauri::command]
pub async fn get_tags(state: DbState<'_>) -> CommandResult<Vec<Tag>> {
    todo!()
}

#[tauri::command]
pub async fn get_tags_with_visual_novels(
    state: DbState<'_>,
) -> CommandResult<Vec<TagWithVisualNovels>> {
    todo!()
}

#[tauri::command]
pub async fn get_settings(state: DbState<'_>) -> CommandResult<Setting> {
    todo!()
}

#[tauri::command]
pub async fn get_stats(state: DbState<'_>) -> CommandResult<GeneralStats> {
    todo!()
}

// #[tauri::command]
// pub async fn get_(state: DbState<'_>) -> CommandResult<()> {
//     todo!()
// }
