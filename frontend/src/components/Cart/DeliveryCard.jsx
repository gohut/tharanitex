"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Truck,
  XCircle,
} from "lucide-react";

export default function DeliveryCard() {
  const [pincode, setPincode] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);

  const handlePincodeChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setPincode(value);

    /*
     * Clear the previous result whenever
     * the customer changes the pincode.
     */
    setResult(null);
  };

  const checkDelivery = async () => {
    if (pincode.length !== 6) {
      setResult({
        available: false,
        type: "error",
        message:
          "Please enter a valid 6-digit pincode.",
      });

      return;
    }

    setChecking(true);
    setResult(null);

    try {
      const response = await fetch(
        `/api/delivery/check?pincode=${encodeURIComponent(
          pincode
        )}`,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setResult({
          available: false,
          type: "error",
          message:
            data?.message ||
            "Unable to check delivery availability.",
        });

        return;
      }

      if (!data.available) {
        setResult({
          available: false,
          type: "error",
          message:
            data.message ||
            "Delivery is not available to this pincode.",
        });

        return;
      }

      setResult({
        available: true,
        type: "success",
        message:
          data.message ||
          "Delivery is available to this location.",
        city: data.city,
        state: data.state,
        postOffice: data.postOffice,
        estimatedDelivery:
          data.estimatedDelivery ||
          "2–4 Business Days",
      });
    } catch (error) {
      console.error(
        "Delivery check failed:",
        error
      );

      setResult({
        available: false,
        type: "error",
        message:
          "Unable to check delivery availability. Please try again.",
      });
    } finally {
      setChecking(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      checkDelivery();
    }
  };

  return (
    <div className="mt-6 rounded-sm border border-[#E8DCCB] bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MapPin
          className="text-[#D49E28]"
          size={22}
        />

        <h3 className="text-2xl font-serif text-[#5A1F2F]">
          Delivery
        </h3>
      </div>

      <p className="mt-2 text-sm text-[#7B7367]">
        Check if delivery is available at your location.
      </p>

      {/* Pincode Input */}
      <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={handlePincodeChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter Pincode"
          aria-label="Delivery pincode"
          disabled={checking}
          className="
            flex-1
            h-14
            px-4
            text-base
            border-2
            border-[#D8CCB4]
            rounded-sm
            outline-none
            focus:border-[#D49E28]
            bg-[#FFFDF8]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        />

        <button
          type="button"
          onClick={checkDelivery}
          disabled={checking || pincode.length !== 6}
          className="
            h-10
            px-5
            self-center
            text-sm
            font-medium
            bg-[#5A1F2F]
            text-white
            rounded-sm
            hover:bg-[#471825]
            transition
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:h-11
            sm:self-auto
          "
        >
          {checking ? (
            <span className="flex items-center gap-2">
              <Loader2
                size={16}
                className="animate-spin"
              />
              Checking
            </span>
          ) : (
            "Check"
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`mt-5 rounded-sm border p-4 ${
            result.available
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-start gap-3">
            {result.available ? (
              <CheckCircle2
                size={21}
                className="mt-0.5 shrink-0 text-green-600"
              />
            ) : (
              <XCircle
                size={21}
                className="mt-0.5 shrink-0 text-red-500"
              />
            )}

            <div className="min-w-0">
              <p
                className={`text-sm font-semibold ${
                  result.available
                    ? "text-green-800"
                    : "text-red-700"
                }`}
              >
                {result.message}
              </p>

              {result.available && (
                <>
                  {(result.city ||
                    result.state) && (
                    <p className="mt-1 text-sm text-[#5F5A52]">
                      {result.city}
                      {result.city &&
                        result.state &&
                        ", "}
                      {result.state}
                    </p>
                  )}

                  {result.postOffice && (
                    <p className="mt-1 text-xs text-[#7B7367]">
                      {result.postOffice}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delivery estimate */}
      {result?.available && (
        <div className="mt-5 flex items-center gap-3 text-[#4B4B4B]">
          <Truck
            size={20}
            className="text-[#D49E28]"
          />

          <span>
            Estimated Delivery:{" "}
            <span className="font-semibold">
              {result.estimatedDelivery}
            </span>
          </span>
        </div>
      )}

      {/* Initial state */}
      {!result && (
        <div className="mt-6 flex items-center gap-3 text-[#4B4B4B]">
          <Truck
            size={20}
            className="text-[#D49E28]"
          />

          <span>
            Estimated Delivery:{" "}
            <span className="font-semibold">
              Check your pincode
            </span>
          </span>
        </div>
      )}
    </div>
  );
}