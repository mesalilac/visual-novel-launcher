use super::prelude::*;
use diesel::insert_into;
use nanoid::nanoid;

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn create_visual_novel(
    state: AppState<'_>,
    payload: CreateVisualNovelRequest,
) -> CommandResult<VisualNovel> {
    use schema::tags::dsl as tag_dsl;
    use schema::visual_novels::dsl as vn_dsl;
    use schema::visual_novels_tags::dsl as vn_tag_dsl;

    let mut conn = state.pool.get()?;

    let new_vn = VisualNovelEntity {
        id: nanoid!(),
        title: payload.title.trim().into(),
        description: payload.description.map(|s| s.trim().into()),
        cover_path: payload.cover_path.map(|s| s.trim().into()),
        playtime: payload.playtime,
        last_time_played_at: None,
        status: payload.status.unwrap_or_default(),
        is_favorite: false,
        notes: payload.notes.map(|s| s.trim().into()),
        dir_path: payload.dir_path.trim().into(),
        executable_path: payload.executable_path.trim().into(),
        launch_options: payload.launch_options.map(|s| s.trim().into()),
        is_missing: false,
        use_locale_emulator: true,
        created_at: Timestamp::now(),
    };

    insert_into(vn_dsl::visual_novels)
        .values(&new_vn)
        .execute(&mut conn)?;

    for tag_id in payload.tag_ids {
        insert_into(vn_tag_dsl::visual_novels_tags)
            .values((
                vn_tag_dsl::visual_novel_id.eq(&new_vn.id),
                vn_tag_dsl::tag_id.eq(&tag_id),
            ))
            .execute(&mut conn)?;
    }

    let tags = VisualNovelTagEntity::belonging_to(&new_vn)
        .inner_join(tag_dsl::tags)
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
    use schema::tags::dsl as tag_dsl;

    let mut conn = state.pool.get()?;

    let new_tag = TagEntity {
        id: nanoid!(),
        name: payload.name.trim().into(),
        created_at: Timestamp::now(),
    };

    let inserted_tag = insert_into(tag_dsl::tags)
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
