export const TEMPORARY_OTP = "1234";

export function validateCheckoutDetails({ name, phone, otp, address, paymentMethod }) {
  const errors = {};

  if (name.trim().length < 2) errors.name = "Please enter your full name.";
  if (!/^[6-9]\d{9}$/.test(phone.trim())) {
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  }
  if (!/^\d{4}$/.test(otp.trim()) || otp.trim() !== TEMPORARY_OTP) {
    errors.otp = "Enter the temporary OTP 1234.";
  }
  if (address.trim().length < 15) {
    errors.address = "Please enter a complete delivery address.";
  }
  if (paymentMethod !== "COD") {
    errors.paymentMethod = "Only Cash on Delivery is currently available.";
  }

  return errors;
}
