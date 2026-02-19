use crate::{bridge::dto::Tag, database::types::VisualNovelStatus};
use serde::{Deserialize, Serialize};

#[derive(specta::Type, Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateVisualNovelRequest {
    #[specta(optional)]
    #[serde(default)]
    pub title: Option<String>,
    #[specta(optional)]
    #[serde(default)]
    pub description: Option<String>,
    #[specta(optional)]
    #[serde(default)]
    pub cover_path: Option<String>,
    #[specta(optional)]
    #[serde(default)]
    pub playtime: Option<i64>,
    #[specta(optional)]
    #[serde(default)]
    pub status: Option<VisualNovelStatus>,
    #[specta(optional)]
    #[serde(default)]
    pub is_favorite: Option<bool>,
    #[specta(optional)]
    #[serde(default)]
    pub notes: Option<String>,
    #[specta(optional)]
    #[serde(default)]
    pub executable_path: Option<String>,
    #[specta(optional)]
    #[serde(default)]
    pub launch_options: Option<String>,
    #[specta(optional)]
    #[serde(default)]
    pub use_locale_emulator: Option<bool>,
    #[specta(optional)]
    #[serde(default)]
    pub tag_ids: Vec<String>,
}

#[derive(specta::Type, Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTagRequest {
    pub name: String,
}

#[derive(specta::Type, Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSettingsRequest {
    pub library_path: Option<String>,
    pub use_locale_emulator: Option<bool>,
    pub locale_emulator_executable_path: Option<String>,
    pub locale_emulator_launch_options: Option<String>,
}

#[derive(specta::Type, Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateVisualNovelRequest {
    pub title: String,
    pub description: Option<String>,
    pub cover_path: Option<String>,
    pub playtime: i64,
    pub is_favorite: bool,
    pub notes: Option<String>,
    pub dir_path: String,
    pub status: Option<VisualNovelStatus>,
    pub executable_path: String,
    pub launch_options: Option<String>,
    pub use_locale_emulator: bool,
    pub tags: Vec<Tag>,
}

#[derive(specta::Type, Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTagRequest {
    pub name: String,
}

// #[derive(TS, Debug, Clone, Deserialize, Serialize)]
// #[ts(export)]
// #[serde(rename_all = "camelCase")]
// pub struct Request;
