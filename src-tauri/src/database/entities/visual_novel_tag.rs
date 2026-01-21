use super::prelude::*;
use super::{TagEntity, VisualNovelEntity};

#[derive(Queryable, Selectable, Insertable, Identifiable, Associations, Debug)]
#[diesel(belongs_to(VisualNovelEntity, foreign_key = visual_novel_id))]
#[diesel(belongs_to(TagEntity, foreign_key = tag_id))]
#[diesel(table_name = visual_novels_tags)]
#[diesel(primary_key(visual_novel_id, tag_id))]
pub struct VisualNovelTagEntity {
    pub visual_novel_id: String,
    pub tag_id: String,
}
