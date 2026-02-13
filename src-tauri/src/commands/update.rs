use super::prelude::*;
use crate::utils::db::normalize_optional_string;
use crate::APP_SETTINGS_ID;
use diesel::{
    dsl::{exists, select},
    insert_into, update,
};

#[derive(Debug, Clone, Serialize, AsChangeset)]
#[diesel(table_name = schema::visual_novels)]
struct VisualNovelChangeset {
    pub title: Option<String>,
    #[diesel(treat_none_as_null = true)]
    pub description: Option<String>,
    #[diesel(treat_none_as_null = true)]
    pub cover_path: Option<String>,
    pub playtime: Option<i64>,
    pub status: Option<VisualNovelStatus>,
    pub is_favorite: Option<bool>,
    #[diesel(treat_none_as_null = true)]
    pub notes: Option<String>,
    pub executable_path: Option<String>,
    #[diesel(treat_none_as_null = true)]
    pub launch_options: Option<String>,
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn update_visual_novel(
    state: AppState<'_>,
    id: String,
    payload: UpdateVisualNovelRequest,
) -> CommandResult<VisualNovel> {
    use schema::tags::dsl as tag_dsl;
    use schema::visual_novels::dsl as vn_dsl;
    use schema::visual_novels_tags::dsl as vn_tag_dsl;

    let mut conn = state.pool.get()?;

    let vn_changeset = VisualNovelChangeset {
        title: payload.title.map(|s| s.trim().into()),
        description: normalize_optional_string(payload.description),
        cover_path: normalize_optional_string(payload.cover_path),
        playtime: payload.playtime,
        status: payload.status,
        is_favorite: payload.is_favorite,
        notes: normalize_optional_string(payload.notes),
        executable_path: payload.executable_path.map(|s| s.trim().into()),
        launch_options: normalize_optional_string(payload.launch_options),
    };

    let vn_entity = update(vn_dsl::visual_novels.find(&id))
        .set(&vn_changeset)
        .get_result::<VisualNovelEntity>(&mut conn)?;

    for tag in payload.tag_ids {
        let tag_exists = select(exists(
            vn_tag_dsl::visual_novels_tags.filter(
                vn_tag_dsl::visual_novel_id
                    .eq(&id)
                    .and(vn_tag_dsl::tag_id.eq(&tag)),
            ),
        ))
        .get_result::<bool>(&mut conn)?;

        if tag_exists {
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
    state: AppState<'_>,
    id: String,
    payload: UpdateTagRequest,
) -> CommandResult<Tag> {
    use schema::tags::dsl as tag_dsl;

    let mut conn = state.pool.get()?;

    let tag_changeset = TagChangeset {
        name: payload.name.trim().into(),
    };

    let tag_entity = update(tag_dsl::tags.find(&id))
        .set(&tag_changeset)
        .get_result::<TagEntity>(&mut conn)?;

    let tag = Tag::from_db(tag_entity);

    Ok(tag)
}

#[derive(Debug, Clone, Serialize, AsChangeset)]
#[diesel(table_name = schema::settings)]
struct SettingChangeset {
    #[diesel(treat_none_as_null = true)]
    pub library_path: Option<String>,
    pub use_locale_emulator: Option<bool>,
    #[diesel(treat_none_as_null = true)]
    pub locale_emulator_executable_path: Option<String>,
    #[diesel(treat_none_as_null = true)]
    pub locale_emulator_launch_options: Option<String>,
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn update_settings(
    state: AppState<'_>,
    payload: UpdateSettingsRequest,
) -> CommandResult<Setting> {
    use schema::settings::dsl as setting_dsl;

    let mut conn = state.pool.get()?;

    let setting_changeset = SettingChangeset {
        library_path: normalize_optional_string(payload.library_path),
        use_locale_emulator: payload.use_locale_emulator,
        locale_emulator_executable_path: normalize_optional_string(
            payload.locale_emulator_executable_path,
        ),
        locale_emulator_launch_options: normalize_optional_string(
            payload.locale_emulator_launch_options,
        ),
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
// pub async fn update_(state: AppState<'_>) -> CommandResult<()> {
//     todo!()
// }
