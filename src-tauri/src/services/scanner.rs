use crate::database::entities::{VisualNovelEntity, VisualNovelStatus};
use diesel::SqliteConnection;
use walkdir::WalkDir;

fn visual_novel_exists(conn: &mut SqliteConnection, target_path: &String) -> bool {
    use crate::schema::visual_novels::dsl::*;
    use diesel::dsl::{exists, select};
    use diesel::prelude::*;

    let is_exists =
        select(exists(visual_novels.filter(dir_path.eq(target_path)))).get_result::<bool>(conn);

    is_exists.unwrap_or(false)
}

pub fn scan_library(conn: &mut SqliteConnection, library_path: String) -> Vec<VisualNovelEntity> {
    let mut visual_novels: Vec<VisualNovelEntity> = Vec::new();

    let entries = WalkDir::new(library_path)
        .min_depth(1)
        .max_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_dir());

    for entry in entries {
        let Some(exe_path) = WalkDir::new(entry.path())
            .min_depth(1)
            .max_depth(1)
            .into_iter()
            .filter_map(|e| e.ok())
            .find(|e| e.path().extension().map_or(false, |ext| ext == "exe"))
        else {
            continue;
        };

        let Ok(created_at) = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH)
        else {
            log::error!("Failed to get current time");
            std::process::exit(1);
        };

        let vn = VisualNovelEntity {
            id: nanoid::nanoid!(),
            title: entry.file_name().to_string_lossy().into_owned(),
            description: None,
            cover_path: None,
            playtime: 0,
            last_time_played_at: None,
            status: VisualNovelStatus::Backlog,
            dir_path: entry.path().to_string_lossy().to_string(),
            executable_path: exe_path.path().to_string_lossy().to_string(),
            launch_options: None,
            is_missing: false,
            created_at: created_at.as_secs() as i64,
        };

        if !visual_novel_exists(conn, &vn.dir_path) {
            visual_novels.push(vn);
        }
    }

    visual_novels
}
