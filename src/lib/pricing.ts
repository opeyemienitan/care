/**
 * Monetization model.
 *
 * Take-rate marketplace, same shape as the established UK comparable
 * (HomeTouch charges 20–30% inc. VAT of the carer's stated rate, deducted
 * ongoingly from the carer's payout across the life of the engagement — see
 * README "How Marram Care makes money" for the sourced research). Marram
 * Care launches lower to win supply in a market where professionals can
 * choose between platforms, then can raise take rate as verified supply and
 * trust become the differentiator.
 *
 * The rate a family sees already includes the platform fee — professionals
 * are paid (rate - fee), never asked to add it on top, so pricing stays
 * simple and comparable to a plain hourly rate.
 */
export const PLATFORM_FEE_PERCENT = 15; // launch rate; HomeTouch benchmark is 20-30%
export const PAYMENT_PROCESSING_PERCENT = 1.75; // Stripe UK ~1.5% + Connect distribution ~0.25%
export const PAYMENT_PROCESSING_FIXED = 0.2; // + 20p per transaction

export interface FeeBreakdown {
  hourlyRate: number;
  platformFee: number;
  professionalPayout: number;
  platformFeePercent: number;
}

export function computeFeeBreakdown(hourlyRate: number): FeeBreakdown {
  const platformFee = Number((hourlyRate * (PLATFORM_FEE_PERCENT / 100)).toFixed(2));
  const professionalPayout = Number((hourlyRate - platformFee).toFixed(2));
  return { hourlyRate, platformFee, professionalPayout, platformFeePercent: PLATFORM_FEE_PERCENT };
}

export function processingCostOn(amount: number): number {
  return Number((amount * (PAYMENT_PROCESSING_PERCENT / 100) + PAYMENT_PROCESSING_FIXED).toFixed(2));
}
