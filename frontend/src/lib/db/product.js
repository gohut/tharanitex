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

async function getPlacedProducts(db, column) {
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
          ORDER BY sort_order ASC, id ASC
          LIMIT 1
        ) AS image
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.${column} = 1
      AND p.is_active = 1
      ORDER BY p.id DESC;
    `)
    .all();

  return results;
}

export async function getNewArrivalProducts(db) {
  return getPlacedProducts(db, "is_new_arrival");
}

export async function getBestSellerProducts(db) {
  return getPlacedProducts(db, "is_best_seller");
}

export async function getProductsByIds(db, productIds = []) {
  const ids = [...new Set(productIds.map(Number).filter(Number.isInteger))];

  if (!ids.length) return [];

  const placeholders = ids.map(() => "?").join(", ");
  const { results } = await db
    .prepare(`
      SELECT
        p.id, p.name, p.slug, p.price, c.name AS category,
        (
          SELECT image_url FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY sort_order ASC, id ASC LIMIT 1
        ) AS image
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.id IN (${placeholders})
        AND p.is_active = 1 AND c.is_active = 1
    `)
    .bind(...ids)
    .all();

  const productsById = new Map(results.map((product) => [Number(product.id), product]));
  return ids.map((id) => productsById.get(id)).filter(Boolean);
}

export async function getAllProducts(db, { activeOnly = true } = {}) {
  const { results } = await db.prepare(`
    SELECT
      p.id,
      p.name,
      p.slug,
      p.price,
      p.description,
      p.stock,
      p.featured,
      p.is_new_arrival AS isNewArrival,
      p.is_best_seller AS isBestSeller,
      p.is_active AS isActive,
      c.name AS category,
      c.slug AS categorySlug,
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
    ${activeOnly ? "WHERE p.is_active = 1 AND c.is_active = 1" : ""}
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
      ORDER BY sort_order ASC, id ASC
    `)
    .bind(product.id)
    .all();

  product.images = images.map((image) => image.image_url);

  // Load active product variants
  const { results: variants } = await db
    .prepare(`
      SELECT
        id,
        product_id,
        name,
        sku,
        price,
        stock,
        image_url AS imageUrl,
        is_active AS isActive
      FROM product_variants
      WHERE product_id = ?
        AND is_active = 1
      ORDER BY id ASC
    `)
    .bind(product.id)
    .all();

  product.variants = variants || [];

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
        p.is_new_arrival AS isNewArrival,
        p.is_best_seller AS isBestSeller,
        p.is_active AS isActive,
        c.name AS category
      FROM products p
      JOIN categories c ON c.id = p.category_id
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
    isNewArrival = 0,
    isBestSeller = 0,
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
        is_new_arrival,
        is_best_seller,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      name,
      slug,
      description || "",
      Number(price),
      Number(stock),
      Number(categoryId),
      featured ? 1 : 0,
      isNewArrival ? 1 : 0,
      isBestSeller ? 1 : 0,
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
    isNewArrival = 0,
    isBestSeller = 0,
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
        is_new_arrival = ?,
        is_best_seller = ?,
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
      isNewArrival ? 1 : 0,
      isBestSeller ? 1 : 0,
      isActive ? 1 : 0,
      Number(id)
    )
    .run();

  return {
    success: true,
  };
}

export async function deleteProduct(db, id) {
  const productId = Number(id);

  // Delete variants first because product_variants.product_id
  // has a foreign key pointing to products.id.
  await db
    .prepare(`
      DELETE FROM product_variants
      WHERE product_id = ?
    `)
    .bind(productId)
    .run();

  // Delete product images.
  await db
    .prepare(`
      DELETE FROM product_images
      WHERE product_id = ?
    `)
    .bind(productId)
    .run();

  // Finally delete the product.
  await db
    .prepare(`
      DELETE FROM products
      WHERE id = ?
    `)
    .bind(productId)
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
export async function getProductsByCategorySlug(db, slug, { activeOnly = true } = {}) {
  const { results } = await db
    .prepare(`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.price,
        p.description,
        p.stock,
        p.featured,
        p.is_new_arrival AS isNewArrival,
        p.is_best_seller AS isBestSeller,
        p.is_active AS isActive,
        c.name AS category,
        c.slug AS categorySlug,
        c.subtitle AS categorySubtitle,
        c.description AS categoryDescription,
        c.image_url AS categoryImage,
        (
          SELECT image_url
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY sort_order ASC, id ASC
          LIMIT 1
        ) AS image
      FROM products p
      JOIN categories c
        ON c.id = p.category_id
      WHERE c.slug = ?
      ${activeOnly ? "AND p.is_active = 1" : ""}
      AND c.is_active = 1
      ORDER BY p.id DESC;
    `)
    .bind(slug)
    .all();

  return results;
}

export async function getProductVariants(db, productId) {
  const { results } = await db
    .prepare(`
      SELECT
        id,
        product_id,
        name,
        sku,
        price,
        stock,
        image_url,
        is_active,
        created_at,
        updated_at
      FROM product_variants
      WHERE product_id = ?
        AND is_active = 1
      ORDER BY id ASC
    `)
    .bind(productId)
    .all();

  return results || [];
}

export async function getAllProductVariants(db, productId) {
  const { results } = await db
    .prepare(`
      SELECT
        id,
        product_id,
        name,
        sku,
        price,
        stock,
        image_url,
        is_active,
        created_at,
        updated_at
      FROM product_variants
      WHERE product_id = ?
      ORDER BY id ASC
    `)
    .bind(productId)
    .all();

  return results || [];
}

export async function createProductVariant(db, {
  productId,
  name,
  sku,
  price,
  stock,
  imageUrl,
}) {
  const result = await db
    .prepare(`
      INSERT INTO product_variants (
        product_id,
        name,
        sku,
        price,
        stock,
        image_url
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .bind(
      productId,
      name,
      sku || null,
      Number(price) || 0,
      Number(stock) || 0,
      imageUrl || null
    )
    .run();

  return result.meta?.last_row_id;
}

export async function updateProductVariant(db, {
  id,
  name,
  sku,
  price,
  stock,
  imageUrl,
  isActive,
}) {
  await db
    .prepare(`
      UPDATE product_variants
      SET
        name = ?,
        sku = ?,
        price = ?,
        stock = ?,
        image_url = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .bind(
      name,
      sku || null,
      Number(price) || 0,
      Number(stock) || 0,
      imageUrl || null,
      isActive ? 1 : 0,
      id
    )
    .run();
}

export async function deleteProductVariant(db, id) {
  await db
    .prepare(`
      DELETE FROM product_variants
      WHERE id = ?
    `)
    .bind(id)
    .run();
}

export async function getRelatedProducts(
  db,
  currentProductId,
  limit = 8
) {
  const productId = Number(currentProductId);
  const safeLimit = Math.max(
    1,
    Math.min(Number(limit) || 8, 12)
  );


  if (!Number.isInteger(productId) || productId <= 0) {
    return [];
  }


  /*
   * First find the current product's category.
   */
  const currentProduct = await db
    .prepare(`
      SELECT category_id
      FROM products
      WHERE id = ?
      LIMIT 1
    `)
    .bind(productId)
    .first();


  if (!currentProduct) {
    return [];
  }


  /*
   * Prefer products from the same category.
   */
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
          ORDER BY
            pi.sort_order ASC,
            pi.id ASC
          LIMIT 1
        ) AS image


      FROM products p


      INNER JOIN categories c
        ON c.id = p.category_id


      WHERE
        p.id != ?
        AND p.category_id = ?
        AND p.is_active = 1
        AND c.is_active = 1


      ORDER BY
        p.featured DESC,
        p.is_best_seller DESC,
        p.is_new_arrival DESC,
        p.id DESC


      LIMIT ?
    `)
    .bind(
      productId,
      Number(currentProduct.category_id),
      safeLimit
    )
    .all();


  return results || [];
}
