use super::prelude::*;
use crate::utils::fs::resolve_cover_path;
use diesel::insert_into;

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn create_visual_novel(
    state: AppState<'_>,
    payload: CreateVisualNovelRequest,
) -> CommandResult<VisualNovel> {
    let mut conn = state.pool.get()?;

    let dir_path: String = payload.dir_path.trim().into();
    let cover_path: Option<String> = resolve_cover_path(payload.cover_path, dir_path.clone());

    let mut new_vn = VisualNovelEntity::new(
        payload.title.clone(),
        dir_path.clone(),
        payload.executable_path.trim().into(),
    );

    new_vn.description = payload.description.map(|s| s.trim().into());
    new_vn.cover_path = cover_path;
    new_vn.playtime = payload.playtime;
    new_vn.status = payload.status.unwrap_or_default();
    new_vn.notes = payload.notes.map(|s| s.trim().into());
    new_vn.launch_options = payload.launch_options.map(|s| s.trim().into());

    insert_into(visual_novels::table)
        .values(&new_vn)
        .execute(&mut conn)?;

    for tag_id in payload.tag_ids {
        insert_into(visual_novels_tags::table)
            .values((
                visual_novels_tags::visual_novel_id.eq(&new_vn.id),
                visual_novels_tags::tag_id.eq(&tag_id),
            ))
            .execute(&mut conn)?;
    }

    let tags = VisualNovelTagEntity::belonging_to(&new_vn)
        .inner_join(tags::table)
        .select(TagEntity::as_select())
        .load::<TagEntity>(&mut conn)?;

    let vn = VisualNovel::from_db(new_vn, tags);

    Ok(vn)
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn create_tag(
    state: AppState<'_>,
    payload: CreateTagRequest,
) -> CommandResult<TagWithVisualNovels> {
    let mut conn = state.pool.get()?;

    let new_tag = TagEntity::new(payload.name);

    let inserted_tag = insert_into(tags::table)
        .values(&new_tag)
        .get_result::<TagEntity>(&mut conn)?;

    Ok(TagWithVisualNovels {
        tag: Tag::from_db(inserted_tag),
        visual_novels: Vec::new(),
    })
}

// #[tauri::command]
// #[auto_collect_command]
// #[specta::specta]
// pub async fn create_(state: AppState<'_>) -> CommandResult<()> {
//     todo!()
// }
