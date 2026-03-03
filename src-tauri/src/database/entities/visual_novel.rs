use super::prelude::*;

#[derive(Queryable, Selectable, Insertable, Identifiable, Debug, Clone)]
#[diesel(table_name = visual_novels)]
pub struct VisualNovelEntity {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub cover_path: Option<String>,
    pub playtime: i64,
    pub last_time_played_at: Option<Timestamp>,
    pub status: VisualNovelStatus,
    pub is_favorite: bool,
    pub notes: Option<String>,
    pub dir_path: String,
    pub executable_path: String,
    pub launch_options: Option<String>,
    pub is_missing: bool,
    pub use_locale_emulator: bool,
    pub created_at: Timestamp,
}

impl VisualNovelEntity {
    pub fn new(title: String, dir_path: String, executable_path: String) -> Self {
        Self {
            id: nanoid!(),
            title: title.trim().titlecase(),
            description: None,
            cover_path: None,
            playtime: 0,
            last_time_played_at: None,
            status: VisualNovelStatus::default(),
            is_favorite: false,
            notes: None,
            dir_path: dir_path.trim().into(),
            executable_path: executable_path.trim().into(),
            launch_options: None,
            is_missing: false,
            use_locale_emulator: true,
            created_at: Timestamp::now(),
        }
    }
}
