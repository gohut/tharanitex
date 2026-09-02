import { AddressService } from "../services/AddressService";
import { Validators } from "../validators/validators";
import { ApiResponse } from "../utils/ApiResponse";
import { authenticate } from "../middleware/auth";

export class AddressController {
  static async getAddresses(request, env) {
    try {
      const payload = await authenticate(request, env);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const addresses = await AddressService.getAddresses(payload.id, env);
      return ApiResponse.success(addresses);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  }

  static async getAddressById(request, { params }, env) {
    try {
      const payload = await authenticate(request, env);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const resolvedParams = await params;
      const id = resolvedParams.id;
      const address = await AddressService.getAddressById(payload.id, id, env);
      return ApiResponse.success(address);
    } catch (error) {
      return ApiResponse.error(error.message, 404);
    }
  }

  static async createAddress(request, env) {
    try {
      const payload = await authenticate(request, env);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const body = await request.json();
      const valErrors = Validators.validateAddress(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const address = await AddressService.createAddress(payload.id, body, env);
      return ApiResponse.success(address, "Address created successfully", 201);
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }

  static async updateAddress(request, { params }, env) {
    try {
      const payload = await authenticate(request, env);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const resolvedParams = await params;
      const id = resolvedParams.id;
      const body = await request.json();
      const valErrors = Validators.validateAddress(body);
      if (valErrors) {
        return ApiResponse.badRequest("Validation failed", valErrors);
      }

      const address = await AddressService.updateAddress(payload.id, id, body, env);
      return ApiResponse.success(address, "Address updated successfully");
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }

  static async deleteAddress(request, { params }, env) {
    try {
      const payload = await authenticate(request, env);
      if (!payload) {
        return ApiResponse.unauthorized("Authentication required");
      }
      const resolvedParams = await params;
      const id = resolvedParams.id;

      await AddressService.deleteAddress(payload.id, id, env);
      return ApiResponse.success(null, "Address deleted successfully");
    } catch (error) {
      return ApiResponse.error(error.message, 400);
    }
  }
}

