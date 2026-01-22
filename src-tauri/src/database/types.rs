use diesel::backend::Backend;
use diesel::deserialize::{self, FromSql, FromSqlRow};
use diesel::expression::AsExpression;
use diesel::serialize::{self, Output, ToSql};
use diesel::sql_types::{BigInt, Text};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(TS, Serialize, Deserialize, Debug, Clone, Copy, PartialEq, AsExpression, FromSqlRow)]
#[ts(export)]
#[serde(transparent)]
#[diesel(sql_type = BigInt)]
pub struct Timestamp(pub i64);

impl Timestamp {
    pub fn now() -> Self {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("Failed to get current time");

        Self(timestamp.as_secs() as i64)
    }
}

impl<DB> ToSql<BigInt, DB> for Timestamp
where
    DB: Backend,
    i64: ToSql<BigInt, DB>,
{
    fn to_sql<'b>(&'b self, out: &mut Output<'b, '_, DB>) -> serialize::Result {
        ToSql::<BigInt, DB>::to_sql(&self.0, out)
    }
}

impl<DB> FromSql<BigInt, DB> for Timestamp
where
    DB: Backend,
    i64: FromSql<BigInt, DB>,
{
    fn from_sql(bytes: DB::RawValue<'_>) -> deserialize::Result<Self> {
        let val = i64::from_sql(bytes)?;
        Ok(Timestamp(val))
    }
}

#[derive(
    TS, Debug, Clone, PartialEq, AsExpression, FromSqlRow, serde::Serialize, serde::Deserialize,
)]
#[diesel(sql_type = Text)]
#[ts(export)]
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
