// @generated automatically by Diesel CLI.

diesel::table! {
    use diesel::sql_types::*;
    use crate::database::entities::*;

    settings (id) {
        id -> Integer,
        library_path -> Nullable<Text>,
        locale_emulator_executable_path -> Nullable<Text>,
        locale_emulator_launch_options -> Nullable<Text>,
    }
}

diesel::table! {
    use diesel::sql_types::*;
    use crate::database::entities::*;

    tags (id) {
        id -> Text,
        name -> Text,
        created_at -> BigInt,
    }
}

diesel::table! {
    use diesel::sql_types::*;
    use crate::database::entities::*;

    visual_novels (id) {
        id -> Text,
        title -> Text,
        description -> Nullable<Text>,
        cover_path -> Nullable<Text>,
        playtime -> BigInt,
        last_time_played_at -> Nullable<BigInt>,
        status -> Text,
        dir_path -> Text,
        executable_path -> Text,
        launch_options -> Nullable<Text>,
        created_at -> BigInt,
    }
}

diesel::table! {
    use diesel::sql_types::*;
    use crate::database::entities::*;

    visual_novels_tags (visual_novel_id, tag_id) {
        visual_novel_id -> Text,
        tag_id -> Text,
    }
}

diesel::joinable!(visual_novels_tags -> tags (tag_id));
diesel::joinable!(visual_novels_tags -> visual_novels (visual_novel_id));

diesel::allow_tables_to_appear_in_same_query!(settings, tags, visual_novels, visual_novels_tags,);
