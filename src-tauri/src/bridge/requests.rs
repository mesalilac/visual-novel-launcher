use crate::{bridge::dto::Tag, database::entities::VisualNovelStatus};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
#[serde(rename_all = "camelCase")]
pub struct UpdateVisualNovelRequest {
    pub id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub cover_path: Option<String>,
    pub playtime: Option<i64>,
    pub status: Option<VisualNovelStatus>,
    pub executable_path: Option<String>,
    pub launch_options: Option<String>,
    pub tag_ids: Vec<String>,
}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTagRequest {
    id: String,
    name: String,
}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSettingsRequest {
    pub library_path: Option<String>,
    pub locale_emulator_executable_path: Option<String>,
    pub locale_emulator_launch_options: Option<String>,
}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
#[serde(rename_all = "camelCase")]
pub struct CreateVisualNovelRequest {
    pub title: String,
    pub description: Option<String>,
    pub cover_path: Option<String>,
    pub playtime: i64,
    pub dir_path: String,
    pub status: Option<VisualNovelStatus>,
    pub executable_path: String,
    pub launch_options: Option<String>,
    pub tags: Vec<Tag>,
}

#[derive(TS, Debug, Clone, Deserialize, Serialize)]
#[ts(export)]
#[serde(rename_all = "camelCase")]
pub struct CreateTagRequest {
    pub name: String,
}

// #[derive(TS, Debug, Clone, Deserialize, Serialize)]
// #[ts(export)]
// #[serde(rename_all = "camelCase")]
// pub struct Request;
