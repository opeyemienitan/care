"use client";

import { useSearchParams } from "next/navigation";
import { subscribeLeadAction } from "@/app/marketing-actions";
import { inputClass } from "./ui";

export default function NewsletterForm({ source, redirectTo }: { source: string; redirectTo: string }) {
  const searchParams = useSearchParams();
  const subscribed = searchParams.get("subscribed");

  if (subscribed === "true") {
    return (
      <p className="text-sm text-teal-700 font-medium">
        You&apos;re on the list — we&apos;ll email you when there&apos;s news.
      </p>
    );
  }

  return (
    <form action={subscribeLeadAction} className="flex gap-2">
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        className={inputClass}
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium px-4"
      >
        Notify me
      </button>
      {subscribed === "error" && (
        <p className="sr-only">Please enter a valid email.</p>
      )}
    </form>
  );
}
