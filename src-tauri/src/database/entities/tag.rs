use super::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(TS, Queryable, Selectable, Insertable, Identifiable, Serialize, Deserialize, Debug)]
#[diesel(table_name = tags)]
#[ts(export)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub created_at: i64,
}
