"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { validateCheckoutDetails } from "@/lib/checkout";

const initialDetails = { name: "", phone: "", otp: "", address: "", paymentMethod: "COD" };
const inputClass = "mt-1.5 w-full border border-[#D8CCB4] bg-[#FFFCF6] px-3 py-2.5 text-[#2F2B27] outline-none transition focus:border-[#C79127] focus:ring-1 focus:ring-[#C79127]";
let razorpayScript;

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScript) return razorpayScript;
  razorpayScript = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Unable to load the secure payment form. Check your connection and retry."));
    document.head.appendChild(script);
  });
  return razorpayScript;
}

export default function CheckoutModal({ open, onClose, onOrderCreated, checkoutType = "CART", buyNowItem = null }) {
  const [details, setDetails] = useState(initialDetails);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const idempotencyKey = useRef(null);
  if (!open) return null;

  const update = (field, value) => { setDetails((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: "" })); setSubmitError(""); };
  const payload = () => ({ customerName: details.name.trim(), phone: details.phone.trim(), otp: details.otp.trim(), deliveryAddress: details.address.trim(), paymentMethod: details.paymentMethod, checkoutType, ...(checkoutType === "BUY_NOW" ? { productId: buyNowItem?.productId, quantity: buyNowItem?.quantity } : {}) });

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;
    const validationErrors = validateCheckoutDetails(details);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;
    if (checkoutType === "BUY_NOW" && (!buyNowItem?.productId || !buyNowItem?.quantity)) { setSubmitError("This product is unavailable. Please return to the product page and try again."); return; }
    setSubmitting(true);
    try {
      if (details.paymentMethod === "COD") {
        const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload()) });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Unable to place your order.");
        onOrderCreated(data);
        return;
      }
      await loadRazorpay();
      idempotencyKey.current ||= crypto.randomUUID();
      const response = await fetch("/api/payments/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload(), idempotencyKey: idempotencyKey.current }) });
      const payment = await response.json().catch(() => ({}));
      if (!response.ok || !payment.razorpayOrderId || !payment.keyId) throw new Error(payment.error || "Unable to initialize online payment.");
      const razorpay = new window.Razorpay({
        key: payment.keyId, amount: payment.amountPaise, currency: "INR", order_id: payment.razorpayOrderId,
        name: "Tharani Textiles", description: "Secure order payment", prefill: { name: details.name, contact: details.phone },
        theme: { color: "#8F4E20" }, modal: { ondismiss: () => { setSubmitting(false); setSubmitError("Payment was cancelled. No order was placed."); } },
        handler: async (responseData) => {
          try {
            const verifyResponse = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(responseData) });
            const verified = await verifyResponse.json().catch(() => ({}));
            if (!verifyResponse.ok || !verified.success) throw new Error(verified.error || "Payment verification failed.");
            onOrderCreated(verified);
          } catch (error) { setSubmitError(error.message || "Payment verification failed. Please contact support if money was debited."); setSubmitting(false); }
        },
      });
      razorpay.on("payment.failed", (eventData) => { setSubmitError(eventData?.error?.description || "Payment failed. No order was placed."); setSubmitting(false); });
      razorpay.open();
    } catch (error) { setSubmitError(error.message || "Unable to start payment. Please try again."); setSubmitting(false); }
  }

  const online = details.paymentMethod !== "COD";
  return <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#2F2417]/45 p-0 backdrop-blur-[1px] sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
    <div className="max-h-[92vh] w-full overflow-y-auto border border-[#DDCFBD] bg-[#FFF9F0] shadow-2xl sm:max-w-xl sm:rounded-sm">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E8DCCB] bg-[#FFF9F0] px-5 py-4 sm:px-7"><div><p className="text-xs uppercase tracking-[0.18em] text-[#B58A45]">Secure checkout</p><h2 id="checkout-title" className="mt-1 font-serif text-2xl text-[#5A1F2F]">Delivery & payment</h2></div><button type="button" onClick={onClose} disabled={submitting} aria-label="Close checkout" className="rounded-full p-2 text-[#5A1F2F] hover:bg-[#F2E6D3] disabled:opacity-50"><X size={20} /></button></div>
      <form onSubmit={submit} className="space-y-7 p-5 sm:p-7">
        <fieldset disabled={submitting} className="space-y-4"><legend className="text-lg font-semibold text-[#3B2928]">Customer information</legend><Field label="Customer name" error={errors.name}><input value={details.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" placeholder="Enter your full name" className={inputClass} /></Field><Field label="Phone number" error={errors.phone}><input value={details.phone} onChange={(event) => update("phone", event.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile number" className={inputClass} /></Field><Field label="OTP" error={errors.otp} hint="For testing, enter 1234"><input value={details.otp} onChange={(event) => update("otp", event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" autoComplete="one-time-code" placeholder="Enter 1234" className={inputClass} /></Field></fieldset>
        <fieldset disabled={submitting}><legend className="text-lg font-semibold text-[#3B2928]">Delivery information</legend><Field label="Full delivery address" error={errors.address} hint="House / Street, Area, City, District, State, Pincode"><textarea value={details.address} onChange={(event) => update("address", event.target.value)} rows={4} autoComplete="street-address" className={`${inputClass} resize-y`} /></Field></fieldset>
        <fieldset disabled={submitting}><legend className="text-lg font-semibold text-[#3B2928]">Payment method</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{[["COD", "Cash on Delivery", "Pay when your order arrives"], ["UPI", "UPI", "Pay securely with Razorpay"], ["CARD", "Card", "Pay securely with Razorpay"]].map(([value, label, description]) => <label key={value} className={`cursor-pointer border p-3 transition ${details.paymentMethod === value ? "border-[#C79127] bg-[#FFF1D4]" : "border-[#E2D5C2] bg-[#FFFCF6]"}`}><input type="radio" name="paymentMethod" value={value} checked={details.paymentMethod === value} onChange={() => update("paymentMethod", value)} className="accent-[#8F4E20]" /><span className="ml-2 text-sm font-semibold text-[#3B2928]">{label}</span><span className="mt-1 block text-xs text-[#7D7267]">{description}</span></label>)}</div>{errors.paymentMethod && <p className="mt-2 text-sm text-red-700">{errors.paymentMethod}</p>}</fieldset>
        {submitError && <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>}<button type="submit" disabled={submitting} className="flex h-13 w-full items-center justify-center bg-[#D49E28] px-5 py-3 font-semibold text-[#2F2417] transition hover:bg-[#BF8C20] disabled:cursor-not-allowed disabled:opacity-70">{submitting ? <><span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-[#2F2417] border-t-transparent" /> {online ? "Opening secure payment..." : "Processing your order..."}</> : online ? "Continue to secure payment" : "Place COD Order"}</button>
      </form>
    </div>
  </div>;
}

function Field({ label, hint, error, children }) { return <label className="block text-sm font-medium text-[#4E4037]"><span>{label}</span>{hint && <span className="ml-2 text-xs font-normal text-[#8A8175]">{hint}</span>}{children}{error && <span className="mt-1 block text-sm font-normal text-red-700">{error}</span>}</label>; }
