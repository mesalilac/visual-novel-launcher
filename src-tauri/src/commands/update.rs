use super::prelude::*;
use crate::utils::db::normalize_optional_string;
use crate::utils::fs::resolve_cover_path;
use crate::APP_SETTINGS_ID;
use diesel::{associations::HasTable, dsl::delete, insert_into, update};

#[derive(Debug, Clone, Serialize, AsChangeset)]
#[diesel(table_name = visual_novels)]
struct VisualNovelChangeset {
    pub title: Option<String>,
    pub description: Option<String>,
    pub cover_path: Option<String>,
    pub playtime: Option<i64>,
    pub status: Option<VisualNovelStatus>,
    pub is_favorite: Option<bool>,
    pub notes: Option<String>,
    pub executable_path: Option<String>,
    pub use_locale_emulator: Option<bool>,
    pub launch_options: Option<String>,
}

impl VisualNovelChangeset {
    pub fn is_empty(&self) -> bool {
        self.title.is_none()
            && self.description.is_none()
            && self.cover_path.is_none()
            && self.playtime.is_none()
            && self.status.is_none()
            && self.is_favorite.is_none()
            && self.notes.is_none()
            && self.executable_path.is_none()
            && self.use_locale_emulator.is_none()
            && self.launch_options.is_none()
    }
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn update_visual_novel(
    state: AppState<'_>,
    id: String,
    payload: UpdateVisualNovelRequest,
) -> CommandResult<VisualNovel> {
    let mut conn = state.pool.get()?;

    let vn_dir_path = VisualNovelEntity::table()
        .find(&id)
        .get_result::<VisualNovelEntity>(&mut conn)?
        .dir_path;

    let cover_path: Option<String> = resolve_cover_path(payload.cover_path, vn_dir_path);

    let vn_changeset = VisualNovelChangeset {
        title: payload.title.map(|s| s.trim().into()),
        description: normalize_optional_string(payload.description),
        cover_path: normalize_optional_string(cover_path),
        playtime: payload.playtime,
        status: payload.status,
        is_favorite: payload.is_favorite,
        use_locale_emulator: payload.use_locale_emulator,
        notes: normalize_optional_string(payload.notes),
        executable_path: payload.executable_path.map(|s| s.trim().into()),
        launch_options: normalize_optional_string(payload.launch_options),
    };

    if !vn_changeset.is_empty() {
        update(visual_novels::table.find(&id))
            .set(&vn_changeset)
            .execute(&mut conn)?;
    }

    if let Some(tags) = payload.tag_ids {
        delete(visual_novels_tags::table.filter(visual_novels_tags::visual_novel_id.eq(&id)))
            .execute(&mut conn)?;

        for tag in tags {
            let new_tag_junction = VisualNovelTagEntity {
                visual_novel_id: id.clone(),
                tag_id: tag,
            };

            insert_into(visual_novels_tags::table)
                .values(&new_tag_junction)
                .execute(&mut conn)?;
        }
    }

    let vn_entity = visual_novels::table
        .find(&id)
        .select(VisualNovelEntity::as_select())
        .first::<VisualNovelEntity>(&mut conn)?;

    let tags = VisualNovelTagEntity::belonging_to(&vn_entity)
        .inner_join(tags::table)
        .select(TagEntity::as_select())
        .load::<TagEntity>(&mut conn)?;

    let vn = VisualNovel::from_db(vn_entity, tags);

    Ok(vn)
}

#[derive(Debug, Clone, Serialize, AsChangeset)]
#[diesel(table_name = tags)]
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
    let mut conn = state.pool.get()?;

    let tag_changeset = TagChangeset {
        name: payload.name.trim().into(),
    };

    let tag_entity = update(tags::table.find(&id))
        .set(&tag_changeset)
        .get_result::<TagEntity>(&mut conn)?;

    let tag = Tag::from_db(tag_entity);

    Ok(tag)
}

#[derive(Debug, Clone, Serialize, AsChangeset)]
#[diesel(table_name = settings)]
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

    let setting_entity = update(settings::table.find(APP_SETTINGS_ID))
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
