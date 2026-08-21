import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  CheckoutError,
  claimVerifiedPayment,
} from "@/lib/db/order";

import {
  getRazorpayPayment,
  verifyRazorpaySignature,
} from "@/lib/razorpay";

import {
  requireCustomer,
} from "@/lib/checkout-auth";

export async function POST(request) {
  try {
    const { env } =
      await getCloudflareContext({
        async: true,
      });

    const body =
      await request
        .json()
        .catch(() => null);

    const orderId =
      body?.razorpay_order_id;

    const paymentId =
      body?.razorpay_payment_id;

    const signature =
      body?.razorpay_signature;

    /*
     * Razorpay sends all three values
     * after successful checkout.
     */
    if (
      ![
        orderId,
        paymentId,
        signature,
      ].every(
        (value) =>
          typeof value === "string" &&
          value.length > 0
      )
    ) {
      throw new CheckoutError(
        "Invalid payment confirmation."
      );
    }

    /*
     * Verify Razorpay's HMAC signature
     * using the SERVER-SIDE secret.
     */
    const signatureValid =
      await verifyRazorpaySignature(
        env,
        orderId,
        paymentId,
        signature
      );

    if (!signatureValid) {
      throw new CheckoutError(
        "Payment verification failed.",
        400
      );
    }

    /*
     * Find the checkout session created
     * before opening Razorpay.
     */
    const session =
      await env.DB
        .prepare(`
          SELECT
            id,
            user_id,
            amount_paise,
            status,
            checkout_type
          FROM checkout_sessions
          WHERE razorpay_order_id = ?
          LIMIT 1
        `)
        .bind(orderId)
        .first();

    if (!session) {
      throw new CheckoutError(
        "Payment session not found.",
        404
      );
    }

    /*
     * Make sure this payment belongs
     * to the currently logged-in customer.
     */
    const userId =
      await requireCustomer(
        request,
        env
      );

    if (
      String(session.user_id) !==
      String(userId)
    ) {
      throw new CheckoutError(
        "Payment session not found.",
        404
      );
    }

    /*
     * Ask Razorpay directly for the
     * payment details.
     */
    const payment =
      await getRazorpayPayment(
        env,
        paymentId
      );

    /*
     * Never create the order unless
     * ALL of these match:
     *
     * 1. Razorpay order ID
     * 2. Amount
     * 3. Captured status
     */
    if (
      payment.order_id !== orderId
    ) {
      throw new CheckoutError(
        "Payment order mismatch.",
        400
      );
    }

    if (
      Number(payment.amount) !==
      Number(session.amount_paise)
    ) {
      throw new CheckoutError(
        "Payment amount mismatch.",
        400
      );
    }

    if (
      payment.status !== "captured"
    ) {
      throw new CheckoutError(
        "Payment has not been captured yet.",
        400
      );
    }

    /*
     * Create the actual order.
     *
     * claimVerifiedPayment also handles
     * duplicate verification safely.
     */
    const result =
      await claimVerifiedPayment(
        env.DB,
        {
          razorpayOrderId:
            orderId,

          razorpayPaymentId:
            paymentId,

          razorpaySignature:
            signature,

          userId,
        }
      );

    return Response.json({
      success: true,

      orderId:
        result.orderId,

      paymentStatus:
        "paid",

      duplicate:
        Boolean(result.duplicate),
    });
  } catch (error) {
    console.error(
      "VERIFY Razorpay payment error",
      {
        message: error?.message,
      }
    );

    return Response.json(
      {
        success: false,

        error:
          error instanceof
          CheckoutError
            ? error.message
            : "Unable to verify payment.",
      },
      {
        status:
          error instanceof
          CheckoutError
            ? error.status
            : 500,
      }
    );
  }
}