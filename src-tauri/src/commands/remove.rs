use super::prelude::*;
use diesel::delete;

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn remove_visual_novel_by_id(state: AppState<'_>, id: String) -> CommandResult<()> {
    use schema::visual_novels::dsl as vn_dsl;

    let mut conn = state.pool.get()?;

    delete(vn_dsl::visual_novels.find(&id)).execute(&mut conn)?;

    Ok(())
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn remove_tag_by_id(state: AppState<'_>, id: String) -> CommandResult<()> {
    use schema::tags::dsl as tag_dsl;

    let mut conn = state.pool.get()?;

    delete(tag_dsl::tags.find(&id)).execute(&mut conn)?;

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
    use schema::visual_novels_tags::dsl as vn_tag_dsl;

    let mut conn = state.pool.get()?;

    delete(
        vn_tag_dsl::visual_novels_tags.filter(
            vn_tag_dsl::tag_id
                .eq(&tag_id)
                .and(vn_tag_dsl::visual_novel_id.eq(&visual_novel_id)),
        ),
    )
    .execute(&mut conn)?;

    Ok(())
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn remove_all_visual_novels(state: AppState<'_>) -> CommandResult<Vec<VisualNovel>> {
    use schema::tags::dsl as tag_dsl;
    use schema::visual_novels::dsl as vn_dsl;

    let mut conn = state.pool.get()?;

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

    delete(vn_dsl::visual_novels).execute(&mut conn)?;

    Ok(data)
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn remove_all_tags(state: AppState<'_>) -> CommandResult<Vec<Tag>> {
    use schema::tags::dsl as tag_dsl;

    let mut conn = state.pool.get()?;

    let tags = tag_dsl::tags.load::<TagEntity>(&mut conn)?;

    let data = tags.into_iter().map(Tag::from_db).collect();

    delete(tag_dsl::tags).execute(&mut conn)?;

    Ok(data)
}

// #[tauri::command]
// #[auto_collect_command]
// #[specta::specta]
// pub async fn remove_(state: AppState<'_>) -> CommandResult<()> {
//     todo!()
// }
