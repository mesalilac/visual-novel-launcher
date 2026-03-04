use super::prelude::*;
use super::VisualNovelEntity;

#[derive(Queryable, Selectable, Insertable, Identifiable, Associations, Debug, Clone)]
#[diesel(belongs_to(VisualNovelEntity, foreign_key = visual_novel_id))]
#[diesel(table_name = play_sessions)]
pub struct PlaySessionEntity {
    pub id: String,
    pub visual_novel_id: String,
    pub started_time: Timestamp,
    pub ended_time: Timestamp,
    pub duration_seconds: i64,
}

impl PlaySessionEntity {
    pub fn new(
        visual_novel_id: String,
        started_time: Timestamp,
        ended_time: Timestamp,
        duration_seconds: i64,
    ) -> Self {
        Self {
            id: nanoid!(),
            visual_novel_id,
            started_time,
            ended_time,
            duration_seconds,
        }
    }
}
