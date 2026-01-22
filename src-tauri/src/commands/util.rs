use super::prelude::*;

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn util_scan_library(state: DbState<'_>) -> CommandResult<Vec<VisualNovel>> {
    todo!()
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn util_sync_library(state: DbState<'_>) -> CommandResult<Vec<VisualNovel>> {
    todo!()
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn util_launch_visual_novel(state: DbState<'_>, id: String) -> CommandResult<()> {
    todo!()
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn util_close_visual_novel(state: DbState<'_>, id: String) -> CommandResult<()> {
    todo!()
}

// #[tauri::command]
// #[auto_collect_command]
// #[specta::specta]
// pub async fn util_(state: DbState<'_>) -> CommandResult<()> {
//     todo!()
// }
