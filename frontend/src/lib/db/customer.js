export async function getAllCustomers(db) {
  const { results } = await db
    .prepare(`
      SELECT
        u.id,
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.email,
        u.phone,
        u.is_active AS isActive,
        u.created_at AS createdAt,

        COUNT(o.id) AS orderCount,

        COALESCE(SUM(o.total_amount), 0) AS totalSpent

      FROM users u

      LEFT JOIN orders o
        ON o.user_id = u.id

      WHERE u.role = 'customer'

      GROUP BY
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.is_active,
        u.created_at

      ORDER BY u.created_at DESC
    `)
    .all();

  return results;
}


export async function getCustomerStats(db) {
  return db
    .prepare(`
      SELECT
        COUNT(*) AS totalCustomers,

        SUM(
          CASE
            WHEN is_active = 1 THEN 1
            ELSE 0
          END
        ) AS activeCustomers,

        SUM(
          CASE
            WHEN is_active = 0 THEN 1
            ELSE 0
          END
        ) AS blockedCustomers,

        SUM(
          CASE
            WHEN
              strftime('%Y-%m', created_at) =
              strftime('%Y-%m', 'now')
            THEN 1
            ELSE 0
          END
        ) AS newThisMonth

      FROM users

      WHERE role = 'customer'
    `)
    .first();
}


export async function getCustomerById(db, id) {
  const customer = await db
    .prepare(`
      SELECT
        u.id,
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.email,
        u.phone,
        u.is_active AS isActive,
        u.created_at AS createdAt,

        COUNT(o.id) AS orderCount,

        COALESCE(SUM(o.total_amount), 0) AS totalSpent

      FROM users u

      LEFT JOIN orders o
        ON o.user_id = u.id

      WHERE
        u.id = ?
        AND u.role = 'customer'

      GROUP BY
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.is_active,
        u.created_at

      LIMIT 1
    `)
    .bind(Number(id))
    .first();

  if (!customer) {
    return null;
  }

  const { results: addresses } = await db
    .prepare(`
      SELECT
        id,
        full_name AS fullName,
        phone,
        address_line1 AS addressLine1,
        address_line2 AS addressLine2,
        city,
        state,
        pincode,
        country,
        is_default AS isDefault

      FROM addresses

      WHERE user_id = ?

      ORDER BY is_default DESC, id DESC
    `)
    .bind(Number(id))
    .all();

  const { results: orders } = await db
    .prepare(`
      SELECT
        id,
        total_amount AS totalAmount,
        payment_status AS paymentStatus,
        order_status AS orderStatus,
        created_at AS createdAt

      FROM orders

      WHERE user_id = ?

      ORDER BY created_at DESC
    `)
    .bind(Number(id))
    .all();

  return {
    ...customer,
    addresses,
    orders,
  };
}


export async function updateCustomerStatus(
  db,
  id,
  isActive
) {
  const result = await db
    .prepare(`
      UPDATE users

      SET is_active = ?

      WHERE
        id = ?
        AND role = 'customer'
    `)
    .bind(
      isActive ? 1 : 0,
      Number(id)
    )
    .run();

  if (!result.meta.changes) {
    return {
      success: false,
      error: "Customer not found",
    };
  }

  return {
    success: true,
  };
}