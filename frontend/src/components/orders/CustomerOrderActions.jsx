"use client";

import { useState } from "react";
import { Download, AlertCircle, MessageCircle, XCircle } from "lucide-react";

export default function CustomerOrderActions({ orderId, rawStatus, cancellationStatus, cancellationReason, refundStatus }) {
  const status = (rawStatus || "").toLowerCase();
  const canCancel = ["placed", "confirmed"].includes(status) && (!cancellationStatus || cancellationStatus === "NONE");
  const isDelivered = status === "delivered";

  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentStatus, setCurrentStatus] = useState(cancellationStatus || "NONE");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const handleCancelRequest = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/orders/${orderId}/cancellation-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to submit cancellation request");

      setCurrentStatus("REQUESTED");
      if (json.whatsappUrl) {
        setWhatsappUrl(json.whatsappUrl);
      }
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Failed to submit cancellation request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadInvoice = () => {
    window.open(`/api/orders/${orderId}/invoice`, "_blank");
  };

  if (!isDelivered && !canCancel && currentStatus === "NONE" && currentStatus !== "APPROVED") {
    return null;
  }

  return (
    <section className="border border-[#DDCFBD] bg-[#FCF7EF] p-5 md:p-8">
      <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-start">
        <h3 className="text-[20px] font-semibold text-[#211D19]">
          Order Actions
        </h3>

        <div className="space-y-4">
          {/* Invoice Download Button */}
          {isDelivered && (
            <div>
              <button
                onClick={handleDownloadInvoice}
                className="inline-flex items-center justify-center gap-3 border border-[#CDBCA2] bg-[#5A1F2F] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#471825]"
              >
                <Download size={18} />
                <span>Download Official Tax Invoice</span>
              </button>
            </div>
          )}

          {/* Cancellation Button */}
          {canCancel && !showForm && (
            <div>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center justify-center gap-2 border border-[#CDBCA2] px-6 py-3.5 text-[15px] font-semibold text-[#8B263E] transition hover:border-[#8B263E] hover:bg-[#FDF0F2]"
              >
                <XCircle size={18} />
                <span>Request Order Cancellation</span>
              </button>
            </div>
          )}

          {/* Cancellation Form */}
          {canCancel && showForm && (
            <form onSubmit={handleCancelRequest} className="space-y-4 border border-[#DDCFBD] bg-white p-5">
              <h4 className="text-[17px] font-semibold text-[#211D19]">Reason for Cancellation</h4>
              <textarea
                placeholder="Please share the reason for cancelling this order..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
                className="w-full border border-[#DDCFBD] bg-[#FCF7EF] p-3 text-sm text-[#211D19] outline-none focus:border-[#5A1F2F]"
              />
              {error && <p className="text-xs font-semibold text-[#8B263E]">{error}</p>}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting || !reason.trim()}
                  className="border border-[#8B263E] bg-[#5A1F2F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#471825] disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-[#CDBCA2] px-5 py-3 text-sm font-semibold text-[#6C6258] transition hover:bg-[#F8F2E8]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Status Messages */}
          {currentStatus === "REQUESTED" && (
            <div className="border border-[#E5C384] bg-[#FFF9ED] p-4 text-[#7A5B18]">
              <div className="flex items-center gap-2 font-semibold text-[16px]">
                <AlertCircle size={18} /> Cancellation Request Pending Review
              </div>
              <p className="mt-1 text-sm text-[#8C6D25]">
                Your request has been logged. Our customer service team will review and process your request shortly.
              </p>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 border border-[#25D366] bg-[#25D366] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1EBE5A]"
                >
                  <MessageCircle size={16} /> Contact Support on WhatsApp
                </a>
              )}
            </div>
          )}

          {currentStatus === "APPROVED" && (
            <div className="border border-[#CDBCA2] bg-[#F7F2E8] p-4 text-[#211D19]">
              <div className="flex items-center gap-2 font-semibold text-[16px] text-[#5A1F2F]">
                <XCircle size={18} /> Order Cancelled
              </div>
              <p className="mt-1 text-sm text-[#585046]">
                This order has been cancelled.
                {refundStatus === "COMPLETED" && (
                  <span className="block mt-1 font-semibold text-[#0B3D2E]">
                    Payment Refund Status: Refunded to original payment method.
                  </span>
                )}
              </p>
            </div>
          )}

          {currentStatus === "REJECTED" && (
            <div className="border border-[#E8B4B8] bg-[#FDF0F2] p-4 text-[#8B263E]">
              <div className="flex items-center gap-2 font-semibold text-[16px]">
                <XCircle size={18} /> Cancellation Request Declined
              </div>
              <p className="mt-1 text-sm text-[#732034]">
                Your cancellation request was declined by admin. Order processing is continuing.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
