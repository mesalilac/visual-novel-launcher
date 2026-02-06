use super::prelude::*;
use diesel::{
    dsl::{exists, select},
    insert_into,
};
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
        title: payload.title,
        description: payload.description,
        cover_path: payload.cover_path,
        playtime: payload.playtime,
        last_time_played_at: None,
        status: payload.status.unwrap_or_default(),
        dir_path: payload.dir_path,
        executable_path: payload.executable_path,
        launch_options: payload.launch_options,
        is_missing: false,
        created_at: Timestamp::now(),
    };

    insert_into(vn_dsl::visual_novels)
        .values(&new_vn)
        .execute(&mut conn)?;

    for tag in payload.tags {
        let junction_exists = select(exists(
            vn_tag_dsl::visual_novels_tags.filter(
                vn_tag_dsl::visual_novel_id
                    .eq(&new_vn.id)
                    .and(vn_tag_dsl::tag_id.eq(&tag.id)),
            ),
        ))
        .get_result::<bool>(&mut conn)?;

        if !junction_exists {
            insert_into(vn_tag_dsl::visual_novels_tags)
                .values((
                    vn_tag_dsl::visual_novel_id.eq(&new_vn.id),
                    vn_tag_dsl::tag_id.eq(&tag.id),
                ))
                .execute(&mut conn)?;
        }
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
pub async fn create_tag(state: AppState<'_>, payload: CreateTagRequest) -> CommandResult<Tag> {
    use schema::tags::dsl as tag_dsl;

    let mut conn = state.pool.get()?;

    let new_tag = TagEntity {
        id: nanoid!(),
        name: payload.name,
        created_at: Timestamp::now(),
    };

    let tag_exists = select(exists(
        tag_dsl::tags.filter(tag_dsl::name.eq(&new_tag.name)),
    ))
    .get_result::<bool>(&mut conn)?;

    if !tag_exists {
        insert_into(tag_dsl::tags)
            .values(&new_tag)
            .execute(&mut conn)?;
    }

    Ok(Tag::from_db(new_tag))
}

// #[tauri::command]
// #[auto_collect_command]
// #[specta::specta]
// pub async fn create_(state: DbState<'_>) -> CommandResult<()> {
//     todo!()
// }
