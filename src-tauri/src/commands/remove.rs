use super::prelude::*;

#[tauri::command]
pub async fn remove_visual_novel_by_id(state: DbState<'_>, id: String) -> CommandResult<()> {
    todo!()
}

#[tauri::command]
pub async fn remove_tag_by_id(state: DbState<'_>, id: String) -> CommandResult<()> {
    todo!()
}

#[tauri::command]
pub async fn remove_tag_from_visual_novel_by_id(
    state: DbState<'_>,
    visual_novel_id: String,
    tag_id: String,
) -> CommandResult<()> {
    todo!()
}

#[tauri::command]
pub async fn remove_all_visual_novels(state: DbState<'_>) -> CommandResult<Vec<VisualNovel>> {
    todo!()
}

#[tauri::command]
pub async fn remove_tags(state: DbState<'_>) -> CommandResult<Vec<Tag>> {
    todo!()
}

// #[tauri::command]
// pub async fn remove_(state: DbState<'_>) -> CommandResult<()> {
//     todo!()
// }
