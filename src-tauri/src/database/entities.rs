use crate::schema::*;
use diesel::deserialize::{self, FromSql, FromSqlRow};
use diesel::expression::AsExpression;
use diesel::prelude::*;
use diesel::serialize::{self, Output, ToSql};
use diesel::sql_types::Text;

#[derive(Debug, PartialEq, AsExpression, FromSqlRow, serde::Serialize, serde::Deserialize)]
#[diesel(sql_type = Text)]
pub enum VisualNovelStatus {
    Backlog,
    Playing,
    Finished,
    Dropped,
}

impl<DB> ToSql<Text, DB> for VisualNovelStatus
where
    DB: diesel::backend::Backend,
    str: ToSql<Text, DB>,
{
    fn to_sql<'b>(&'b self, out: &mut Output<'b, '_, DB>) -> serialize::Result {
        match self {
            Self::Backlog => "Backlog".to_sql(out),
            Self::Playing => "Playing".to_sql(out),
            Self::Finished => "Finished".to_sql(out),
            Self::Dropped => "Dropped".to_sql(out),
        }
    }
}

impl<DB> FromSql<Text, DB> for VisualNovelStatus
where
    DB: diesel::backend::Backend,
    String: FromSql<Text, DB>,
{
    fn from_sql(
        bytes: <DB as diesel::backend::Backend>::RawValue<'_>,
    ) -> deserialize::Result<Self> {
        let s = String::from_sql(bytes)?;

        match s.as_str() {
            "Backlog" => Ok(Self::Backlog),
            "Playing" => Ok(Self::Playing),
            "Finished" => Ok(Self::Finished),
            "Dropped" => Ok(Self::Dropped),
            _ => Err("Unrecognized status variant".into()),
        }
    }
}

#[derive(Queryable, Selectable, Insertable, Identifiable, Debug)]
#[diesel(table_name = visual_novels)]
pub struct VisualNovel {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub cover_path: Option<String>,
    pub playtime: i64,
    pub last_time_played_at: Option<i64>,
    pub status: VisualNovelStatus,
    pub dir_path: String,
    pub executable_path: String,
    pub launch_options: Option<String>,
    pub created_at: i64,
}

#[derive(Queryable, Selectable, Insertable, Identifiable, Debug)]
#[diesel(table_name = tags)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub created_at: i64,
}

#[derive(Queryable, Selectable, Insertable, Identifiable, Associations, Debug)]
#[diesel(belongs_to(VisualNovel))]
#[diesel(belongs_to(Tag))]
#[diesel(table_name = visual_novels_tags)]
#[diesel(primary_key(visual_novel_id, tag_id))]
pub struct VisualNovelTag {
    pub visual_novel_id: String,
    pub tag_id: String,
}

#[derive(Queryable, Selectable, Insertable, Identifiable, Debug)]
#[diesel(table_name = settings)]
pub struct Setting {
    pub id: i32,
    pub library_path: Option<String>,
    pub locale_emulator_executable_path: Option<String>,
    pub locale_emulator_launch_options: Option<String>,
}
