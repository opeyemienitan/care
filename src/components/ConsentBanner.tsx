"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { analyticsConfigured } from "@/lib/analytics";

export const CONSENT_KEY = "mc_consent";
export const CONSENT_EVENT = "mc-consent-change";

export type ConsentValue = "granted" | "denied";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!analyticsConfigured()) return; // nothing to ask consent for in this build
    const existing = window.localStorage.getItem(CONSENT_KEY);
    if (!existing) setVisible(true);
  }, []);

  function choose(value: ConsentValue) {
    window.localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-sand-200 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="container-page py-4 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-ink/70 max-w-xl">
          We use analytics cookies to understand how families and professionals use Marram Care.
          We only load them with your consent — see our{" "}
          <a href="/trust-and-safety" className="text-teal-700 font-medium underline">
            privacy approach
          </a>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => choose("denied")}>
            Reject non-essential
          </Button>
          <Button size="sm" onClick={() => choose("granted")}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
