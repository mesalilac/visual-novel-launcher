use crate::database::entities::Tag;
use crate::models::VisualNovel;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(TS, Serialize, Deserialize, Debug)]
#[ts(export)]
pub struct Tags {
    #[serde(flatten)]
    pub tag: Tag,
    pub visual_novels: Vec<VisualNovel>,
}
