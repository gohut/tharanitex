import { getDB } from "../database/db";

export class UserRepository {
  static async findByEmail(email) {
    const db = getDB();

    return await db
      .prepare(`
        SELECT
          id,
          first_name ||
            CASE
              WHEN last_name IS NOT NULL
                AND last_name != ''
              THEN ' ' || last_name
              ELSE ''
            END AS name,
          email,
          phone,
          address,
          pincode,
          avatar_url AS avatarUrl,
          password_hash AS password,
          role,
          created_at,
          created_at AS updated_at
        FROM users
        WHERE email = ?
      `)
      .bind(email)
      .first();
  }

  static async findById(id) {
    const db = getDB();

    return await db
      .prepare(`
        SELECT
          id,
          first_name ||
            CASE
              WHEN last_name IS NOT NULL
                AND last_name != ''
              THEN ' ' || last_name
              ELSE ''
            END AS name,
          email,
          phone,
          address,
          pincode,
          avatar_url AS avatarUrl,
          password_hash AS password,
          role,
          created_at,
          created_at AS updated_at
        FROM users
        WHERE id = ?
      `)
      .bind(id)
      .first();
  }

  static async create({
    name,
    email,
    password,
    phone,
    address,
    pincode,
    avatarUrl,
    role,
  }) {
    const db = getDB();

    const [firstName, ...remainingNames] =
      name.trim().split(/\s+/);

    const lastName =
      remainingNames.join(" ") || null;

    await db
      .prepare(`
        INSERT INTO users (
          first_name,
          last_name,
          email,
          phone,
          address,
          pincode,
          avatar_url,
          password_hash,
          role
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        firstName,
        lastName,
        email,
        phone || null,
        address || null,
        pincode || null,
        avatarUrl || null,
        password,
        role || "customer"
      )
      .run();

    return await this.findByEmail(email);
  }

  static async update(
    id,
    {
      name,
      phone,
      address,
      pincode,
    }
  ) {
    const db = getDB();

    const [firstName, ...remainingNames] =
      name.trim().split(/\s+/);

    const lastName =
      remainingNames.join(" ") || null;

    await db
      .prepare(`
        UPDATE users
        SET
          first_name = ?,
          last_name = ?,
          phone = ?,
          address = ?,
          pincode = ?
        WHERE id = ?
      `)
      .bind(
        firstName,
        lastName,
        phone || null,
        address || null,
        pincode || null,
        id
      )
      .run();

    return await this.findById(id);
  }

  static async updateAvatar(id, avatarUrl) {
    const db = getDB();

    await db
      .prepare(`
        UPDATE users
        SET avatar_url = ?
        WHERE id = ?
      `)
      .bind(avatarUrl || null, id)
      .run();

    return await this.findById(id);
  }

  static async delete(id) {
    const db = getDB();

    await db
      .prepare(
        "DELETE FROM users WHERE id = ?"
      )
      .bind(id)
      .run();

    return true;
  }

  static async findAll() {
    const db = getDB();

    const { results } = await db
      .prepare(`
        SELECT
          id,
          first_name ||
            CASE
              WHEN last_name IS NOT NULL
                AND last_name != ''
              THEN ' ' || last_name
              ELSE ''
            END AS name,
          email,
          phone,
          address,
          pincode,
          avatar_url AS avatarUrl,
          role,
          created_at,
          created_at AS updated_at
        FROM users
      `)
      .all();

    return results;
  }

  static async findAllCustomers() {
    const db = getDB();

    const { results } = await db
      .prepare(`
        SELECT
          id,
          first_name ||
            CASE
              WHEN last_name IS NOT NULL
                AND last_name != ''
              THEN ' ' || last_name
              ELSE ''
            END AS name,
          email,
          phone,
          address,
          pincode,
          avatar_url AS avatarUrl,
          created_at,
          created_at AS updated_at
        FROM users
        WHERE role = 'customer'
      `)
      .all();

    return results;
  }
}