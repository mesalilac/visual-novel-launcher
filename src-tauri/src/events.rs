use serde::{Deserialize, Serialize};

use crate::{bridge::dto::VisualNovel, database::types::Timestamp};

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type, tauri_specta::Event)]
pub struct GameClosed {
    pub pid: u32,
    pub vn_id: String,
    pub playtime: i64,
    pub last_time_played_at: Timestamp,
}

#[derive(Debug, Clone, Serialize, Deserialize, specta::Type, tauri_specta::Event)]
pub struct MetadataUpdated {
    pub vn: VisualNovel,
}
