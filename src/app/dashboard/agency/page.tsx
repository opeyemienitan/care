import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getAgencyByUserId,
  listRosterForAgency,
  listAgencyInvites,
  getAgencyRevenueSummary,
} from "@/lib/queries";
import { Card, Badge, SectionHeading, Field, inputClass, Button, StarRating } from "@/components/ui";
import { inviteStaffAction } from "@/app/agency-actions";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";

export const metadata: Metadata = {
  title: "Your Agency Dashboard",
  robots: { index: false, follow: false },
};

const agencyStatusTone: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  VERIFIED: "success",
  REJECTED: "danger",
};

export default async function AgencyDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "AGENCY") redirect("/login");

  const agency = await getAgencyByUserId(user.id);
  if (!agency) redirect("/onboarding/agency");

  const roster = await listRosterForAgency(agency.id);
  const invites = await listAgencyInvites(agency.id);
  const pendingInvites = invites.filter((i) => i.status === "PENDING");
  const revenue = await getAgencyRevenueSummary(agency.id);

  return (
    <div className="container-page py-14">
      <SectionHeading eyebrow="Your dashboard" title={agency.companyName} />
      <EmailVerificationBanner verified={user.emailVerified} />

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1">
          <Badge tone={agencyStatusTone[agency.verificationStatus]}>
            {agency.verificationStatus === "VERIFIED"
              ? "Verified agency"
              : agency.verificationStatus === "REJECTED"
              ? "Verification rejected"
              : "Verification pending"}
          </Badge>
          <p className="mt-3 text-sm text-ink/70">{agency.description}</p>
          <p className="mt-3 text-sm text-ink/50">{agency.location}</p>
          {agency.website && (
            <a href={agency.website} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm text-teal-700 underline">
              {agency.website}
            </a>
          )}
          {agency.cqcRegistered && (
            <p className="mt-2 text-xs text-ink/40">CQC provider number: {agency.cqcNumber || "—"}</p>
          )}
          {agency.verificationStatus === "VERIFIED" && (
            <Link href={`/agencies/${agency.id}`} className="mt-4 inline-block text-sm text-teal-700 font-medium">
              View public profile →
            </Link>
          )}

          <h3 className="mt-6 font-semibold text-sm text-ink">Roster earnings</h3>
          <div className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Held (in progress)</span>
              <span>£{revenue.held.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium text-ink">
              <span>Paid out to date</span>
              <span>£{revenue.paidOut.toFixed(2)}</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-ink/40">
            Each professional connects their own payout account and is paid directly — Marram
            Care doesn't route roster earnings through the agency.
          </p>
        </Card>

        <Card className="p-6 lg:col-span-1">
          <h3 className="font-semibold text-sm text-ink">Your roster ({roster.length})</h3>
          <div className="mt-3 space-y-3">
            {roster.length === 0 && (
              <p className="text-sm text-ink/50">
                No staff on your roster yet — invite your first professional below.
              </p>
            )}
            {roster.map((p) => (
              <div key={p.id} className="text-sm border-b border-sand-100 pb-2.5 last:border-0">
                <div className="flex items-center justify-between">
                  <Link href={`/professionals/${p.id}`} className="font-medium text-ink hover:underline">
                    {p.headline}
                  </Link>
                  <Badge tone={p.verificationStatus === "VERIFIED" ? "success" : "neutral"}>
                    {p.verificationStatus.toLowerCase()}
                  </Badge>
                </div>
                <div className="mt-1">
                  <StarRating value={p.ratingAvg} count={p.ratingCount} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-1">
          <h3 className="font-semibold text-sm text-ink">Invite a professional</h3>
          <p className="mt-1 text-xs text-ink/50">
            They'll get an email with a link to join your roster. If they don't have a Marram
            Care account yet, they create one first, then follow the same link.
          </p>
          <form action={inviteStaffAction} className="mt-4 space-y-3">
            <Field label="Their email">
              <input className={inputClass} type="email" name="email" required placeholder="carer@example.com" />
            </Field>
            <Button type="submit" size="sm">
              Send invite
            </Button>
          </form>

          <h4 className="mt-6 font-semibold text-xs text-ink/60 uppercase tracking-wide">
            Pending invites ({pendingInvites.length})
          </h4>
          <div className="mt-2 space-y-2">
            {pendingInvites.length === 0 && <p className="text-sm text-ink/50">None right now.</p>}
            {pendingInvites.map((i) => (
              <div key={i.id} className="text-sm text-ink/60 flex items-center justify-between">
                <span>{i.email}</span>
                <span className="text-xs text-ink/40">{new Date(i.createdAt).toLocaleDateString("en-GB")}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
