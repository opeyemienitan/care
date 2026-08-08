import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Care Agencies",
  description: "Bring your vetted roster of complex care professionals onto Marram Care and get matched with families who need exactly what your staff offer.",
};

import { Card, SectionHeading, LinkButton } from "@/components/ui";

export default function ForAgenciesPage() {
  return (
    <div className="container-page py-16">
      <SectionHeading
        eyebrow="For care agencies"
        title="Find placements for your roster, matched on real specialist experience."
        subtitle="List your vetted staff on Marram Care and let families discover them by the specific complex care experience they need — not a generic staffing listing."
      />

      <div className="mt-12 grid sm:grid-cols-3 gap-6">
        {[
          { title: "Bring your roster", body: "Invite each professional by email — they keep their own verified profile, and it's tagged with your agency once you're verified." },
          { title: "Get discovered", body: "Families searching by specialism see your staff alongside independents, with a clear 'via [Agency]' badge and a link to your full roster." },
          { title: "Staff paid directly", body: "Each professional connects their own payout account — Marram Care never routes roster earnings through the agency, keeping payouts simple and transparent." },
        ].map((f) => (
          <Card key={f.title} className="p-6">
            <h3 className="font-semibold text-ink">{f.title}</h3>
            <p className="mt-2 text-sm text-ink/60">{f.body}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-8 p-6 bg-sand-50 border-sand-200">
        <h3 className="font-semibold text-ink">How it works</h3>
        <ol className="mt-3 space-y-2 text-sm text-ink/70 list-decimal list-inside">
          <li>Create an agency account and complete your company profile (CQC number if applicable, Companies House number).</li>
          <li>An admin verifies your agency — usually within a couple of days.</li>
          <li>Invite staff by email; they accept from their own professional dashboard and keep their individual verification status.</li>
          <li>Your public agency page goes live, and your roster starts appearing in family search results.</li>
        </ol>
      </Card>

      <div className="mt-14">
        <LinkButton href="/signup?role=AGENCY" size="lg" className="w-full sm:w-auto">List your roster on Marram Care</LinkButton>
      </div>
    </div>
  );
}
