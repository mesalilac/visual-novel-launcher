pub mod prelude {
    pub use crate::database::types::*;
    pub use crate::schema::*;
    pub use diesel::prelude::*;
}

mod setting;
mod tag;
mod visual_novel;
mod visual_novel_tag;

pub use setting::*;
pub use tag::*;
pub use visual_novel::*;
pub use visual_novel_tag::*;
