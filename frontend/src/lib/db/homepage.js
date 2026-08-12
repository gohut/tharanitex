const DEFAULT_SETTINGS = {
  categories_title: "Explore Elegance",
  categories_subtitle:
    "Discover handcrafted sarees where timeless tradition meets effortless elegance.",
  why_title: "Crafted With Heritage",
  why_heading: "Crafted With Heritage",
  why_subtitle: "For those who appreciate timeless craftsmanship",
  why_features:
    '[{"title":"Pure Silk","description":"Finest quality silk. Timeless, soft and smooth."},{"title":"Authenticity","description":"Pure saree work that reflects tradition."},{"title":"Handwoven","description":"Meticulously handwoven by skilled artisans."}]',
};

export async function getHeroSlides(db, { activeOnly = false } = {}) {
  const { results } = await db
    .prepare(`
      SELECT
        id,
        image_url AS image,
        title,
        subtitle,
        button_text AS buttonText,
        button_link AS buttonLink,
        sort_order AS sortOrder,
        is_active AS isActive
      FROM homepage_hero_slides
      ${activeOnly ? "WHERE is_active = 1" : ""}
      ORDER BY sort_order ASC, id ASC
    `)
    .all();

  return results;
}

export async function getHeroSlideById(db, id) {
  return db
    .prepare(`
      SELECT id, image_url AS image, title, subtitle, button_text AS buttonText,
             button_link AS buttonLink, sort_order AS sortOrder, is_active AS isActive
      FROM homepage_hero_slides
      WHERE id = ?
      LIMIT 1
    `)
    .bind(Number(id))
    .first();
}

export async function createHeroSlide(db, data) {
  const result = await db
    .prepare(`
      INSERT INTO homepage_hero_slides
        (image_url, title, subtitle, button_text, button_link, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      data.image,
      data.title || "",
      data.subtitle || "",
      data.buttonText || "",
      data.buttonLink || "",
      Number(data.sortOrder || 0),
      data.isActive === false ? 0 : 1
    )
    .run();

  return { success: true, id: result.meta.last_row_id };
}

export async function updateHeroSlide(db, id, data) {
  await db
    .prepare(`
      UPDATE homepage_hero_slides
      SET image_url = ?, title = ?, subtitle = ?, button_text = ?,
          button_link = ?, sort_order = ?, is_active = ?
      WHERE id = ?
    `)
    .bind(
      data.image,
      data.title || "",
      data.subtitle || "",
      data.buttonText || "",
      data.buttonLink || "",
      Number(data.sortOrder || 0),
      data.isActive === false ? 0 : 1,
      Number(id)
    )
    .run();

  return { success: true };
}

export async function deleteHeroSlide(db, id) {
  await db.prepare("DELETE FROM homepage_hero_slides WHERE id = ?").bind(Number(id)).run();
  return { success: true };
}

export async function getPromoBanners(db, { activeOnly = false } = {}) {
  const { results } = await db
    .prepare(`
      SELECT
        id,
        image_url AS image,
        title,
        subtitle,
        link,
        placement,
        sort_order AS sortOrder,
        is_active AS isActive
      FROM homepage_banners
      ${activeOnly ? "WHERE is_active = 1" : ""}
      ORDER BY sort_order ASC, id ASC
    `)
    .all();

  return results;
}

export async function getPromoBannerById(db, id) {
  return db
    .prepare(`
      SELECT id, image_url AS image, title, subtitle, link, placement,
             sort_order AS sortOrder, is_active AS isActive
      FROM homepage_banners
      WHERE id = ?
      LIMIT 1
    `)
    .bind(Number(id))
    .first();
}

export async function createPromoBanner(db, data) {
  const result = await db
    .prepare(`
      INSERT INTO homepage_banners
        (image_url, title, subtitle, link, placement, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      data.image,
      data.title || "",
      data.subtitle || "",
      data.link || "",
      data.placement || "promo",
      Number(data.sortOrder || 0),
      data.isActive === false ? 0 : 1
    )
    .run();

  return { success: true, id: result.meta.last_row_id };
}

export async function updatePromoBanner(db, id, data) {
  await db
    .prepare(`
      UPDATE homepage_banners
      SET image_url = ?, title = ?, subtitle = ?, link = ?,
          placement = ?, sort_order = ?, is_active = ?
      WHERE id = ?
    `)
    .bind(
      data.image,
      data.title || "",
      data.subtitle || "",
      data.link || "",
      data.placement || "promo",
      Number(data.sortOrder || 0),
      data.isActive === false ? 0 : 1,
      Number(id)
    )
    .run();

  return { success: true };
}

export async function deletePromoBanner(db, id) {
  await db.prepare("DELETE FROM homepage_banners WHERE id = ?").bind(Number(id)).run();
  return { success: true };
}

export async function getHomepageSettings(db) {
  const { results } = await db
    .prepare("SELECT key, value FROM homepage_settings")
    .all();

  return results.reduce(
    (settings, row) => ({ ...settings, [row.key]: row.value }),
    { ...DEFAULT_SETTINGS }
  );
}

export async function updateHomepageSettings(db, settings) {
  const entries = Object.entries(settings);

  for (const [key, value] of entries) {
    await db
      .prepare(`
        INSERT INTO homepage_settings (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `)
      .bind(key, String(value ?? ""))
      .run();
  }

  return { success: true };
}

export function shapeWhyTharani(settings) {
  let features = [];

  try {
    features = JSON.parse(settings.why_features || "[]");
  } catch {
    features = JSON.parse(DEFAULT_SETTINGS.why_features);
  }

  return {
    title: settings.why_title,
    heading: settings.why_heading,
    subtitle: settings.why_subtitle,
    features,
  };
}

// ======================================================
// HOMEPAGE SECTIONS / LAYOUT
// ======================================================

export async function getHomepageSections(db) {
  const { results } = await db
    .prepare(`
      SELECT
        hs.id,
        hs.section_type AS sectionType,
        hs.reference_id AS referenceId,
        hs.sort_order AS sortOrder,
        hs.is_active AS isActive,
        hs.title,
        hs.subtitle,
        hs.product_ids AS productIds,
        hs.background_color AS backgroundColor,
        hs.background_image AS backgroundImage,

        CASE
          WHEN hs.section_type = 'banner'
          THEN hb.image_url
          ELSE NULL
        END AS bannerImage,

        CASE
          WHEN hs.section_type = 'banner'
          THEN hb.title
          ELSE NULL
        END AS bannerTitle

      FROM homepage_sections hs

      LEFT JOIN homepage_banners hb
        ON hs.section_type = 'banner'
        AND hb.id = hs.reference_id

      ORDER BY hs.sort_order ASC, hs.id ASC
    `)
    .all();

  return results.map((section) => ({
    ...section,
    productIds: (() => {
      try {
        return JSON.parse(section.productIds || "[]");
      } catch {
        return [];
      }
    })(),
  }));
}


export async function createHomepageSection(db, data) {
  const result = await db
    .prepare(`
      INSERT INTO homepage_sections (
        section_type,
        reference_id,
        sort_order,
        is_active,
        title,
        subtitle,
        product_ids,
        background_color,
        background_image
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      data.sectionType,
      data.referenceId ?? null,
      Number(data.sortOrder) || 0,
      data.isActive === false ? 0 : 1,
      data.title || null,
      data.subtitle || null,
      JSON.stringify(data.productIds || []),
      data.backgroundColor || null,
      data.backgroundImage || null
    )
    .run();

  return {
    success: true,
    id: result.meta.last_row_id,
  };
}


export async function updateHomepageSection(db, id, data) {
  await db
    .prepare(`
      UPDATE homepage_sections

      SET
        section_type = ?,
        reference_id = ?,
        sort_order = ?,
        is_active = ?,
        title = ?,
        subtitle = ?,
        product_ids = ?,
        background_color = ?,
        background_image = ?,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = ?
    `)
    .bind(
      data.sectionType,
      data.referenceId ?? null,
      Number(data.sortOrder) || 0,
      data.isActive === false ? 0 : 1,
      data.title || null,
      data.subtitle || null,
      JSON.stringify(data.productIds || []),
      data.backgroundColor || null,
      data.backgroundImage || null,
      Number(id)
    )
    .run();

  return {
    success: true,
  };
}


export async function deleteHomepageSection(db, id) {
  await db
    .prepare(`
      DELETE FROM homepage_sections
      WHERE id = ?
    `)
    .bind(Number(id))
    .run();

  return {
    success: true,
  };
}


export async function reorderHomepageSections(db, sections) {
  const statements = sections.map((section, index) =>
    db
      .prepare(`
        UPDATE homepage_sections
        SET sort_order = ?
        WHERE id = ?
      `)
      .bind(index + 1, Number(section.id))
  );

  if (statements.length) {
    await db.batch(statements);
  }

  return {
    success: true,
  };
}
