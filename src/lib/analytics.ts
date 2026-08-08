/**
 * Analytics/ads configuration — env-gated, consent-aware.
 *
 * No vendor is wired in unless its env var is set, so the app runs (and
 * builds) with zero tracking by default. Scripts only load client-side,
 * after the visitor has explicitly accepted analytics/marketing cookies
 * via <ConsentBanner /> — see src/components/Analytics.tsx.
 *
 * Real integration targets:
 *  - GA4: set NEXT_PUBLIC_GA4_MEASUREMENT_ID (e.g. G-XXXXXXX)
 *  - Meta Pixel: set NEXT_PUBLIC_META_PIXEL_ID
 */
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "";
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export function analyticsConfigured() {
  return Boolean(GA4_ID || META_PIXEL_ID);
}
