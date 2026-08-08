import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Care Dashboard",
  robots: { index: false, follow: false },
};

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getFamilyByUserId, getBookingsForFamily } from "@/lib/queries";
import { Card, Badge, SectionHeading, LinkButton } from "@/components/ui";
import { EXPERIENCE_TAGS } from "@/lib/tags";
import { FUNDING_LABEL } from "@/lib/funding";
import { countReferralsByUserId } from "@/lib/queries";
import ReferralPanel from "@/components/ReferralPanel";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";

const statusTone: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  REQUESTED: "warning",
  ACCEPTED: "success",
  DECLINED: "danger",
  COMPLETED: "info",
  CANCELLED: "neutral",
};

export default async function FamilyDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "FAMILY") redirect("/login");
  const family = await getFamilyByUserId(user.id);
  if (!family) redirect("/onboarding/family");

  const bookings = await getBookingsForFamily(family.id);
  const referralCount = await countReferralsByUserId(user.id);

  return (
    <div className="container-page py-14">
      <SectionHeading eyebrow="Your dashboard" title={`Care profile: ${family.careRecipientName}`} />
      <EmailVerificationBanner verified={user.emailVerified} />

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1">
          <h3 className="font-semibold text-ink">Care needs</h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {family.conditions.map((c) => (
              <Badge key={c} tone="info">
                {EXPERIENCE_TAGS.find((t) => t.key === c)?.label ?? c}
              </Badge>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink/60">{family.location} · £{family.budgetMin}–£{family.budgetMax}/hr</p>
          <Badge tone="info" className="mt-2">{FUNDING_LABEL[family.fundingSource]}</Badge>
          {family.notes && <p className="mt-2 text-sm text-ink/50">{family.notes}</p>}
          <LinkButton href="/search" className="mt-5 w-full" variant="outline">
            Browse matches
          </LinkButton>
        </Card>

        <div className="mt-6">
          <ReferralPanel referralCode={user.referralCode} referralCount={referralCount} role="FAMILY" />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-ink">Your bookings</h3>
          {bookings.length === 0 && (
            <Card className="p-6 text-sm text-ink/60">
              No bookings yet.{" "}
              <Link href="/search" className="text-teal-700 font-medium">
                Find a specialist
              </Link>{" "}
              to get started.
            </Card>
          )}
          {bookings.map(({ booking, professional }) => (
            <Link key={booking.id} href={`/bookings/${booking.id}`}>
              <Card className="p-5 hover:shadow-lg transition-shadow flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-ink">{professional.headline}</p>
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
