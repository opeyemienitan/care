import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Professional Dashboard",
  robots: { index: false, follow: false },
};

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProfessionalByUserId, getBookingsForProfessional, listDocuments, listCertifications, countReferralsByUserId, getAgencyById, listPendingInvitesForEmail } from "@/lib/queries";
import ReferralPanel from "@/components/ReferralPanel";
import { Card, Badge, SectionHeading, VerifiedBadge, StarRating, Field, inputClass, Button } from "@/components/ui";
import { daysUntil, expiryTone, expiryLabel } from "@/lib/documents";
import { addCertificationAction, connectPayoutAccountAction } from "@/app/actions";
import { acceptAgencyInviteAction, declineAgencyInviteAction, leaveAgencyAction } from "@/app/agency-actions";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import { getPaymentsSummaryForProfessional } from "@/lib/queries";

const statusTone: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  REQUESTED: "warning",
  ACCEPTED: "success",
  DECLINED: "danger",
  COMPLETED: "info",
  CANCELLED: "neutral",
};

export default async function ProfessionalDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "PROFESSIONAL") redirect("/login");
  const profile = await getProfessionalByUserId(user.id);
  if (!profile) redirect("/onboarding/professional");

  const bookings = await getBookingsForProfessional(profile.id);
  const docs = await listDocuments(profile.id);
  const certs = await listCertifications(profile.id);
  const referralCount = await countReferralsByUserId(user.id);
  const earnings = await getPaymentsSummaryForProfessional(profile.id);
  const agency = profile.agencyId ? await getAgencyById(profile.agencyId) : undefined;
  const pendingInvites = agency ? [] : await listPendingInvitesForEmail(user.email);

  return (
    <div className="container-page py-14">
      <SectionHeading eyebrow="Your dashboard" title={profile.headline} />
      <EmailVerificationBanner verified={user.emailVerified} />

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1">
          <VerifiedBadge status={profile.verificationStatus} />
          <div className="mt-3">
            <StarRating value={profile.ratingAvg} count={profile.ratingCount} />
          </div>
          <p className="mt-3 text-sm text-ink/60">
            £{profile.hourlyRate}/hr · {profile.location}
          </p>

          <h3 className="mt-6 font-semibold text-sm text-ink">Verification documents</h3>
          <div className="mt-2 space-y-2">
            {docs.map((d) => {
              const days = daysUntil(d.expiresAt);
              return (
                <div key={d.id} className="text-sm border-b border-sand-100 pb-2 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-ink/60">{d.type.replace("_", " ")}</span>
                    <Badge tone={d.status === "VERIFIED" ? "success" : d.status === "REJECTED" ? "danger" : "neutral"}>
                      {d.status.toLowerCase()}
                    </Badge>
                  </div>
                  {d.expiresAt && (
                    <Badge tone={expiryTone(days)} className="mt-1">
                      {expiryLabel(days)}
                    </Badge>
                  )}
                </div>
              );
            })}
            {docs.length === 0 && <p className="text-sm text-ink/50">No documents on file.</p>}
          </div>

          <h3 className="mt-6 font-semibold text-sm text-ink">DBS Update Service</h3>
          <Badge tone={profile.dbsUpdateServiceSubscribed ? "success" : "warning"} className="mt-2">
            {profile.dbsUpdateServiceSubscribed ? "Subscribed — real-time status" : "Not subscribed yet"}
          </Badge>

          <h3 className="mt-6 font-semibold text-sm text-ink">Payout account</h3>
          {profile.payoutAccountConnected ? (
            <>
              <Badge tone="success" className="mt-2">Connected — ready to receive payouts</Badge>
              <p className="mt-2 text-xs text-ink/40">
                Simulated Stripe Connect account. Completed bookings release payment straight here.
              </p>
            </>
          ) : (
            <>
              <Badge tone="warning" className="mt-2">Not connected yet</Badge>
              <p className="mt-2 text-xs text-ink/50">
                Connect a payout account so we can pay you when a booking is marked complete.
              </p>
              <form action={connectPayoutAccountAction} className="mt-3">
                <Button type="submit" size="sm" variant="outline">Connect payout account</Button>
              </form>
            </>
          )}

          <h3 className="mt-6 font-semibold text-sm text-ink">Earnings</h3>
          <div className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Held (in progress)</span>
              <span>£{earnings.authorized.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium text-ink">
              <span>Paid out to date</span>
              <span>£{earnings.released.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-1">
          <h3 className="font-semibold text-sm text-ink">Training & certifications</h3>
          <div className="mt-3 space-y-2">
            {certs.length === 0 && <p className="text-sm text-ink/50">No certifications added yet.</p>}
            {certs.map((c) => (
              <div key={c.id} className="text-sm border-b border-sand-100 pb-2 last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ink/80">{c.title}</span>
                  <Badge tone={c.status === "VERIFIED" ? "success" : c.status === "REJECTED" ? "danger" : "neutral"}>
                    {c.status.toLowerCase()}
                  </Badge>
                </div>
                <p className="text-xs text-ink/50">{c.issuingBody}</p>
              </div>
            ))}
          </div>

          <details className="mt-4 group">
            <summary className="cursor-pointer text-sm font-medium text-teal-700 select-none">
              + Add a certification
            </summary>
            <form action={addCertificationAction} className="mt-3 space-y-3">
              <Field label="Title">
                <input name="title" required className={inputClass} placeholder="e.g. PEG Feeding & Enteral Care" />
              </Field>
              <Field label="Issuing body">
                <input name="issuingBody" required className={inputClass} placeholder="e.g. Skills for Care" />
              </Field>
              <Field label="Credential ID" hint="Optional">
                <input name="credentialId" className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Issued">
                  <input type="date" name="issuedAt" className={inputClass} />
                </Field>
                <Field label="Expires">
                  <input type="date" name="expiresAt" className={inputClass} />
                </Field>
              </div>
              <Field label="Evidence (certificate scan)">
                <input type="file" name="evidenceFile" accept=".pdf,.jpg,.png" className={inputClass} />
              </Field>
              <Button type="submit" size="sm">Submit for verification</Button>
            </form>
          </details>
        </Card>

        <div className="lg:col-span-1 space-y-6">
          <ReferralPanel referralCode={user.referralCode} referralCount={referralCount} role="PROFESSIONAL" />

          <Card className="p-6">
            <h3 className="font-semibold text-sm text-ink">Agency</h3>
            {agency ? (
              <>
                <p className="mt-2 text-sm text-ink/70">
                  Part of{" "}
                  <Link href={`/agencies/${agency.id}`} className="text-teal-700 font-medium underline">
                    {agency.companyName}
                  </Link>
                  &apos;s roster.
                </p>
                <form action={leaveAgencyAction} className="mt-3">
                  <Button type="submit" size="sm" variant="outline">Leave roster</Button>
                </form>
              </>
            ) : pendingInvites.length > 0 ? (
              <div className="mt-2 space-y-3">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="text-sm border-b border-sand-100 pb-3 last:border-0">
                    <p className="text-ink/70">An agency invited you to join their roster.</p>
                    <div className="mt-2 flex gap-2">
                      <form action={acceptAgencyInviteAction}>
                        <input type="hidden" name="token" value={invite.token} />
                        <Button type="submit" size="sm">Accept</Button>
                      </form>
                      <form action={declineAgencyInviteAction}>
                        <input type="hidden" name="token" value={invite.token} />
                        <Button type="submit" size="sm" variant="outline">Decline</Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink/50">
                Not part of an agency. If an agency invites you, it'll show up here.
              </p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-ink">Booking requests</h3>
          {bookings.length === 0 && <Card className="p-6 text-sm text-ink/60">No booking requests yet.</Card>}
          {bookings.map(({ booking, family }) => (
            <Link key={booking.id} href={`/bookings/${booking.id}`}>
              <Card className="p-5 hover:shadow-lg transition-shadow flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-ink">{family.careRecipientName}</p>
                  <p className="text-sm text-ink/50">
                    {booking.scheduleType.replace("_", " ").toLowerCase()} ·{" "}
                    {new Date(booking.proposedStart).toLocaleDateString("en-GB")} · £{booking.rateAtBooking}/hr
                  </p>
                </div>
                <Badge tone={statusTone[booking.status]}>{booking.status.toLowerCase()}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
