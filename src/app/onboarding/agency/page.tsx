import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAgencyByUserId } from "@/lib/queries";
import { Card, Field, inputClass, Button, SectionHeading } from "@/components/ui";
import { completeAgencyOnboardingAction } from "@/app/agency-actions";

export const metadata: Metadata = {
  title: "Set Up Your Agency Profile",
  robots: { index: false, follow: false },
};

export default async function AgencyOnboardingPage({ searchParams }: { searchParams: { error?: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "AGENCY") redirect("/login");

  const existing = await getAgencyByUserId(user.id);
  if (existing) redirect("/dashboard/agency");

  return (
    <div className="container-page py-14 max-w-2xl">
      <SectionHeading
        eyebrow="Agency onboarding"
        title="Tell us about your agency"
        subtitle="This appears on your public agency profile, and starts admin verification so families can trust your roster."
      />

      <Card className="mt-8 p-8">
        {searchParams?.error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">
            {searchParams.error}
          </p>
        )}
        <form action={completeAgencyOnboardingAction} className="space-y-5">
          <Field label="Company name">
            <input className={inputClass} name="companyName" required placeholder="e.g. Northwest Complex Care Ltd" />
          </Field>
          <Field label="About your agency" hint="What kind of care do you specialise in, and what makes your staff stand out?">
            <textarea className={inputClass} name="description" rows={4} required />
          </Field>
          <Field label="Primary service area">
            <input className={inputClass} name="location" required placeholder="e.g. Greater Manchester" />
          </Field>
          <Field label="Website" hint="Optional">
            <input className={inputClass} type="url" name="website" placeholder="https://" />
          </Field>
          <Field label="Companies House number" hint="Optional, but speeds up verification">
            <input className={inputClass} name="companyNumber" placeholder="e.g. 12345678" />
          </Field>
          <div className="rounded-lg border border-sand-200 p-4">
            <label className="flex items-start gap-3">
              <input type="checkbox" name="cqcRegistered" className="mt-1" />
              <span className="text-sm text-ink/70">
                My agency is CQC-registered (only applicable if you directly manage or deliver
                regulated care, rather than purely introducing staff).
              </span>
            </label>
            <div className="mt-3">
              <Field label="CQC provider number" hint="Optional — only if registered">
                <input className={inputClass} name="cqcNumber" placeholder="e.g. 1-234567890" />
              </Field>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Create agency profile
          </Button>
        </form>
      </Card>
    </div>
  );
}
