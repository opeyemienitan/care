"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { GA4_ID, META_PIXEL_ID, analyticsConfigured } from "@/lib/analytics";
import { CONSENT_KEY, CONSENT_EVENT, type ConsentValue } from "@/components/ConsentBanner";

/**
 * Loads GA4 / Meta Pixel only once the visitor has granted analytics
 * consent (see ConsentBanner). If no vendor env vars are set, this
 * component renders nothing — the default, credential-free state.
 */
export default function Analytics() {
  const [consent, setConsent] = useState<ConsentValue | null>(null);

  useEffect(() => {
    if (!analyticsConfigured()) return;
    const stored = window.localStorage.getItem(CONSENT_KEY) as ConsentValue | null;
    if (stored) setConsent(stored);

    function onChange(e: Event) {
      setConsent((e as CustomEvent<ConsentValue>).detail);
    }
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  if (consent !== "granted" || !analyticsConfigured()) return null;

  return (
    <>
      {GA4_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA4_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}
      {META_PIXEL_ID && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
