import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Your Care Profile",
  robots: { index: false, follow: false },
};

import { Card, Field, inputClass } from "@/components/ui";
import { Button } from "@/components/ui";
import { completeFamilyOnboarding } from "@/app/actions";
import { FUNDING_SOURCES } from "@/lib/funding";
import CareNeedsIntake from "@/components/CareNeedsIntake";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function FamilyOnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="container-page py-16 max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-coral-500">Step 1 of 1</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Tell us about the care you need</h1>
      <p className="mt-2 text-ink/60">
        This builds your care profile — it&apos;s what drives every match we show you.
      </p>

      <Card className="mt-8 p-8">
        <form action={completeFamilyOnboarding} className="space-y-6">
          <Field label="Who needs care?" hint="e.g. Mum (Adaeze), Son (Oskar, 9)">
            <input className={inputClass} name="careRecipientName" required placeholder="e.g. Mum (Adaeze)" />
          </Field>

          <CareNeedsIntake />

          <Field label="Location" hint="Town or city">
            <input className={inputClass} name="location" required placeholder="e.g. Manchester" />
          </Field>

          <div>
            <span className="block text-sm font-medium text-ink mb-2">How will care be funded?</span>
            <div className="space-y-2">
              {FUNDING_SOURCES.map((f) => (
                <label
                  key={f.value}
                  className="flex items-start gap-3 rounded-lg border border-sand-200 px-3 py-2.5 text-sm cursor-pointer hover:border-teal-300"
                >
                  <input type="radio" name="fundingSource" value={f.value} defaultChecked={f.value === "SELF_FUNDED"} className="mt-0.5 accent-teal-600" />
                  <span>
                    <span className="block font-medium text-ink">{f.label}</span>
                    <span className="block text-ink/50 text-xs mt-0.5">{f.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Budget from (£/hr)">
              <input className={inputClass} type="number" name="budgetMin" defaultValue={15} min={10} />
            </Field>
            <Field label="Budget to (£/hr)">
              <input className={inputClass} type="number" name="budgetMax" defaultValue={25} min={10} />
            </Field>
          </div>

          <Field label="Anything else professionals should know?" hint="Optional">
            <textarea className={inputClass} name="notes" rows={3} placeholder="Schedule, routines, preferences..." />
          </Field>

          <label className="flex items-start gap-2.5 text-xs text-ink/60 rounded-lg bg-sand-50 p-3">
            <input type="checkbox" name="consent" required className="mt-0.5 accent-teal-600" />
            <span>
              I consent to Marram Care processing the health and care information above (special
              category data under UK GDPR) to find and share it with matched professionals. See our{" "}
              <a href="/trust-and-safety" className="text-teal-700 font-medium">
                Trust &amp; Safety policy
              </a>
              .
            </span>
          </label>

          <Button type="submit" className="w-full">
            See my matches
          </Button>
        </form>
      </Card>
    </div>
  );
}
