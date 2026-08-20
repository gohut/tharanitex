export function validateCheckoutDetails({ name, phone, address, paymentMethod }) {
  const errors = {};

  if (name.trim().length < 2) errors.name = "Please enter your full name.";
  if (!/^[6-9]\d{9}$/.test(phone.trim())) {
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  }
  if (address.trim().length < 15) {
    errors.address = "Please enter a complete delivery address.";
  }
  if (!["COD", "UPI", "CARD"].includes(paymentMethod)) {
    errors.paymentMethod = "Choose a payment method.";
  }

  return errors;
}
