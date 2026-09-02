import { AddressRepository } from "../repositories/AddressRepository";

export class AddressService {
  static async getAddresses(userId, env) {
    return await AddressRepository.findByUserId(userId, env);
  }

  static async getAddressById(userId, id, env) {
    const address = await AddressRepository.findById(id, env);
    if (!address || address.user_id !== userId) {
      throw new Error("Address not found or unauthorized");
    }
    return address;
  }

  static async createAddress(userId, data, env) {
    if (data.is_default) {
      await AddressRepository.clearDefault(userId, env);
    }
    
    // If this is the user's first address, make it default automatically
    const existing = await AddressRepository.findByUserId(userId, env);
    const isDefault = existing.length === 0 ? true : !!data.is_default;

    return await AddressRepository.create({
      user_id: userId,
      ...data,
      is_default: isDefault,
    }, env);
  }

  static async updateAddress(userId, id, data, env) {
    const existingAddress = await AddressRepository.findById(id, env);
    if (!existingAddress || existingAddress.user_id !== userId) {
      throw new Error("Address not found or unauthorized");
    }

    if (data.is_default && !existingAddress.is_default) {
      await AddressRepository.clearDefault(userId, env);
    }

    return await AddressRepository.update(id, {
      ...data,
      is_default: !!data.is_default,
    }, env);
  }

  static async deleteAddress(userId, id, env) {
    const existingAddress = await AddressRepository.findById(id, env);
    if (!existingAddress || existingAddress.user_id !== userId) {
      throw new Error("Address not found or unauthorized");
    }
    
    await AddressRepository.delete(id, env);

    // If we deleted the default address, set another one as default if it exists
    if (existingAddress.is_default) {
      const remaining = await AddressRepository.findByUserId(userId, env);
      if (remaining.length > 0) {
        await AddressRepository.update(remaining[0].id, {
          ...remaining[0],
          is_default: true,
        }, env);
      }
    }

    return true;
  }
}
