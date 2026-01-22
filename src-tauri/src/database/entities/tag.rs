use super::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable, Insertable, Identifiable, Serialize, Deserialize, Debug)]
#[diesel(table_name = tags)]
pub struct TagEntity {
    pub id: String,
    pub name: String,
    pub created_at: Timestamp,
}
