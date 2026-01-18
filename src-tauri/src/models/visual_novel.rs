use crate::database::entities::{Tag, VisualNovelStatus};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export)]
pub struct VisualNovel {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub cover_path: Option<String>,
    pub playtime: i64,
    pub last_time_played_at: Option<i64>,
    pub status: VisualNovelStatus,
    pub dir_path: String,
    pub executable_path: String,
    pub launch_options: Option<String>,
    pub tags: Vec<Tag>,
    pub created_at: i64,
}
