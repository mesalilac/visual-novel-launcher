use super::prelude::*;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(TS, Serialize, Deserialize, Queryable, Selectable, Insertable, Identifiable, Debug)]
#[diesel(table_name = settings)]
pub struct SettingEntity {
    pub id: i32,
    pub library_path: Option<String>,
    pub locale_emulator_executable_path: Option<String>,
    pub locale_emulator_launch_options: Option<String>,
}
