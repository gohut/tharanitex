import { UserRepository } from "../repositories/UserRepository";
import { Hash } from "../utils/hash";
import { signJWT } from "../utils/jwt";

export class AuthService {
  static async register({ name, email, password, phone }) {
    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await Hash.hash(password);
    const id = "usr_" + crypto.randomUUID();

    const user = await UserRepository.create({
      id,
      name,
      email,
      password: hashedPassword,
      phone,
      role: "customer",
    });

    const token = await this.generateToken(user);
    const { password: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  static async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await Hash.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const token = await this.generateToken(user);
    const { password: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  static async adminLogin(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user || user.role !== "admin") {
      throw new Error("Access denied or invalid credentials");
    }

    const isMatch = await Hash.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Access denied or invalid credentials");
    }

    const token = await this.generateToken(user);
    const { password: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  static async generateToken(user) {
    const secret = process.env.JWT_SECRET || "tharanitex_super_secret_key_123!";
    return await signJWT({ id: user.id, email: user.email, role: user.role }, secret);
  }

  static async getProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  static async updateProfile(userId, { name, phone }) {
    const user = await UserRepository.update(userId, { name, phone });
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  static async forgotPassword(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    // Simulate email dispatch
    return true;
  }
}
