export async function getFeaturedProducts(db) {
  const { results } = await db
    .prepare(`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.price,
        c.name AS category,
        (
          SELECT image_url
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY sort_order
          LIMIT 1
        ) AS image
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.featured = 1
      AND p.is_active = 1
      ORDER BY p.id DESC;
    `)
    .all();

  return results;
}

export async function getAllProducts(db) {
  const { results } = await db.prepare(`
    SELECT
      p.id,
      p.name,
      p.slug,
      p.price,
      p.description,
      p.stock,
      c.name AS category,
      (
        SELECT image_url
        FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY sort_order
        LIMIT 1
      ) AS image
    FROM products p
    JOIN categories c
      ON c.id = p.category_id
    WHERE p.is_active = 1
    ORDER BY p.id DESC;
  `).all();

  return results;
}

export async function getProductBySlug(db, slug) {
  const product = await db
    .prepare(`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.stock,
        c.name AS category
      FROM products p
      JOIN categories c
        ON c.id = p.category_id
      WHERE p.slug = ?
      LIMIT 1
    `)
    .bind(slug)
    .first();

  if (!product) return null;

  const { results: images } = await db
    .prepare(`
      SELECT image_url
      FROM product_images
      WHERE product_id = ?
      ORDER BY sort_order
    `)
    .bind(product.id)
    .all();

  product.images = images.map(i => i.image_url);

  return product;
}

export async function getProductById(db, id) {
  const product = await db
    .prepare(`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.stock,
        p.category_id AS categoryId,
        p.featured,
        p.is_active AS isActive,
        c.name AS category
      FROM products p
      JOIN categories c
        ON c.id = p.category_id
      WHERE p.id = ?
      LIMIT 1
    `)
    .bind(Number(id))
    .first();

  if (!product) {
    return null;
  }

  const { results: images } = await db
    .prepare(`
      SELECT
        id,
        image_url AS imageUrl,
        sort_order AS sortOrder
      FROM product_images
      WHERE product_id = ?
      ORDER BY sort_order ASC
    `)
    .bind(Number(id))
    .all();

  product.images = images;

  return product;
}

export async function createProduct(db, data) {
  const {
    name,
    slug,
    description,
    price,
    stock,
    categoryId,
    featured = 0,
    isActive = 1,
  } = data;

  const result = await db
    .prepare(`
      INSERT INTO products (
        name,
        slug,
        description,
        price,
        stock,
        category_id,
        featured,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      name,
      slug,
      description || "",
      Number(price),
      Number(stock),
      Number(categoryId),
      featured ? 1 : 0,
      isActive ? 1 : 0
    )
    .run();

  return {
    success: true,
    id: result.meta.last_row_id,
  };
}


export async function updateProduct(db, id, data) {
  const {
    name,
    slug,
    description,
    price,
    stock,
    categoryId,
    featured = 0,
    isActive = 1,
  } = data;

  await db
    .prepare(`
      UPDATE products

      SET
        name = ?,
        slug = ?,
        description = ?,
        price = ?,
        stock = ?,
        category_id = ?,
        featured = ?,
        is_active = ?

      WHERE id = ?
    `)
    .bind(
      name,
      slug,
      description || "",
      Number(price),
      Number(stock),
      Number(categoryId),
      featured ? 1 : 0,
      isActive ? 1 : 0,
      Number(id)
    )
    .run();

  return {
    success: true,
  };
}


export async function deleteProduct(db, id) {
  // Remove product images first
  await db
    .prepare(`
      DELETE FROM product_images
      WHERE product_id = ?
    `)
    .bind(Number(id))
    .run();

  // Remove product
  await db
    .prepare(`
      DELETE FROM products
      WHERE id = ?
    `)
    .bind(Number(id))
    .run();

  return {
    success: true,
  };
}


export async function addProductImage(
  db,
  productId,
  imageUrl,
  sortOrder = 0
) {
  const result = await db
    .prepare(`
      INSERT INTO product_images (
        product_id,
        image_url,
        sort_order
      )
      VALUES (?, ?, ?)
    `)
    .bind(
      Number(productId),
      imageUrl,
      Number(sortOrder)
    )
    .run();

  return {
    success: true,
    id: result.meta.last_row_id,
  };
}


export async function deleteProductImages(db, productId) {
  await db
    .prepare(`
      DELETE FROM product_images
      WHERE product_id = ?
    `)
    .bind(Number(productId))
    .run();

  return {
    success: true,
  };
}