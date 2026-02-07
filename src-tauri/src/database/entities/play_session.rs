use super::prelude::*;
use super::VisualNovelEntity;

#[derive(Queryable, Selectable, Insertable, Identifiable, Associations, Debug, Clone)]
#[diesel(belongs_to(VisualNovelEntity, foreign_key = visual_novel_id))]
#[diesel(table_name = play_sessions)]
#[diesel(primary_key(visual_novel_id))]
pub struct PlaySessionEntity {
    pub id: String,
    pub visual_novel_id: String,
    pub started_time: i64,
    pub ended_time: Option<i64>,
    pub duration_seconds: Option<i64>,
}
