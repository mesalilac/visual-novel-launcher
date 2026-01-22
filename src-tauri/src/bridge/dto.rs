use crate::database::{
    entities::{SettingEntity, TagEntity, VisualNovelEntity},
    types::{Timestamp, VisualNovelStatus},
};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(TS, Serialize, Deserialize, Debug, Clone)]
#[ts(export)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub created_at: Timestamp,
}

impl Tag {
    pub fn from_db(entity: TagEntity) -> Self {
        Self {
            id: entity.id,
            name: entity.name,
            created_at: entity.created_at,
        }
    }
}

#[derive(TS, Serialize, Deserialize, Debug, Clone)]
#[ts(export)]
#[serde(rename_all = "camelCase")]
pub struct TagWithVisualNovels {
    #[serde(flatten)]
    pub tag: Tag,
    pub visual_novels: Vec<VisualNovel>,
}

impl TagWithVisualNovels {
    pub fn from_db(
        entity: TagEntity,
        vn_entities: Vec<(VisualNovelEntity, Vec<TagEntity>)>,
    ) -> Self {
        Self {
            tag: Tag::from_db(entity),
            visual_novels: vn_entities
                .into_iter()
                .map(|(vn, tags)| VisualNovel::from_db(vn, tags))
                .collect(),
        }
    }
}

#[derive(TS, Serialize, Deserialize, Debug, Clone)]
#[ts(export)]
#[serde(rename_all = "camelCase")]
pub struct VisualNovel {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub cover_path: Option<String>,
    pub playtime: i64,
    pub last_time_played_at: Option<Timestamp>,
    pub status: VisualNovelStatus,
    pub dir_path: String,
    pub executable_path: String,
    pub launch_options: Option<String>,
    pub is_missing: bool,
    pub created_at: Timestamp,
    pub tags: Vec<Tag>,
}

impl VisualNovel {
    pub fn from_db(entity: VisualNovelEntity, tags_entity: Vec<TagEntity>) -> Self {
        Self {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            cover_path: entity.cover_path,
            playtime: entity.playtime,
            last_time_played_at: entity.last_time_played_at,
            status: entity.status,
            dir_path: entity.dir_path,
            executable_path: entity.executable_path,
            launch_options: entity.launch_options,
            is_missing: entity.is_missing,
            created_at: entity.created_at,
            tags: tags_entity.into_iter().map(|e| Tag::from_db(e)).collect(),
        }
    }
}

#[derive(TS, Serialize, Deserialize, Debug, Clone)]
#[ts(export)]
#[serde(rename_all = "camelCase")]
pub struct Setting {
    pub id: i32,
    pub library_path: Option<String>,
    pub locale_emulator_executable_path: Option<String>,
    pub locale_emulator_launch_options: Option<String>,
}

impl Setting {
    pub fn from_db(entity: SettingEntity) -> Self {
        Self {
            id: entity.id,
            library_path: entity.library_path,
            locale_emulator_executable_path: entity.locale_emulator_executable_path,
            locale_emulator_launch_options: entity.locale_emulator_launch_options,
        }
    }
}

#[derive(TS, Serialize, Deserialize, Debug, Clone)]
#[ts(export)]
#[serde(rename_all = "camelCase")]
pub struct GeneralStats {
    pub last_played_at: Option<Timestamp>,
    pub total_playtime: i64,

    pub visual_novel_count: i64,
    pub tag_count: i64,
    pub unplayed_count: i64,
    pub playing_count: i64,
    pub finished_count: i64,
    pub backlog_count: i64,
    pub dropped_count: i64,
}
