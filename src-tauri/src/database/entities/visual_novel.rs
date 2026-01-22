use super::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Queryable, Selectable, Insertable, Identifiable, Debug)]
#[diesel(table_name = visual_novels)]
pub struct VisualNovelEntity {
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
}
