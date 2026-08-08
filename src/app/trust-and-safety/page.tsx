import type { Metadata } from "next";
import Link from "next/link";
import { Card, SectionHeading, Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Trust, Safety & Compliance",
  description:
    "How Marram Care approaches CQC positioning, DBS verification, safeguarding and UK GDPR for a specialist complex care matching platform.",
};

export default function TrustAndSafetyPage() {
  return (
    <div className="container-page py-16 max-w-3xl">
      <SectionHeading
        eyebrow="Trust, safety & compliance"
        title="Built around UK care regulation from day one."
        subtitle="Marram Care is a matching marketplace, not a care provider. That distinction shapes every compliance decision below — and it's why families and professionals can trust exactly what we are, and aren't."
      />

      <div className="mt-10 space-y-6">
        <Card className="p-6">
          <Badge tone="info">Regulatory position</Badge>
          <h2 className="mt-3 font-semibold text-ink text-lg">CQC registration</h2>
          <p className="mt-2 text-sm text-ink/70 leading-relaxed">
            The Care Quality Commission does not require introduction agencies to register when
            they have no ongoing role in the personal care delivered after an introduction —
            registration is triggered by activities like directing, monitoring, or managing how
            care is delivered. Marram Care is built to stay on the introduction side of that line:
            we verify and match, families and professionals agree and deliver care directly, and
            we do not supervise or manage visits. If Marram Care later adds features that cross
            into monitoring care delivery (see the visit log below), that feature and its CQC
            implications should be reviewed with a regulatory specialist before launch.
          </p>
        </Card>

        <Card className="p-6">
          <Badge tone="success">No license required</Badge>
          <h2 className="mt-3 font-semibold text-ink text-lg">Employment agency licensing</h2>
          <p className="mt-2 text-sm text-ink/70 leading-relaxed">
            Employment agency licensing was abolished UK-wide by the Deregulation and Contracting
            Out Act 1994 — operating as an employment agency or employment business in Great
            Britain no longer requires a license. The substantive rulebook that replaced it, the
            Conduct of Employment Agencies and Employment Businesses Regulations 2003, still
            applies and is enforced by the Employment Agency Standards (EAS) Inspectorate: it
            covers things like written terms with work-seekers and hirers, not charging
            work-seekers a fee for finding them work, and accurate advertising. Professionals on
            Marram Care work as genuinely self-employed individuals contracting directly with
            families; the Act 1973/2003 Regulations distinguish "employment agencies" (introducing
            work-seekers for direct engagement) from "employment businesses" (supplying workers
            under the agency's own control), and Marram Care is designed to sit on the introduction
            side — we don't direct, supervise, or control how care is delivered. This is a
            fact-sensitive area of law; get it reviewed by an employment solicitor before
            commercial launch, especially before adding any feature that could be read as directing
            a professional's work.
          </p>
        </Card>

        <Card className="p-6">
          <Badge tone="success">Verification</Badge>
          <h2 className="mt-3 font-semibold text-ink text-lg">DBS checks</h2>
          <p className="mt-2 text-sm text-ink/70 leading-relaxed">
            Every professional must submit an Enhanced DBS certificate (with barred list check
            where the role involves regulated activity) before their profile goes live. We track
            certificate expiry and encourage professionals to subscribe to the DBS Update Service
            so status can be checked in real time rather than relying on a point-in-time
            certificate — see each professional's dashboard for their current status.
          </p>
        </Card>

        <Card className="p-6">
          <Badge tone="info">Agencies</Badge>
          <h2 className="mt-3 font-semibold text-ink text-lg">Agency rosters</h2>
          <p className="mt-2 text-sm text-ink/70 leading-relaxed">
            Care agencies can bring their own vetted staff onto Marram Care as a roster, so families
            can discover and book agency-employed professionals alongside independent ones. An
            agency account only becomes publicly visible once an admin verifies it. Bringing staff
            onto the platform doesn't change Marram Care's own position as a matching marketplace —
            but an agency that directly employs, directs, or manages how its staff deliver care may
            itself have separate obligations (for example CQC registration if it exercises that
            level of control, or employer duties under UK employment law) that sit with the agency,
            not with Marram Care. Agencies should get their own regulatory position checked
            independently.
          </p>
        </Card>

        <Card className="p-6">
          <Badge tone="warning">Safeguarding</Badge>
          <h2 className="mt-3 font-semibold text-ink text-lg">Safeguarding policy</h2>
          <p className="mt-2 text-sm text-ink/70 leading-relaxed">
            Anyone can report a safeguarding concern about a booking or professional directly from
            their profile or booking page. Reports go straight to our admin verification team as a
            priority item, independent of the normal document review queue. Marram Care does not
            investigate criminal matters — concerns involving immediate risk of harm should also go
            to the police (999 in an emergency) or local authority safeguarding team.
          </p>
        </Card>

        <Card className="p-6">
          <Badge tone="info">Data protection</Badge>
          <h2 className="mt-3 font-semibold text-ink text-lg">UK GDPR & special category data</h2>
          <p className="mt-2 text-sm text-ink/70 leading-relaxed">
            Care needs and conditions are special category (health) data under UK GDPR Article 9.
            We only collect it with explicit consent, captured at the point a family builds a care
            profile, and share it only with professionals a family actively engages with — never
            for advertising or resold to third parties. DBS results and identity documents are
            stored in access-controlled storage on private disk paths served through an
            authenticated route, never public URLs.
          </p>
        </Card>

        <Card className="p-6">
          <Badge tone="warning">Registration required</Badge>
          <h2 className="mt-3 font-semibold text-ink text-lg">ICO data protection fee</h2>
          <p className="mt-2 text-sm text-ink/70 leading-relaxed">
            Any UK organisation processing personal data — which includes a matching marketplace
            like this one — must pay the Information Commissioner's Office's annual data
            protection fee unless a specific exemption applies (most organisations handling health
            data won't qualify for one). As of the February 2025 fee increase, a small
            organisation (fewer than 250 staff, turnover under £10.2m) pays £52/year (Tier 1);
            larger organisations pay more. This is a one-off registration step to complete before
            processing any real family or professional data in production — it's separate from,
            and in addition to, UK GDPR compliance itself.
          </p>
        </Card>

        <Card className="p-6">
          <Badge tone="neutral">Payments</Badge>
          <h2 className="mt-3 font-semibold text-ink text-lg">Holding client money</h2>
          <p className="mt-2 text-sm text-ink/70 leading-relaxed">
            Bookings run on an escrow-style "pay now, release on completion" flow, built against
            the Stripe Connect model: a family's payment is authorised when a booking is
            requested and released to the professional's connected payout account once the
            booking is marked complete, or refunded on decline/cancellation. Money moves through
            Stripe — an FCA-authorised payment institution — rather than Marram Care holding
            client funds directly, which avoids Marram Care itself needing Payment Services
            Regulations 2017 authorisation. This build runs against a mock Stripe Connect adapter
            (no real card is charged) so the full booking-to-payout lifecycle can be tested before
            live API keys are configured — see the README for the swap-in point.
          </p>
        </Card>

        <Card className="p-6">
          <Badge tone="neutral">Tax</Badge>
          <h2 className="mt-3 font-semibold text-ink text-lg">VAT registration</h2>
          <p className="mt-2 text-sm text-ink/70 leading-relaxed">
            VAT registration becomes mandatory once taxable turnover exceeds £90,000 in any
            rolling 12-month period (the 2026 threshold) — relevant to platform fee revenue as it
            scales, not to professionals' own self-employed earnings unless they individually
            cross the threshold.
          </p>
        </Card>
      </div>

      <p className="mt-10 text-xs text-ink/40">
        This page explains how the product is designed, not legal advice. Get UK regulatory,
        employment and data protection advice from a qualified solicitor before commercial launch.
      </p>

      <div className="mt-8">
        <Link href="/how-it-works" className="text-teal-700 font-medium text-sm">
          See how matching works →
        </Link>
      </div>
    </div>
  );
}
