import { AddressRepository } from "../repositories/AddressRepository";

export class AddressService {
  static async getAddresses(userId) {
    return await AddressRepository.findByUserId(userId);
  }

  static async getAddressById(userId, id) {
    const address = await AddressRepository.findById(id);
    if (!address || address.user_id !== userId) {
      throw new Error("Address not found or unauthorized");
    }
    return address;
  }

  static async createAddress(userId, data) {
    if (data.is_default) {
      await AddressRepository.clearDefault(userId);
    }
    
    // If this is the user's first address, make it default automatically
    const existing = await AddressRepository.findByUserId(userId);
    const isDefault = existing.length === 0 ? true : !!data.is_default;

    return await AddressRepository.create({
      user_id: userId,
      ...data,
      is_default: isDefault,
    });
  }

  static async updateAddress(userId, id, data) {
    const existingAddress = await AddressRepository.findById(id);
    if (!existingAddress || existingAddress.user_id !== userId) {
      throw new Error("Address not found or unauthorized");
    }

    if (data.is_default && !existingAddress.is_default) {
      await AddressRepository.clearDefault(userId);
    }

    return await AddressRepository.update(id, {
      ...data,
      is_default: !!data.is_default,
    });
  }

  static async deleteAddress(userId, id) {
    const existingAddress = await AddressRepository.findById(id);
    if (!existingAddress || existingAddress.user_id !== userId) {
      throw new Error("Address not found or unauthorized");
    }
    
    await AddressRepository.delete(id);

    // If we deleted the default address, set another one as default if it exists
    if (existingAddress.is_default) {
      const remaining = await AddressRepository.findByUserId(userId);
      if (remaining.length > 0) {
        await AddressRepository.update(remaining[0].id, {
          ...remaining[0],
          is_default: true,
        });
      }
    }

    return true;
  }
}
