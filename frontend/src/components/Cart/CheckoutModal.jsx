"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { validateCheckoutDetails } from "@/lib/checkout";

const initialDetails = {
  name: "",
  phone: "",
  address: "",
  paymentMethod: "COD",
};

const inputClass =
  "mt-1.5 w-full border border-[#D8CCB4] bg-[#FFFCF6] px-3 py-2.5 text-[#2F2B27] outline-none transition focus:border-[#C79127] focus:ring-1 focus:ring-[#C79127]";

let razorpayScript = null;

function loadRazorpay() {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Payment can only be started in the browser.")
    );
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (razorpayScript) {
    return razorpayScript;
  }

  razorpayScript = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener(
        "error",
        () =>
          reject(
            new Error(
              "Unable to load the secure payment form. Check your connection and retry."
            )
          ),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve();

    script.onerror = () => {
      razorpayScript = null;
      reject(
        new Error(
          "Unable to load the secure payment form. Check your connection and retry."
        )
      );
    };

    document.head.appendChild(script);
  });

  return razorpayScript;
}

export default function CheckoutModal({
  open,
  onClose,
  onOrderCreated,
  checkoutType = "CART",
  buyNowItem = null,
}) {
  const [details, setDetails] = useState(initialDetails);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [useDefaultAddress, setUseDefaultAddress] = useState(false);

  const idempotencyKey = useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let ignore = false;

    let name = "";
    let phone = "";
    let address = "";

    const userStr =
      typeof window !== "undefined"
        ? localStorage.getItem("currentUser")
        : null;

    if (userStr) {
      try {
        const user = JSON.parse(userStr);

        name = user.name || "";
        phone = user.contact || user.phone || "";

        if (user.address) {
          address =
            user.pincode &&
            !user.address.includes(user.pincode)
              ? `${user.address}, ${user.pincode}`
              : user.address;
        }
      } catch {
        // Ignore malformed local storage.
      }
    }

    async function loadProfile() {
      let profileName = name;
      let profilePhone = phone;
      let profileAddress = address;

      try {
        const response = await fetch(
          "/api/customer/addresses",
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const json = await response.json();

          const addresses = json?.data || json || [];

          if (
            Array.isArray(addresses) &&
            addresses.length > 0
          ) {
            const defaultAddress =
              addresses.find(
                (item) =>
                  item.is_default ||
                  item.isDefault ||
                  item.is_default === 1
              ) || addresses[0];

            if (defaultAddress) {
              const line1 =
                defaultAddress.address_line1 ||
                defaultAddress.addressLine1 ||
                "";

              const line2 =
                defaultAddress.address_line2 ||
                defaultAddress.addressLine2 ||
                "";

              const city = defaultAddress.city || "";
              const state = defaultAddress.state || "";
              const pin = defaultAddress.pincode || "";

              const dbAddress = [
                line1,
                line2,
                city,
                state,
                pin,
              ]
                .filter(Boolean)
                .join(", ");

              const dbName =
                defaultAddress.full_name ||
                defaultAddress.fullName ||
                name;

              const dbPhone =
                defaultAddress.phone || phone;

              if (dbAddress) {
                profileName = dbName;
                profilePhone = dbPhone;
                profileAddress = dbAddress;
              }
            }
          } else {
            const profileResponse = await fetch(
              "/api/auth/profile",
              {
                credentials: "include",
              }
            );

            if (profileResponse.ok) {
              const data =
                await profileResponse.json();

              if (data?.data) {
                const profile = data.data;

                profileName =
                  profile.name || name;

                profilePhone =
                  profile.phone ||
                  profile.contact ||
                  phone;

                let profileAddress =
                  profile.address || address;

                if (
                  profile.pincode &&
                  profileAddress &&
                  !profileAddress.includes(
                    profile.pincode
                  )
                ) {
                  profileAddress = `${profileAddress}, ${profile.pincode}`;
                }

                profileAddress = profileAddress;
              }
            }
          }
        }
      } catch {
        // Profile loading should never block checkout.
      }

      if (!ignore) {
        setProfileData({
          name: profileName,
          phone: profilePhone,
          address: profileAddress,
        });

        setDetails((current) => ({
          ...current,
          name: current.name || profileName,
          phone: current.phone || profilePhone,
        }));
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const update = (field, value) => {
    setDetails((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));

    setSubmitError("");

    if (
      field === "address" &&
      useDefaultAddress &&
      value !== profileData.address
    ) {
      setUseDefaultAddress(false);
    }
  };

  const handleToggleDefaultAddress = (checked) => {
    setUseDefaultAddress(checked);

    if (checked && profileData.address) {
      setDetails((current) => ({
        ...current,
        address: profileData.address,
        name: current.name || profileData.name,
        phone: current.phone || profileData.phone,
      }));

      setErrors((current) => ({
        ...current,
        address: "",
        name: "",
        phone: "",
      }));
    }
  };

  const buildPayload = () => {
    const payload = {
      customerName: details.name.trim(),
      phone: details.phone.trim(),
      deliveryAddress: details.address.trim(),
      paymentMethod: details.paymentMethod,
      checkoutType,
    };

    if (checkoutType === "BUY_NOW") {
      payload.productId = buyNowItem?.productId;
      payload.variantId =
        buyNowItem?.variantId ?? null;
      payload.quantity = buyNowItem?.quantity;
    }

    return payload;
  };

  async function submit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitError("");

    const validationErrors =
      validateCheckoutDetails(details);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (
      checkoutType === "BUY_NOW" &&
      (!buyNowItem?.productId ||
        !buyNowItem?.quantity)
    ) {
      setSubmitError(
        "This product is unavailable. Please return to the product page and try again."
      );

      return;
    }

    setSubmitting(true);

    try {
      const payload = buildPayload();

      /*
       * COD
       */
      if (details.paymentMethod === "COD") {
        const response = await fetch(
          "/api/orders",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );

        const data =
          await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to place your order."
          );
        }

        onOrderCreated(data);
        return;
      }

      /*
       * RAZORPAY
       */

      await loadRazorpay();

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay could not be loaded. Please refresh and try again."
        );
      }

      if (!idempotencyKey.current) {
        idempotencyKey.current =
          crypto.randomUUID();
      }

      const response = await fetch(
        "/api/payments/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...payload,
            idempotencyKey:
              idempotencyKey.current,
          }),
        }
      );

      const payment =
        await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payment?.error ||
            "Unable to initialize online payment."
        );
      }

      if (
        !payment.razorpayOrderId ||
        !payment.keyId ||
        !Number(payment.amountPaise)
      ) {
        throw new Error(
          "Invalid payment order received from the server."
        );
      }

      const razorpay = new window.Razorpay({
        key: payment.keyId,

        amount: Number(payment.amountPaise),

        currency:
          payment.currency || "INR",

        order_id:
          payment.razorpayOrderId,

        name: "Tharani Textiles",

        description:
          "Tharani Textiles Order",

        prefill: {
          name: details.name.trim(),
          contact: details.phone.trim(),
        },

        notes: {
          checkout_type: checkoutType,
        },

        theme: {
          color: "#8F4E20",
        },

        modal: {
          ondismiss: () => {
            setSubmitting(false);

            setSubmitError(
              "Payment was cancelled. No order was placed."
            );
          },
        },

        handler: async (responseData) => {
          try {
            const verifyResponse =
              await fetch(
                "/api/payments/verify",
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify(
                    responseData
                  ),
                }
              );

            const verified =
              await verifyResponse
                .json()
                .catch(() => ({}));

            if (!verifyResponse.ok) {
              throw new Error(
                verified?.error ||
                  "Payment verification failed."
              );
            }

            if (!verified?.success) {
              throw new Error(
                verified?.error ||
                  "Payment verification failed."
              );
            }

            onOrderCreated(verified);
          } catch (error) {
            console.error(
              "Razorpay verification failed:",
              error
            );

            setSubmitError(
              error?.message ||
                "Payment verification failed. Please contact support if money was debited."
            );

            setSubmitting(false);
          }
        },
      });

      razorpay.on(
        "payment.failed",
        (eventData) => {
          console.error(
            "Razorpay payment failed:",
            eventData
          );

          setSubmitError(
            eventData?.error?.description ||
              "Payment failed. No order was placed."
          );

          setSubmitting(false);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Checkout submission failed:",
        error
      );

      setSubmitError(
        error?.message ||
          "Unable to start payment. Please try again."
      );

      setSubmitting(false);
    }
  }

  const online =
    details.paymentMethod !== "COD";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#2F2417]/45 p-0 backdrop-blur-[1px] sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
    >
      <div className="max-h-[92vh] w-full overflow-y-auto border border-[#DDCFBD] bg-[#FFF9F0] shadow-2xl sm:max-w-xl sm:rounded-sm">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E8DCCB] bg-[#FFF9F0] px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#B58A45]">
              Secure checkout
            </p>

            <h2
              id="checkout-title"
              className="mt-1 font-serif text-2xl text-[#5A1F2F]"
            >
              Delivery & payment
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close checkout"
            className="rounded-full p-2 text-[#5A1F2F] hover:bg-[#F2E6D3] disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="space-y-7 p-5 sm:p-7"
        >
          <fieldset
            disabled={submitting}
            className="space-y-4"
          >
            <legend className="text-lg font-semibold text-[#3B2928]">
              Customer information
            </legend>

            <Field
              label="Customer name"
              error={errors.name}
            >
              <input
                value={details.name}
                onChange={(event) =>
                  update(
                    "name",
                    event.target.value
                  )
                }
                autoComplete="name"
                placeholder="Enter your full name"
                className={inputClass}
              />
            </Field>

            <Field
              label="Phone number"
              error={errors.phone}
            >
              <input
                value={details.phone}
                onChange={(event) =>
                  update(
                    "phone",
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10)
                  )
                }
                inputMode="numeric"
                autoComplete="tel"
                placeholder="10-digit mobile number"
                className={inputClass}
              />
            </Field>
          </fieldset>

          <fieldset
            disabled={submitting}
            className="space-y-3"
          >
            <legend className="text-lg font-semibold text-[#3B2928]">
              Delivery information
            </legend>

            <Field
              label="Full delivery address"
              error={errors.address}
              hint="House / Street, Area, City, District, State, Pincode"
            >
              <textarea
                value={details.address}
                onChange={(event) =>
                  update(
                    "address",
                    event.target.value
                  )
                }
                rows={4}
                autoComplete="street-address"
                className={`${inputClass} resize-y`}
              />
            </Field>

            <div className="mt-2.5 flex items-center">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#4E4037]">
                <input
                  type="checkbox"
                  checked={useDefaultAddress}
                  onChange={(event) =>
                    handleToggleDefaultAddress(
                      event.target.checked
                    )
                  }
                  className="h-4 w-4 rounded border-[#D8CCB4] accent-[#8F4E20] focus:ring-[#C79127]"
                />

                <span>
                  Use default address from profile
                </span>
              </label>
            </div>

            {useDefaultAddress &&
              !profileData.address && (
                <p className="text-xs italic text-[#8F4E20]">
                  No saved address found in
                  profile. Please type your
                  delivery address above.
                </p>
              )}
          </fieldset>

          <fieldset disabled={submitting}>
            <legend className="text-lg font-semibold text-[#3B2928]">
              Payment method
            </legend>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[
                [
                  "COD",
                  "Cash on Delivery",
                  "Testing only · Pay when your order arrives",
                ],
                [
                  "UPI",
                  "UPI",
                  "Pay securely with Razorpay",
                ],
                [
                  "CARD",
                  "Card",
                  "Pay securely with Razorpay",
                ],
              ].map(
                ([
                  value,
                  label,
                  description,
                ]) => (
                  <label
                    key={value}
                    className={`cursor-pointer border p-3 transition ${
                      details.paymentMethod ===
                      value
                        ? "border-[#C79127] bg-[#FFF1D4]"
                        : "border-[#E2D5C2] bg-[#FFFCF6]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      checked={
                        details.paymentMethod ===
                        value
                      }
                      onChange={() =>
                        update(
                          "paymentMethod",
                          value
                        )
                      }
                      className="accent-[#8F4E20]"
                    />

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#3B2928]">
                        {label}
                      </span>

                      {value === "COD" && (
                        <span className="rounded-full bg-[#F4D9A0] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7A5412]">
                          Testing
                        </span>
                      )}
                    </div>

                    <span className="mt-1 block text-xs text-[#7D7267]">
                      {description}
                    </span>
                  </label>
                )
              )}
            </div>

            {errors.paymentMethod && (
              <p className="mt-2 text-sm text-red-700">
                {errors.paymentMethod}
              </p>
            )}
          </fieldset>

          {submitError && (
            <p
              role="alert"
              className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-13 w-full items-center justify-center bg-[#D49E28] px-5 py-3 font-semibold text-[#2F2417] transition hover:bg-[#BF8C20] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-[#2F2417] border-t-transparent" />

                {online
                ? "Continue to secure payment"
                : "Place Test COD Order"}
              </>
            ) : online ? (
              "Continue to secure payment"
            ) : (
              "Place COD Order"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}) {
  return (
    <label className="block text-sm font-medium text-[#4E4037]">
      <span>{label}</span>

      {hint && (
        <span className="ml-2 text-xs font-normal text-[#8A8175]">
          {hint}
        </span>
      )}

      {children}

      {error && (
        <span className="mt-1 block text-sm font-normal text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}