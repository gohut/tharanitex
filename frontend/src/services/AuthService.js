import { UserRepository } from "../repositories/UserRepository";
import { Hash } from "../utils/hash";
import { signJWT } from "../utils/jwt";
import { getJwtSecret } from "../utils/jwt-secret";

export class AuthService {
  static async register(
    { name, email, password, phone, address, pincode },
    env
  ) {
    const existing = await UserRepository.findByEmail(email);

    if (existing) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await Hash.hash(password);

    const user = await UserRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      pincode,
      role: "customer",
    });

    const token = await this.generateToken(user, env);

    const { password: _, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  }

  static async login(email, password, env) {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await Hash.compare(
      password,
      user.password
    );

    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const token = await this.generateToken(user, env);

    const { password: _, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  }

  static async adminLogin(email, password, env) {
    const user = await UserRepository.findByEmail(email);

    if (!user || user.role !== "admin") {
      throw new Error(
        "Access denied or invalid credentials"
      );
    }

    const isMatch = await Hash.compare(
      password,
      user.password
    );

    if (!isMatch) {
      throw new Error(
        "Access denied or invalid credentials"
      );
    }

    const token = await this.generateToken(user, env);

    const { password: _, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  }

  static async generateToken(user, env) {
    const secret = getJwtSecret(env);

    return await signJWT(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      secret
    );
  }

  static async getProfile(userId) {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const { password: _, ...safeUser } = user;

    return safeUser;
  }

  static async updateProfile(
    userId,
    { name, phone, address, pincode }
  ) {
    if (!name || !name.trim()) {
      throw new Error("Name is required");
    }

    const user = await UserRepository.update(userId, {
      name: name.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      pincode: pincode?.trim() || null,
    });

    const { password: _, ...safeUser } = user;

    return safeUser;
  }

  static async forgotPassword(email) {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    return true;
  }

  static async googleLogin(accessToken, env) {
    const googleResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!googleResponse.ok) {
      throw new Error("Invalid Google authentication");
    }

    const googleUser = await googleResponse.json();

    if (!googleUser.email) {
      throw new Error(
        "Google account email not available"
      );
    }

    if (googleUser.email_verified === false) {
      throw new Error(
        "Google email is not verified"
      );
    }

    let user = await UserRepository.findByEmail(
      googleUser.email.toLowerCase()
    );

    if (user) {
      if (user.role !== "customer") {
        throw new Error(
          "This Google account is not a customer account"
        );
      }
    } else {
      const randomPassword =
        crypto.randomUUID() +
        crypto.randomUUID();

      const hashedPassword =
        await Hash.hash(randomPassword);

      user = await UserRepository.create({
        name:
          googleUser.name ||
          "Google Customer",
        email:
          googleUser.email.toLowerCase(),
        password: hashedPassword,
        phone: null,
        address: null,
        pincode: null,
        role: "customer",
      });
    }

    const token = await this.generateToken(
      user,
      env
    );

    const { password: _, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  }
}