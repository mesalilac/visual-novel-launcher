use super::prelude::*;

#[derive(Queryable, Selectable, Insertable, Identifiable, Debug, Clone)]
#[diesel(table_name = settings)]
pub struct SettingEntity {
    pub id: i32,
    pub library_path: Option<String>,
    pub locale_emulator_executable_path: Option<String>,
    pub locale_emulator_launch_options: Option<String>,
}
