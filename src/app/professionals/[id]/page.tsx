import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { getProfessionalById, getFamilyByUserId, listDocuments, listCertifications, getAgencyById } from "@/lib/queries";
import { generateMatchNarrative } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { Card, Badge, StarRating, VerifiedBadge, Button, Field, inputClass } from "@/components/ui";
import { EXPERIENCE_TAGS, LEVEL_LABEL } from "@/lib/tags";
import { computeFeeBreakdown } from "@/lib/pricing";
import { requestBookingAction, submitSafeguardingReportAction } from "@/app/actions";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const record = await getProfessionalById(params.id);
  if (!record) return { title: "Professional not found" };
  const { profile, user } = record;
  const title = `${profile.headline} — ${profile.location}`;
  const description = `${user?.name ?? "Verified professional"} on Marram Care: ${profile.bio.slice(0, 140)}`;
  return {
    title,
    description,
    openGraph: { title, description, url: `${SITE_URL}/professionals/${profile.id}` },
    alternates: { canonical: `${SITE_URL}/professionals/${profile.id}` },
  };
}

export default async function ProfessionalDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { report?: string };
}) {
  const record = await getProfessionalById(params.id);
  if (!record) notFound();
  const { profile, user: proUser } = record;

  const user = await getCurrentUser();
  const family = user?.role === "FAMILY" ? await getFamilyByUserId(user.id) : undefined;
  const docs = await listDocuments(profile.id);
  const certs = await listCertifications(profile.id);
  const agency = profile.agencyId ? await getAgencyById(profile.agencyId) : undefined;

  const matchedTagLabels = family
    ? profile.experiences
        .filter((e) => family.conditions.includes(e.tagKey))
        .map((e) => EXPERIENCE_TAGS.find((t) => t.key === e.tagKey)?.label ?? e.tagKey)
    : [];
  const matchNarrative = family
    ? await generateMatchNarrative(family.conditions, profile.headline, profile.bio, matchedTagLabels)
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: proUser?.name,
    jobTitle: profile.headline,
    description: profile.bio,
    address: { "@type": "PostalAddress", addressLocality: profile.location, addressCountry: "GB" },
    ...(profile.ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: profile.ratingAvg,
            reviewCount: profile.ratingCount,
          },
        }
      : {}),
  };

  return (
    <div className="container-page py-14 grid lg:grid-cols-3 gap-10">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="lg:col-span-2">
        <div className="flex items-center gap-2 flex-wrap">
          <VerifiedBadge status={profile.verificationStatus} />
          {profile.identityVerified && <Badge tone="info">ID verified</Badge>}
          {profile.referencesVerified && <Badge tone="info">References verified</Badge>}
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-ink">{profile.headline}</h1>
        <p className="mt-1 text-ink/50">
          {proUser?.name} · {profile.location} · {profile.yearsExperience} years experience
        </p>
        {agency && agency.verificationStatus === "VERIFIED" && (
          <p className="mt-1 text-sm text-teal-700">
            Part of{" "}
            <a href={`/agencies/${agency.id}`} className="font-medium underline">
              {agency.companyName}
            </a>
            &apos;s verified roster
          </p>
        )}
        <div className="mt-3">
          <StarRating value={profile.ratingAvg} count={profile.ratingCount} />
        </div>

        {matchNarrative && (
          <Card className="mt-5 p-4 bg-teal-50 border-teal-100">
            <p className="text-sm text-teal-800">{matchNarrative}</p>
          </Card>
        )}

        <Card className="mt-6 p-6">
          <h2 className="font-semibold text-ink">About</h2>
          <p className="mt-2 text-sm text-ink/70 leading-relaxed">{profile.bio}</p>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="font-semibold text-ink">Specialist experience</h2>
          <div className="mt-3 grid sm:grid-cols-2 gap-2">
            {profile.experiences.map((e) => {
              const tag = EXPERIENCE_TAGS.find((t) => t.key === e.tagKey);
              return (
                <div key={e.tagKey} className="flex items-center justify-between rounded-lg bg-sand-50 px-3 py-2 text-sm">
                  <span className="text-ink/80">{tag?.label ?? e.tagKey}</span>
                  <span className="text-xs font-medium text-teal-700">{LEVEL_LABEL[e.level]}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="font-semibold text-ink">Training & certifications</h2>
          <div className="mt-3 space-y-2">
            {certs.filter((c) => c.status === "VERIFIED").length === 0 && (
              <p className="text-sm text-ink/50">No verified certifications listed yet.</p>
            )}
            {certs
              .filter((c) => c.status === "VERIFIED")
              .map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm border-b border-sand-100 pb-2">
                  <div>
                    <span className="text-ink/80">{c.title}</span>
                    <span className="text-ink/40"> · {c.issuingBody}</span>
                  </div>
                  <Badge tone="success">Verified</Badge>
                </div>
              ))}
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="font-semibold text-ink">Verification documents</h2>
          <div className="mt-3 space-y-2">
            {docs.length === 0 && <p className="text-sm text-ink/50">No documents submitted yet.</p>}
            {docs.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-sm border-b border-sand-100 pb-2">
                <span className="text-ink/70">{d.type.replace("_", " ")}</span>
                <Badge tone={d.status === "VERIFIED" ? "success" : d.status === "REJECTED" ? "danger" : "neutral"}>
                  {d.status.toLowerCase()}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <Card className="p-6 sticky top-24">
          <p className="text-2xl font-semibold text-ink">£{profile.hourlyRate}<span className="text-sm font-normal text-ink/50">/hr</span></p>
          {(() => {
            const fees = computeFeeBreakdown(profile.hourlyRate);
            return (
              <p className="mt-1 text-xs text-ink/40">
                Transparent pricing: £{fees.professionalPayout.toFixed(2)}/hr to {proUser?.name.split(" ")[0]}, £{fees.platformFee.toFixed(2)}/hr platform fee ({fees.platformFeePercent}%). No hidden charges.
              </p>
            );
          })()}

          {!user && (
            <p className="mt-4 text-sm text-ink/60">
              <a href="/signup?role=FAMILY" className="text-teal-700 font-medium">
                Create a family account
              </a>{" "}
              to request a booking or message {proUser?.name.split(" ")[0]}.
            </p>
          )}

          {user?.role === "FAMILY" && !family && (
            <p className="mt-4 text-sm text-ink/60">
              <a href="/onboarding/family" className="text-teal-700 font-medium">
                Finish your care profile
              </a>{" "}
              to request a booking.
            </p>
          )}

          {family && (
            <form action={requestBookingAction} className="mt-5 space-y-4">
              <input type="hidden" name="professionalId" value={profile.id} />
              <Field label="Schedule type">
                <select name="scheduleType" className={inputClass} defaultValue="RECURRING">
                  <option value="ONE_OFF">One-off visit</option>
                  <option value="RECURRING">Recurring</option>
                  <option value="LIVE_IN">Live-in</option>
                </select>
              </Field>
              <Field label="Preferred start date">
                <input type="date" name="proposedStart" className={inputClass} required />
              </Field>
              <Field label="Notes for the professional">
                <textarea name="notes" rows={3} className={inputClass} placeholder="Schedule, routines, anything they should know." />
              </Field>
              <Button type="submit" className="w-full">
                Request booking
              </Button>
            </form>
          )}

          {user?.role === "PROFESSIONAL" && (
            <p className="mt-4 text-sm text-ink/50">Professional accounts browse but can&apos;t book other professionals.</p>
          )}
        </Card>

        <details className="mt-6 group">
          <summary className="cursor-pointer text-sm text-ink/50 hover:text-ink/70 select-none">
            Report a safeguarding concern about this professional
          </summary>
          <Card className="mt-3 p-6">
            {searchParams.report === "submitted" ? (
              <p className="text-sm text-teal-700 font-medium">
                Thank you — your report has been sent to our safeguarding team and will be
                reviewed as a priority.
              </p>
            ) : (
              <form action={submitSafeguardingReportAction} className="space-y-4">
                <input type="hidden" name="aboutProfessionalId" value={profile.id} />
                <input type="hidden" name="redirectTo" value={`/professionals/${profile.id}`} />
                <Field label="What's this about?">
                  <select name="category" className={inputClass} defaultValue="Conduct concern">
                    <option>Conduct concern</option>
                    <option>Suspected fraud / fake credentials</option>
                    <option>Unsafe care practice</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Details">
                  <textarea name="details" rows={4} className={inputClass} required placeholder="Please share as much detail as you can." />
                </Field>
                <p className="text-xs text-ink/50">
                  If someone is in immediate danger, contact emergency services on 999 first.
                </p>
                <Button type="submit" size="sm" variant="outline">
                  Submit report
                </Button>
              </form>
            )}
          </Card>
        </details>
      </div>
    </div>
  );
}
