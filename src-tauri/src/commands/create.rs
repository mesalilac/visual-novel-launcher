use super::prelude::*;

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn create_visual_novel(
    state: DbState<'_>,
    payload: CreateVisualNovelRequest,
) -> CommandResult<VisualNovel> {
    todo!()
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn create_tag(state: DbState<'_>, payload: CreateTagRequest) -> CommandResult<Tag> {
    todo!()
}

// #[tauri::command]
// #[auto_collect_command]
// #[specta::specta]
// pub async fn create_(state: DbState<'_>) -> CommandResult<()> {
//     todo!()
// }
