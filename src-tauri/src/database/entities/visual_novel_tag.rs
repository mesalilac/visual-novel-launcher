use super::prelude::*;
use super::{Tag, VisualNovel};

#[derive(Queryable, Selectable, Insertable, Identifiable, Associations, Debug)]
#[diesel(belongs_to(VisualNovel))]
#[diesel(belongs_to(Tag))]
#[diesel(table_name = visual_novels_tags)]
#[diesel(primary_key(visual_novel_id, tag_id))]
pub struct VisualNovelTag {
    pub visual_novel_id: String,
    pub tag_id: String,
}
