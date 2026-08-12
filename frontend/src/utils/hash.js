import bcrypt from "bcryptjs";

export class Hash {
  /**
   * Hashes a password using bcryptjs.
   */
  static async hash(password, saltRounds = 10) {
    return bcrypt.hashSync(password, saltRounds);
  }

  /**
   * Compares a password with a bcryptjs hash.
   */
  static async compare(password, hash) {
    if (!password || !hash) return false;
    return bcrypt.compareSync(password, hash);
  }
}
