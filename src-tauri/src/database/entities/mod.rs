pub mod prelude {
    pub use crate::schema::*;
    pub use diesel::deserialize::{self, FromSql, FromSqlRow};
    pub use diesel::expression::AsExpression;
    pub use diesel::prelude::*;
    pub use diesel::serialize::{self, Output, ToSql};
    pub use diesel::sql_types::Text;
    pub use ts_rs::TS;
}

mod setting;
mod tag;
mod visual_novel;
mod visual_novel_tag;

pub use setting::*;
pub use tag::*;
pub use visual_novel::*;
pub use visual_novel_tag::*;
