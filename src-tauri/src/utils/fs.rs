use crate::APP_NAME;
use nanoid::nanoid;
use std::path::PathBuf;

#[allow(dead_code)]
pub fn get_cache_dir() -> PathBuf {
    let cache_dir = directories::BaseDirs::new()
        .expect("Failed to get base dir")
        .cache_dir()
        .join(APP_NAME);

    if !cache_dir.exists() {
        std::fs::create_dir_all(&cache_dir).expect("Failed to create cache dir");
    }

    cache_dir
}

pub fn get_app_data_dir() -> PathBuf {
    let app_data_dir = directories::BaseDirs::new()
        .expect("Failed to get base dir")
        .data_local_dir()
        .join(APP_NAME);

    if !app_data_dir.exists() {
        std::fs::create_dir_all(&app_data_dir).expect("Failed to create data dir");
    }

    app_data_dir
}

#[allow(dead_code)]
pub fn get_config_dir() -> PathBuf {
    let config_dir = directories::BaseDirs::new()
        .expect("Failed to get base dir")
        .config_dir()
        .join(APP_NAME);

    if !config_dir.exists() {
        std::fs::create_dir_all(&config_dir).expect("Failed to create config dir");
    }

    config_dir
}

pub fn resolve_cover_path(cover_path: Option<String>, vn_dir_path: String) -> Option<String> {
    let source_path_str = cover_path.as_ref()?;

    let source_path = PathBuf::from(source_path_str);
    let vn_dir_path = PathBuf::from(&vn_dir_path);

    if source_path.parent() == Some(&vn_dir_path) {
        return cover_path;
    }

    let ext = source_path
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or("png");

    let new_file_name = format!("{}.{}", nanoid!(), ext);

    let dest_path = vn_dir_path.join(new_file_name);

    if dest_path.exists() {
        return cover_path;
    }

    match std::fs::copy(source_path, &dest_path) {
        Ok(_) => Some(dest_path.to_string_lossy().to_string()),
        Err(_) => cover_path,
    }
}
