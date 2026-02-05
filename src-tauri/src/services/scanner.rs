use crate::database::{
    entities::VisualNovelEntity,
    types::{Timestamp, VisualNovelStatus},
};
use crate::schema::visual_novels::dsl as vn_dsl;
use diesel::dsl::{exists, select};
use diesel::prelude::*;
use diesel::SqliteConnection;
use std::{collections::HashSet, path::Path};
use walkdir::WalkDir;

pub fn scan_library(
    conn: &mut SqliteConnection,
    library_path: String,
) -> Result<Vec<VisualNovelEntity>, diesel::result::Error> {
    let mut visual_novels: Vec<VisualNovelEntity> = Vec::new();

    let image_extensions: HashSet<&str> = ["png", "jpg", "jpeg", "webp"].iter().cloned().collect();

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
            .find(|e| {
                e.path()
                    .extension()
                    .and_then(|s| s.to_str())
                    .map_or(false, |ext| ext.to_lowercase().as_str() == "exe")
            })
        else {
            continue;
        };

        let cover_image_path = WalkDir::new(entry.path())
            .min_depth(1)
            .max_depth(1)
            .into_iter()
            .filter_map(|e| e.ok())
            .find(|e| {
                e.path()
                    .extension()
                    .and_then(|s| s.to_str())
                    .map_or(false, |ext| {
                        image_extensions.contains(ext.to_lowercase().as_str())
                    })
            });

        let vn = VisualNovelEntity {
            id: nanoid::nanoid!(),
            title: entry.file_name().to_string_lossy().into_owned(),
            description: None,
            cover_path: cover_image_path.map(|p| p.path().to_string_lossy().to_string()),
            playtime: 0,
            last_time_played_at: None,
            status: VisualNovelStatus::Backlog,
            dir_path: entry.path().to_string_lossy().to_string(),
            executable_path: exe_path.path().to_string_lossy().to_string(),
            launch_options: None,
            is_missing: false,
            created_at: Timestamp::now(),
        };

        let vn_exists = select(exists(
            vn_dsl::visual_novels.filter(vn_dsl::dir_path.eq(&vn.dir_path)),
        ))
        .get_result::<bool>(conn)?;

        if !vn_exists {
            let new_vn = diesel::insert_into(vn_dsl::visual_novels)
                .values(vn)
                .returning(VisualNovelEntity::as_returning())
                .get_result(conn)?;

            visual_novels.push(new_vn);
        }
    }

    Ok(visual_novels)
}

pub fn sync_library(conn: &mut SqliteConnection) -> Result<(), diesel::result::Error> {
    let vns = vn_dsl::visual_novels.load::<VisualNovelEntity>(conn)?;

    conn.transaction(|conn| {
        for vn in vns {
            let path_exists = Path::new(&vn.dir_path).exists();

            if path_exists != !vn.is_missing {
                let new_missing_status = !path_exists;

                let result = diesel::update(vn_dsl::visual_novels.find(&vn.id))
                    .set(vn_dsl::is_missing.eq(new_missing_status))
                    .execute(conn);

                match result {
                    Ok(_) => {
                        if new_missing_status {
                            log::warn!(
                            "library sync: visual novel is marked as missing, id: {:?}, path: {:?}",
                            vn.id,
                            vn.dir_path
                        )
                        } else {
                            log::info!(
                            "library sync: visual novel is marked as found, id: {:?}, path: {:?}",
                            vn.id,
                            vn.dir_path
                        )
                        }
                    }
                    Err(e) => {
                        log::error!(
                            "library sync: Failed to update visual novel 'is_missing' vn {:?}: {e}",
                            vn.title,
                        )
                    }
                }
            }
        }

        Ok(())
    })
}
