/**
 * Payments adapter — mock Stripe Connect.
 *
 * Real integration target: Stripe Connect (Express accounts) for
 * professional payouts + Stripe PaymentIntents with manual capture for the
 * escrow-style "hold on request, release on completion" flow. Using Stripe
 * Connect for payouts also means Stripe (an FCA/EU-authorised payment
 * institution) holds and moves the money — Marram Care never touches client
 * funds directly, which is what keeps this out of FCA payment-services
 * authorisation territory (see /trust-and-safety).
 *
 * Mock mode (default, no STRIPE_SECRET_KEY set) runs the exact same
 * workflow — authorize on request, release on completion, refund on
 * decline/cancel — against the local `payments` table instead of Stripe's
 * API, so the booking lifecycle and admin revenue reporting are real and
 * testable today. Swap in real Stripe calls behind the same three
 * functions when you have API keys.
 */
import { run, get, id, nowIso } from "./db";
import { computeFeeBreakdown } from "./pricing";

function usingRealStripe() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export async function connectPayoutAccount(professionalId: string) {
  if (usingRealStripe()) {
    throw new Error("STRIPE_SECRET_KEY is set but the live Stripe Connect adapter isn't implemented in this build.");
  }
  const mockAccountId = `acct_mock_${Math.random().toString(36).slice(2, 12)}`;
  await run(
    "UPDATE professional_profiles SET payout_account_connected = 1, payout_provider_ref = $ref WHERE id = $id",
    { id: professionalId, ref: mockAccountId }
  );
  return { accountId: mockAccountId };
}

export async function authorizePayment(bookingId: string) {
  const booking = await get("SELECT * FROM bookings WHERE id = $id", { id: bookingId });
  if (!booking) return null;
  const { platformFee, professionalPayout } = computeFeeBreakdown(booking.rate_at_booking);

  const paymentId = id("pay");
  await run(
    `INSERT INTO payments (id, booking_id, family_id, professional_id, gross_amount, platform_fee_amount, professional_payout_amount, status, provider, provider_ref, created_at)
     VALUES ($id, $bid, $fid, $pid, $gross, $fee, $payout, 'AUTHORIZED', $provider, $ref, $createdAt)`,
    {
      id: paymentId,
      bid: bookingId,
      fid: booking.family_id,
      pid: booking.professional_id,
      gross: booking.rate_at_booking,
      fee: platformFee,
      payout: professionalPayout,
      provider: usingRealStripe() ? "stripe" : "mock-stripe-connect",
      ref: usingRealStripe() ? null : `pi_mock_${Math.random().toString(36).slice(2, 12)}`,
      createdAt: nowIso(),
    }
  );
  return paymentId;
}

async function updatePaymentStatus(bookingId: string, status: "RELEASED" | "REFUNDED") {
  const payment = await get("SELECT * FROM payments WHERE booking_id = $bid ORDER BY created_at DESC", { bid: bookingId });
  if (!payment) return;
  await run("UPDATE payments SET status = $status, released_at = $releasedAt WHERE id = $id", {
    id: payment.id,
    status,
    releasedAt: status === "RELEASED" ? nowIso() : null,
  });
}

export async function releasePayment(bookingId: string) {
  await updatePaymentStatus(bookingId, "RELEASED");
}

export async function refundPayment(bookingId: string) {
  await updatePaymentStatus(bookingId, "REFUNDED");
}

export async function getPaymentForBooking(bookingId: string) {
  return get("SELECT * FROM payments WHERE booking_id = $bid ORDER BY created_at DESC", { bid: bookingId });
}
