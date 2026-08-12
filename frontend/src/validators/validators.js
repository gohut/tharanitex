export class Validators {
  static validateRegister(data) {
    const errors = [];
    if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long");
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Invalid email address");
    }
    if (!data.password || typeof data.password !== "string" || data.password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }
    if (data.phone && !/^\+?[0-9\s-]{10,15}$/.test(data.phone)) {
      errors.push("Invalid phone number format");
    }
    return errors.length > 0 ? errors : null;
  }

  static validateLogin(data) {
    const errors = [];
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Valid email address is required");
    }
    if (!data.password || typeof data.password !== "string" || data.password.length === 0) {
      errors.push("Password is required");
    }
    return errors.length > 0 ? errors : null;
  }

  static validateProduct(data) {
    const errors = [];
    if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
      errors.push("Product name is required");
    }
    if (!data.category_id || typeof data.category_id !== "string" || data.category_id.trim().length === 0) {
      errors.push("Category ID is required");
    }
    if (data.price === undefined || typeof data.price !== "number" || data.price < 0) {
      errors.push("Price must be a non-negative number");
    }
    if (data.stock === undefined || typeof data.stock !== "number" || !Number.isInteger(data.stock) || data.stock < 0) {
      errors.push("Stock must be a non-negative integer");
    }
    return errors.length > 0 ? errors : null;
  }

  static validateCategory(data) {
    const errors = [];
    if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
      errors.push("Category name is required");
    }
    return errors.length > 0 ? errors : null;
  }

  static validateAddress(data) {
    const errors = [];
    if (!data.full_name || typeof data.full_name !== "string" || data.full_name.trim().length === 0) {
      errors.push("Full name is required");
    }
    if (!data.phone || !/^\+?[0-9\s-]{10,15}$/.test(data.phone)) {
      errors.push("Valid phone number is required");
    }
    if (!data.address_line1 || typeof data.address_line1 !== "string" || data.address_line1.trim().length === 0) {
      errors.push("Address line 1 is required");
    }
    if (!data.city || typeof data.city !== "string" || data.city.trim().length === 0) {
      errors.push("City is required");
    }
    if (!data.state || typeof data.state !== "string" || data.state.trim().length === 0) {
      errors.push("State is required");
    }
    if (!data.pincode || typeof data.pincode !== "string" || data.pincode.trim().length === 0) {
      errors.push("Pincode is required");
    }
    return errors.length > 0 ? errors : null;
  }

  static validateReview(data) {
    const errors = [];
    if (!data.product_id) {
      errors.push("Product ID is required");
    }
    if (data.rating === undefined || typeof data.rating !== "number" || data.rating < 1 || data.rating > 5) {
      errors.push("Rating must be an integer between 1 and 5");
    }
    return errors.length > 0 ? errors : null;
  }

  static validateCoupon(data) {
    const errors = [];
    if (!data.code || typeof data.code !== "string" || data.code.trim().length === 0) {
      errors.push("Coupon code is required");
    }
    if (!data.discount_type || !["percentage", "flat"].includes(data.discount_type)) {
      errors.push("Discount type must be either 'percentage' or 'flat'");
    }
    if (data.discount_value === undefined || typeof data.discount_value !== "number" || data.discount_value <= 0) {
      errors.push("Discount value must be a positive number");
    }
    if (!data.expires_at || isNaN(Date.parse(data.expires_at))) {
      errors.push("Valid expiration date is required");
    }
    return errors.length > 0 ? errors : null;
  }

  static validateBanner(data) {
    const errors = [];
    if (!data.image_key || typeof data.image_key !== "string" || data.image_key.trim().length === 0) {
      errors.push("Banner image key is required");
    }
    return errors.length > 0 ? errors : null;
  }
}
