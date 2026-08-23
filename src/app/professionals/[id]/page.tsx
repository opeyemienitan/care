import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/seo";
import { getProfessionalById, getFamilyByUserId, listDocuments, listCertifications, getAgencyById } from "@/lib/queries";
import { generateMatchNarrative } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { Card, Badge, StarRating, VerifiedBadge, Button, Field, inputClass } from "@/components/ui";
import Reveal from "@/components/Reveal";
import { EXPERIENCE_TAGS, LEVEL_LABEL } from "@/lib/tags";
import { computeFeeBreakdown } from "@/lib/pricing";
import { requestBookingAction, submitSafeguardingReportAction } from "@/app/actions";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const record = await getProfessionalById(params.id);
  if (!record) return { title: "Professional not found" };
  const { profile, user } = record;
  const title = `${profile.headline} — ${profile.location}`;
  const description = `${user?.name ?? "Verified professional"} on Marram Care: ${profile.bio.slice(0, 140)}`;
  return { title, description, openGraph: { title, description, url: `${SITE_URL}/professionals/${profile.id}` }, alternates: { canonical: `${SITE_URL}/professionals/${profile.id}` } };
}

export default async function ProfessionalDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { report?: string } }) {
  const record = await getProfessionalById(params.id);
  if (!record) notFound();
  const { profile, user: proUser } = record;

  const user = await getCurrentUser();
  const family = user?.role === "FAMILY" ? await getFamilyByUserId(user.id) : undefined;
  const docs = await listDocuments(profile.id);
  const certs = await listCertifications(profile.id);
  const agency = profile.agencyId ? await getAgencyById(profile.agencyId) : undefined;

  const matchedTagLabels = family
    ? profile.experiences.filter((experience) => family.conditions.includes(experience.tagKey)).map((experience) => EXPERIENCE_TAGS.find((tag) => tag.key === experience.tagKey)?.label ?? experience.tagKey)
    : [];
  const matchNarrative = family ? await generateMatchNarrative(family.conditions, profile.headline, profile.bio, matchedTagLabels) : null;
  const verifiedCerts = certs.filter((certification) => certification.status === "VERIFIED");
  const verifiedDocs = docs.filter((document) => document.status === "VERIFIED").length;
  const fees = computeFeeBreakdown(profile.hourlyRate);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: proUser?.name,
    jobTitle: profile.headline,
    description: profile.bio,
    address: { "@type": "PostalAddress", addressLocality: profile.location, addressCountry: "GB" },
    ...(profile.ratingCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: profile.ratingAvg, reviewCount: profile.ratingCount } } : {}),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden bg-gradient-to-br from-teal-950 via-teal-900 to-teal-700 py-12 text-white sm:py-16">
        <div className="absolute inset-0 ambient-grid opacity-20" />
        <div className="container-page relative">
          <Link href="/search" className="text-sm font-semibold text-white/60 transition hover:text-white">← Back to specialist search</Link>
          <div className="mt-7 flex flex-col gap-7 sm:flex-row sm:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] border border-white/20 bg-white/10 text-4xl font-semibold shadow-2xl backdrop-blur-sm sm:h-28 sm:w-28">
              {(proUser?.name ?? profile.headline).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <VerifiedBadge status={profile.verificationStatus} />
                {profile.identityVerified && <Badge tone="info">ID verified</Badge>}
                {profile.referencesVerified && <Badge tone="info">References verified</Badge>}
                {agency?.verificationStatus === "VERIFIED" && <Badge tone="info">via {agency.companyName}</Badge>}
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">{profile.headline}</h1>
              <p className="mt-3 text-base text-white/60">{proUser?.name} · {profile.location} · {profile.yearsExperience} years experience</p>
              <div className="mt-4 text-white [&_*]:text-white"><StarRating value={profile.ratingAvg} count={profile.ratingCount} /></div>
              {agency?.verificationStatus === "VERIFIED" && <p className="mt-3 text-sm text-white/60">Part of <Link href={`/agencies/${agency.id}`} className="font-semibold text-coral-200 hover:underline">{agency.companyName}&apos;s verified roster</Link></p>}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page relative z-10 -mt-5">
        <div className="grid gap-3 rounded-[1.7rem] border border-sand-200 bg-white p-4 shadow-xl sm:grid-cols-4 sm:p-5">
          {[
            [profile.verificationStatus === "VERIFIED" ? "Verified" : "In progress", "Profile status"],
            [String(profile.experiences.length), "Specialist areas"],
            [String(verifiedCerts.length), "Verified certifications"],
            [String(verifiedDocs), "Verified documents"],
          ].map(([value, label], index) => (
            <div key={label} className={`rounded-xl px-4 py-3 ${index > 0 ? "sm:border-l sm:border-sand-100" : ""}`}><p className="font-semibold text-teal-800">{value}</p><p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink/40">{label}</p></div>
          ))}
        </div>
      </section>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          {matchNarrative && (
            <Reveal><Card className="mb-6 overflow-hidden border-teal-100 bg-gradient-to-r from-teal-50 to-white p-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Why this profile may fit {family?.careRecipientName}</p><p className="mt-3 text-base leading-relaxed text-teal-900">{matchNarrative}</p></Card></Reveal>
          )}

          <Reveal>
            <Card className="p-7 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral-600">About this professional</p><h2 className="mt-3 text-2xl font-semibold text-ink">Care experience in their own words.</h2><p className="mt-4 text-sm leading-7 text-ink/60">{profile.bio}</p></Card>
          </Reveal>

          <Reveal delay={70}>
            <Card className="mt-6 p-7 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral-600">Specialist experience</p><h2 className="mt-3 text-2xl font-semibold text-ink">What they have hands-on experience supporting.</h2></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{profile.experiences.map((experience) => { const tag = EXPERIENCE_TAGS.find((item) => item.key === experience.tagKey); const matched = family?.conditions.includes(experience.tagKey); return <div key={experience.tagKey} className={`rounded-2xl border p-4 ${matched ? "border-coral-200 bg-coral-50" : "border-sand-200 bg-sand-50/70"}`}><div className="flex items-start justify-between gap-3"><span className="font-semibold text-ink/80">{tag?.label ?? experience.tagKey}</span>{matched && <Badge tone="warning">Matches your profile</Badge>}</div><p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">{LEVEL_LABEL[experience.level]}</p></div>; })}</div></Card>
          </Reveal>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Reveal>
              <Card className="h-full p-7"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral-600">Training</p><h2 className="mt-3 text-xl font-semibold text-ink">Verified certifications</h2><div className="mt-5 space-y-3">{verifiedCerts.length === 0 && <p className="text-sm text-ink/50">No verified certifications listed yet.</p>}{verifiedCerts.map((certification) => <div key={certification.id} className="rounded-xl bg-sand-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-ink/80">{certification.title}</p><p className="mt-1 text-xs text-ink/50">{certification.issuingBody}</p></div><Badge tone="success">Verified</Badge></div></div>)}</div></Card>
            </Reveal>
            <Reveal delay={70}>
              <Card className="h-full p-7"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral-600">Checks</p><h2 className="mt-3 text-xl font-semibold text-ink">Verification documents</h2><div className="mt-5 space-y-3">{docs.length === 0 && <p className="text-sm text-ink/50">No documents submitted yet.</p>}{docs.map((document) => <div key={document.id} className="flex items-center justify-between gap-3 rounded-xl bg-sand-50 px-4 py-3"><span className="text-sm font-medium capitalize text-ink/70">{document.type.replace("_", " ").toLowerCase()}</span><Badge tone={document.status === "VERIFIED" ? "success" : document.status === "REJECTED" ? "danger" : "neutral"}>{document.status.toLowerCase()}</Badge></div>)}</div></Card>
            </Reveal>
          </div>
        </div>

        <aside>
          <Card className="sticky top-24 overflow-hidden border-teal-100 shadow-xl">
            <div className="bg-gradient-to-br from-teal-50 to-white p-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">Hourly care rate</p><p className="mt-2 text-4xl font-semibold tracking-tight text-ink">£{profile.hourlyRate}<span className="text-base font-normal text-ink/40">/hr</span></p><p className="mt-3 text-xs leading-relaxed text-ink/50">£{fees.professionalPayout.toFixed(2)}/hr to {proUser?.name.split(" ")[0]}, £{fees.platformFee.toFixed(2)}/hr platform fee ({fees.platformFeePercent}%).</p></div>
            <div className="border-t border-sand-100 p-6">
              {!user && <p className="text-sm leading-relaxed text-ink/60"><Link href="/signup?role=FAMILY" className="font-semibold text-teal-700">Create a family account</Link> to request a booking or message {proUser?.name.split(" ")[0]}.</p>}
              {user?.role === "FAMILY" && !family && <p className="text-sm leading-relaxed text-ink/60"><Link href="/onboarding/family" className="font-semibold text-teal-700">Finish your care profile</Link> to request a booking.</p>}
              {family && (
                <form action={requestBookingAction} className="space-y-4"><input type="hidden" name="professionalId" value={profile.id} /><Field label="Schedule type"><select name="scheduleType" className={inputClass} defaultValue="RECURRING"><option value="ONE_OFF">One-off visit</option><option value="RECURRING">Recurring</option><option value="LIVE_IN">Live-in</option></select></Field><Field label="Preferred start date"><input type="date" name="proposedStart" className={inputClass} required /></Field><Field label="Notes for the professional"><textarea name="notes" rows={3} className={inputClass} placeholder="Schedule, routines, anything they should know." /></Field><Button type="submit" className="w-full" size="lg">Request booking</Button></form>
              )}
              {user?.role === "PROFESSIONAL" && <p className="text-sm text-ink/50">Professional accounts can browse profiles but cannot book other professionals.</p>}
            </div>
          </Card>

          <details className="group mt-5 rounded-[1.5rem] border border-sand-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer list-none text-sm font-semibold text-ink/60"><div className="flex items-center justify-between gap-3"><span>Report a safeguarding concern</span><span className="text-lg transition group-open:rotate-45">+</span></div></summary>
            <div className="mt-5 border-t border-sand-100 pt-5">
              {searchParams.report === "submitted" ? <p className="text-sm font-semibold text-teal-700">Thank you — your report has been sent to the safeguarding queue for priority review.</p> : (
                <form action={submitSafeguardingReportAction} className="space-y-4"><input type="hidden" name="aboutProfessionalId" value={profile.id} /><input type="hidden" name="redirectTo" value={`/professionals/${profile.id}`} /><Field label="What's this about?"><select name="category" className={inputClass} defaultValue="Conduct concern"><option>Conduct concern</option><option>Suspected fraud / fake credentials</option><option>Unsafe care practice</option><option>Other</option></select></Field><Field label="Details"><textarea name="details" rows={4} className={inputClass} required placeholder="Please share as much detail as you can." /></Field><p className="text-xs leading-relaxed text-ink/50">If someone is in immediate danger, contact emergency services on 999 first.</p><Button type="submit" size="sm" variant="outline" className="w-full">Submit report</Button></form>
              )}
            </div>
          </details>
        </aside>
      </div>
    </div>
  );
}
