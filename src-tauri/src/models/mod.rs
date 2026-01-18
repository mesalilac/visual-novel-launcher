// shared structs between backend and frontend

mod tags;
mod visual_novel;

pub use crate::database::entities::{Setting, Tag};
pub use tags::Tags;
pub use visual_novel::VisualNovel;
