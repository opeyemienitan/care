import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Your Professional Profile",
  robots: { index: false, follow: false },
};

import { Card, Field, inputClass, Button } from "@/components/ui";
import { completeProfessionalOnboarding } from "@/app/actions";
import { EXPERIENCE_TAGS } from "@/lib/tags";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfessionalOnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="container-page py-16 max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-coral-500">
        Professional application
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Build your specialist profile</h1>
      <p className="mt-2 text-ink/60">
        Your profile goes live once our team verifies your documents. Everything below is stored
        securely and only shared with families you match with.
      </p>

      <Card className="mt-8 p-8">
        <form action={completeProfessionalOnboarding} className="space-y-6">
          <Field label="Headline" hint="e.g. Registered Nursing Associate — complex & palliative care">
            <input className={inputClass} name="headline" required placeholder="Your professional headline" />
          </Field>

          <Field label="About you">
            <textarea className={inputClass} name="bio" rows={4} required placeholder="Your experience, approach, and what families can expect." />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Hourly rate (£)">
              <input className={inputClass} type="number" name="hourlyRate" defaultValue={18} min={10} required />
            </Field>
            <Field label="Years of experience">
              <input className={inputClass} type="number" name="yearsExperience" defaultValue={1} min={0} required />
            </Field>
          </div>

          <Field label="Location" hint="Town or city">
            <input className={inputClass} name="location" required placeholder="e.g. Leeds" />
          </Field>

          <div>
            <span className="block text-sm font-medium text-ink mb-2">
              Specialist experience — select what applies and your hands-on level.
            </span>
            <div className="space-y-2">
              {EXPERIENCE_TAGS.map((tag) => (
                <div
                  key={tag.key}
                  className="flex items-center justify-between gap-3 rounded-lg border border-sand-200 px-3 py-2.5"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="tagKeys" value={tag.key} className="accent-teal-600" />
                    {tag.label}
                  </label>
                  <select name={`level_${tag.key}`} className="text-xs rounded-md border border-sand-200 py-1 px-2" defaultValue="TRAINED">
                    <option value="TRAINED">Trained</option>
                    <option value="ONE_PLUS">1+ years hands-on</option>
                    <option value="FIVE_PLUS">5+ years hands-on</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-sand-200 pt-6">
            <p className="text-sm font-medium text-ink mb-3">Verification documents</p>
            <div className="space-y-4">
              <Field label="DBS certificate">
                <input className={inputClass} type="file" name="dbsFile" accept=".pdf,.jpg,.png" />
              </Field>
              <Field label="Reference letter">
                <input className={inputClass} type="file" name="referenceFile" accept=".pdf,.jpg,.png" />
              </Field>
              <Field label="Qualification / Care Certificate">
                <input className={inputClass} type="file" name="qualificationFile" accept=".pdf,.jpg,.png" />
              </Field>
            </div>
            <p className="mt-3 text-xs text-ink/50">
              Documents are reviewed by our verification team, typically within 2 business days.
            </p>
            <label className="mt-4 flex items-start gap-2.5 text-sm rounded-lg border border-sand-200 px-3 py-2.5 cursor-pointer">
              <input type="checkbox" name="dbsUpdateServiceSubscribed" className="mt-0.5 accent-teal-600" />
              <span>
                I&apos;m subscribed to the{" "}
                <a
                  href="https://www.gov.uk/dbs-update-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 font-medium"
                >
                  DBS Update Service
                </a>{" "}
                (recommended — lets families and Marram Care check your status in real time)
              </span>
            </label>
          </div>

          <Button type="submit" className="w-full">
            Submit application
          </Button>
        </form>
      </Card>
    </div>
  );
}
