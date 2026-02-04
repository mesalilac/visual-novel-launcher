use super::prelude::*;
use crate::APP_SETTINGS_ID;
use diesel::{insert_into, update};

#[derive(Debug, Clone, Serialize, AsChangeset)]
#[diesel(table_name = schema::visual_novels)]
struct VisualNovelChangeset {
    pub title: Option<String>,
    pub description: Option<String>,
    pub cover_path: Option<String>,
    pub playtime: Option<i64>,
    pub status: Option<VisualNovelStatus>,
    pub executable_path: Option<String>,
    pub launch_options: Option<String>,
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn update_visual_novel(
    state: DbState<'_>,
    id: String,
    payload: UpdateVisualNovelRequest,
) -> CommandResult<VisualNovel> {
    use schema::tags::dsl as tag_dsl;
    use schema::visual_novels::dsl as vn_dsl;
    use schema::visual_novels_tags::dsl as vn_tag_dsl;

    let mut conn = state.pool.get()?;

    let vn_changeset = VisualNovelChangeset {
        title: payload.title,
        description: payload.description,
        cover_path: payload.cover_path,
        playtime: payload.playtime,
        status: payload.status,
        executable_path: payload.executable_path,
        launch_options: payload.launch_options,
    };

    let vn_entity = update(vn_dsl::visual_novels.find(&id))
        .set(&vn_changeset)
        .get_result::<VisualNovelEntity>(&mut conn)?;

    for tag in payload.tag_ids {
        let tag_exists = vn_tag_dsl::visual_novels_tags
            .filter(
                vn_tag_dsl::visual_novel_id
                    .eq(&id)
                    .and(vn_tag_dsl::tag_id.eq(&tag)),
            )
            .count()
            .get_result::<i64>(&mut conn)?;

        if tag_exists > 0 {
            continue;
        }

        let new_tag_junction = VisualNovelTagEntity {
            visual_novel_id: id.clone(),
            tag_id: tag,
        };

        insert_into(vn_tag_dsl::visual_novels_tags)
            .values(&new_tag_junction)
            .execute(&mut conn)?;
    }

    let tags = VisualNovelTagEntity::belonging_to(&vn_entity)
        .inner_join(tag_dsl::tags)
        .select(TagEntity::as_select())
        .load::<TagEntity>(&mut conn)?;

    let vn = VisualNovel::from_db(vn_entity, tags);

    Ok(vn)
}

#[derive(Debug, Clone, Serialize, AsChangeset)]
#[diesel(table_name = schema::tags)]
struct TagChangeset {
    pub name: String,
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn update_tag(
    state: DbState<'_>,
    id: String,
    payload: UpdateTagRequest,
) -> CommandResult<Tag> {
    use schema::tags::dsl as tag_dsl;

    let mut conn = state.pool.get()?;

    let tag_changeset = TagChangeset { name: payload.name };

    let tag_entity = update(tag_dsl::tags.find(&id))
        .set(&tag_changeset)
        .get_result::<TagEntity>(&mut conn)?;

    let tag = Tag::from_db(tag_entity);

    Ok(tag)
}

#[derive(Debug, Clone, Serialize, AsChangeset)]
#[diesel(table_name = schema::settings)]
struct SettingChangeset {
    pub library_path: Option<String>,
    pub locale_emulator_executable_path: Option<String>,
    pub locale_emulator_launch_options: Option<String>,
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn update_settings(
    state: DbState<'_>,
    payload: UpdateSettingsRequest,
) -> CommandResult<Setting> {
    use schema::settings::dsl as setting_dsl;

    let mut conn = state.pool.get()?;

    let setting_changeset = SettingChangeset {
        library_path: payload.library_path,
        locale_emulator_executable_path: payload.locale_emulator_executable_path,
        locale_emulator_launch_options: payload.locale_emulator_launch_options,
    };

    let setting_entity = update(setting_dsl::settings.find(APP_SETTINGS_ID))
        .set(&setting_changeset)
        .get_result::<SettingEntity>(&mut conn)?;

    let setting = Setting::from_db(setting_entity);

    Ok(setting)
}

// #[tauri::command]
// #[auto_collect_command]
// #[specta::specta]
// pub async fn update_(state: DbState<'_>) -> CommandResult<()> {
//     todo!()
// }
