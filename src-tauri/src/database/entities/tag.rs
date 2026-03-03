use super::prelude::*;

#[derive(Queryable, Selectable, Insertable, Identifiable, Debug, Clone)]
#[diesel(table_name = tags)]
pub struct TagEntity {
    pub id: String,
    pub name: String,
    pub created_at: Timestamp,
}

impl TagEntity {
    pub fn new(name: String) -> Self {
        Self {
            id: nanoid!(),
            name: name.trim().to_lowercase(),
            created_at: Timestamp::now(),
        }
    }
}
