use std::path::Path;

use crate::database::entities::{TagEntity, VisualNovelEntity};
use crate::schema::{tags, visual_novels, visual_novels_tags};
use diesel::prelude::*;
use diesel::SqliteConnection;
use nanoid::nanoid;
use titlecase::Titlecase;
use vndb_api::client::VndbApiClient;
use vndb_api::format::schema::Language;
use vndb_api::request::query::{QueryBuilder, VnField, VnFieldChoices, VnQuery};

pub async fn update_metadata(
    conn: &mut SqliteConnection,
    client: &VndbApiClient,
    vn: VisualNovelEntity,
) -> Result<VisualNovelEntity, ()> {
    let filter = format!(r#"["search", "=", "{}"]"#, vn.title);

    let query = QueryBuilder::<VnQuery>::new()
        .filters(&filter)
        .fields(VnFieldChoices::from(Vec::from([
            VnField::TitlesLang,
            VnField::TitlesTitle,
            VnField::Description,
            VnField::ImageThumbnail,
            VnField::TagsName,
        ])))
        .build();

    if let Ok(response) = client.vn_search(&query).await {
        let result = response.results.first().ok_or(())?;

        if let Some(titles) = &result.titles {
            for title in titles {
                if let Some(lang) = &title.lang {
                    match lang {
                        Language::English => {
                            if let Some(title_str) = &title.title {
                                diesel::update(visual_novels::table.find(&vn.id))
                                    .set(visual_novels::title.eq(title_str.titlecase()))
                                    .execute(conn)
                                    .map_err(|_| ())?;
                            }
                        }
                        _ => continue,
                    }
                }
            }
        };

        if let Some(description) = &result.description {
            diesel::update(visual_novels::table.find(&vn.id))
                .set(visual_novels::description.eq(description))
                .execute(conn)
                .map_err(|_| ())?;
        }

        if let Some(tags) = &result.tags {
            for tag in tags {
                if let Some(name) = &tag.name {
                    let temp_tag = TagEntity::new(name.to_string());

                    let tag = match tags::table
                        .filter(tags::name.eq(&temp_tag.name))
                        .get_result::<TagEntity>(conn)
                    {
                        Ok(tag) => tag,
                        Err(_) => {
                            let tag = TagEntity::new(name.to_string());

                            diesel::insert_into(tags::table)
                                .values(&tag)
                                .execute(conn)
                                .map_err(|_| ())?;

                            tag
                        }
                    };

                    diesel::insert_into(visual_novels_tags::table)
                        .values((
                            visual_novels_tags::visual_novel_id.eq(&vn.id),
                            visual_novels_tags::tag_id.eq(&tag.id),
                        ))
                        .on_conflict_do_nothing()
                        .execute(conn)
                        .map_err(|_| ())?;
                }
            }
        }

        if let Some(image) = &result.image {
            if let Some(thumbnail) = &image.thumbnail {
                if vn.cover_path.is_none() {
                    let res = reqwest::get(thumbnail).await.map_err(|_| ())?;

                    if !res.status().is_success() {
                        return Err(());
                    }

                    let bytes = res.bytes().await.map_err(|_| ())?;

                    let cover_path = Path::new(&vn.dir_path).join(format!("{}.jpg", nanoid!()));

                    std::fs::write(&cover_path, bytes).map_err(|_| ())?;

                    diesel::update(visual_novels::table.find(&vn.id))
                        .set(visual_novels::cover_path.eq(cover_path.to_string_lossy().to_string()))
                        .execute(conn)
                        .map_err(|_| ())?;
                }
            }
        }
    } else {
        return Err(());
    };

    let updated_vn = visual_novels::table
        .find(&vn.id)
        .get_result::<VisualNovelEntity>(conn)
        .map_err(|_| ())?;

    Ok(updated_vn)
}
