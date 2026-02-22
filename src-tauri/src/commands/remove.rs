use super::prelude::*;
use diesel::delete;

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn remove_visual_novel_by_id(state: AppState<'_>, id: String) -> CommandResult<()> {
    let mut conn = state.pool.get()?;

    delete(visual_novels::table.find(&id)).execute(&mut conn)?;

    Ok(())
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn remove_tag_by_id(state: AppState<'_>, id: String) -> CommandResult<()> {
    let mut conn = state.pool.get()?;

    delete(tags::table.find(&id)).execute(&mut conn)?;

    Ok(())
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn remove_tag_from_visual_novel_by_id(
    state: AppState<'_>,
    visual_novel_id: String,
    tag_id: String,
) -> CommandResult<()> {
    let mut conn = state.pool.get()?;

    delete(
        visual_novels_tags::table.filter(
            visual_novels_tags::tag_id
                .eq(&tag_id)
                .and(visual_novels_tags::visual_novel_id.eq(&visual_novel_id)),
        ),
    )
    .execute(&mut conn)?;

    Ok(())
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn remove_all_visual_novels(state: AppState<'_>) -> CommandResult<Vec<VisualNovel>> {
    let mut conn = state.pool.get()?;

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

    delete(visual_novels::table).execute(&mut conn)?;

    Ok(data)
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn remove_all_tags(state: AppState<'_>) -> CommandResult<Vec<Tag>> {
    let mut conn = state.pool.get()?;

    let tags = tags::table.load::<TagEntity>(&mut conn)?;

    let data = tags.into_iter().map(Tag::from_db).collect();

    delete(tags::table).execute(&mut conn)?;

    Ok(data)
}

// #[tauri::command]
// #[auto_collect_command]
// #[specta::specta]
// pub async fn remove_(state: AppState<'_>) -> CommandResult<()> {
//     todo!()
// }
