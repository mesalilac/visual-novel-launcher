use crate::{
    database::types::{Timestamp, VisualNovelStatus},
    APP_SETTINGS_ID,
};

use super::prelude::*;

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn get_visual_novels(state: AppState<'_>) -> CommandResult<Vec<VisualNovel>> {
    use schema::tags::dsl as tag_dsl;
    use schema::visual_novels::dsl as vn_dsl;

    let mut conn = state.pool.get()?;

    let vns = vn_dsl::visual_novels.load::<VisualNovelEntity>(&mut conn)?;

    let tags = VisualNovelTagEntity::belonging_to(&vns)
        .inner_join(tag_dsl::tags)
        .select((VisualNovelTagEntity::as_select(), TagEntity::as_select()))
        .load::<(VisualNovelTagEntity, TagEntity)>(&mut conn)?;

    let data: Vec<VisualNovel> = tags
        .grouped_by(&vns)
        .into_iter()
        .zip(vns)
        .map(|(tags, vn)| VisualNovel::from_db(vn, tags.into_iter().map(|x| x.1).collect()))
        .collect();

    Ok(data)
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn get_visual_novel_by_id(state: AppState<'_>, id: String) -> CommandResult<VisualNovel> {
    use schema::tags::dsl as tag_dsl;
    use schema::visual_novels::dsl as vn_dsl;

    let mut conn = state.pool.get()?;

    let vn_entity = vn_dsl::visual_novels
        .find(&id)
        .first::<VisualNovelEntity>(&mut conn)?;

    let tags = VisualNovelTagEntity::belonging_to(&vn_entity)
        .inner_join(tag_dsl::tags)
        .select(TagEntity::as_select())
        .load::<TagEntity>(&mut conn)?;

    let vn = VisualNovel::from_db(vn_entity, tags);

    Ok(vn)
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn get_tags(state: AppState<'_>) -> CommandResult<Vec<TagWithVisualNovels>> {
    use schema::tags::dsl as tag_dsl;
    use schema::visual_novels::dsl as vn_dsl;

    let mut conn = state.pool.get()?;

    let all_tags = tag_dsl::tags.load::<TagEntity>(&mut conn)?;

    let vns_with_junction: Vec<(VisualNovelTagEntity, VisualNovelEntity)> =
        VisualNovelTagEntity::belonging_to(&all_tags)
            .inner_join(vn_dsl::visual_novels)
            .select((
                VisualNovelTagEntity::as_select(),
                VisualNovelEntity::as_select(),
            ))
            .load::<(VisualNovelTagEntity, VisualNovelEntity)>(&mut conn)?;

    let all_vns: Vec<VisualNovelEntity> =
        vns_with_junction.iter().map(|(_, vn)| vn.clone()).collect();

    let tags_for_vns = VisualNovelTagEntity::belonging_to(&all_vns)
        .inner_join(tag_dsl::tags)
        .select((VisualNovelTagEntity::as_select(), TagEntity::as_select()))
        .load::<(VisualNovelTagEntity, TagEntity)>(&mut conn)?;

    let grouped_vns = vns_with_junction.grouped_by(&all_tags);

    let data = all_tags
        .into_iter()
        .zip(grouped_vns)
        .map(|(tag, vn_pairs)| {
            let vn_with_tags: Vec<(VisualNovelEntity, Vec<TagEntity>)> = vn_pairs
                .into_iter()
                .map(|(_, vn)| {
                    let tags: Vec<TagEntity> = tags_for_vns
                        .iter()
                        .cloned()
                        .filter(|x| x.0.visual_novel_id == vn.id)
                        .map(|x| x.1)
                        .collect();

                    (vn, tags)
                })
                .collect();

            TagWithVisualNovels::from_db(tag, vn_with_tags)
        })
        .collect();

    Ok(data)
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn get_settings(state: AppState<'_>) -> CommandResult<Setting> {
    use schema::settings::dsl as setting_dsl;

    let mut conn = state.pool.get()?;

    let setting = setting_dsl::settings
        .find(APP_SETTINGS_ID)
        .first::<SettingEntity>(&mut conn)?;

    Ok(Setting::from_db(setting))
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn get_play_sessions(state: AppState<'_>) -> CommandResult<Vec<PlaySession>> {
    use schema::play_sessions::dsl as play_session_dsl;

    let mut conn = state.pool.get()?;

    let play_sessions = play_session_dsl::play_sessions.load::<PlaySessionEntity>(&mut conn)?;

    let data = play_sessions
        .into_iter()
        .map(|e| PlaySession::from_db(e))
        .collect::<Vec<PlaySession>>();

    Ok(data)
}

#[tauri::command]
#[auto_collect_command]
#[specta::specta]
pub async fn get_stats(state: AppState<'_>) -> CommandResult<GeneralStats> {
    use schema::tags::dsl as tag_dsl;
    use schema::visual_novels::dsl as vn_dsl;

    let mut conn = state.pool.get()?;

    let vns = vn_dsl::visual_novels.load::<VisualNovelEntity>(&mut conn)?;
    let tags = tag_dsl::tags.load::<TagEntity>(&mut conn)?;

    let last_played_at: Option<Timestamp> = vns.iter().filter_map(|x| x.last_time_played_at).max();
    let total_playtime: i64 = vns.iter().map(|x| x.playtime).sum();

    let visual_novel_count: i64 = vns.len() as i64;
    let tag_count: i64 = tags.len() as i64;
    let unplayed_count: i64 = vns
        .iter()
        .filter(|x| x.last_time_played_at.is_none())
        .count() as i64;
    let playing_count: i64 = vns
        .iter()
        .filter(|x| x.status == VisualNovelStatus::Playing)
        .count() as i64;
    let finished_count: i64 = vns
        .iter()
        .filter(|x| x.status == VisualNovelStatus::Finished)
        .count() as i64;
    let backlog_count: i64 = vns
        .iter()
        .filter(|x| x.status == VisualNovelStatus::Backlog)
        .count() as i64;
    let dropped_count: i64 = vns
        .iter()
        .filter(|x| x.status == VisualNovelStatus::Dropped)
        .count() as i64;

    Ok(GeneralStats {
        last_played_at,
        total_playtime,

        visual_novel_count,
        tag_count,
        unplayed_count,
        playing_count,
        finished_count,
        backlog_count,
        dropped_count,
    })
}

// #[tauri::command]
// #[auto_collect_command]
// #[specta::specta]
// pub async fn get_(state: AppState<'_>) -> CommandResult<()> {
//     todo!()
// }
