import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/seo";
import { getAgencyById, listRosterForAgency } from "@/lib/queries";
import { Card, Badge, StarRating, VerifiedBadge, SectionHeading } from "@/components/ui";
import Reveal from "@/components/Reveal";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const agency = await getAgencyById(params.id);
  if (!agency) return { title: "Agency not found" };
  const title = `${agency.companyName} — Marram Care agency profile`;
  const description = agency.description.slice(0, 150);
  return { title, description, openGraph: { title, description, url: `${SITE_URL}/agencies/${agency.id}` }, alternates: { canonical: `${SITE_URL}/agencies/${agency.id}` } };
}

export default async function AgencyProfilePage({ params }: { params: { id: string } }) {
  const agency = await getAgencyById(params.id);
  if (!agency || agency.verificationStatus !== "VERIFIED") notFound();
  const roster = (await listRosterForAgency(agency.id)).filter((professional) => professional.verificationStatus !== "REJECTED");

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-950 via-teal-900 to-teal-700 py-14 text-white sm:py-16">
        <div className="absolute inset-0 ambient-grid opacity-20" />
        <div className="container-page relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <Badge tone="success" className="bg-white/10 text-teal-50">Verified agency</Badge>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{agency.companyName}</h1>
            <p className="mt-2 text-white/60">{agency.location}</p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70">{agency.description}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/20 bg-white/10 px-6 py-5 backdrop-blur-sm"><p className="text-3xl font-semibold">{roster.length}</p><p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">roster professional{roster.length === 1 ? "" : "s"}</p></div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[1.5rem] border border-sand-200 bg-white p-5 shadow-sm">
          <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">Agency details</p><p className="mt-1 text-sm font-semibold text-ink">Public, verified Marram Care roster</p></div>
          {agency.website && <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-teal-700 hover:underline">Visit agency website ↗</a>}
          {agency.cqcRegistered && <span className="text-xs text-ink/50">CQC provider number: {agency.cqcNumber || "—"}</span>}
        </div>
      </section>

      <section className="container-page pb-16">
        <Reveal><SectionHeading eyebrow="Verified roster" title="Meet the people behind the agency profile." subtitle="Each professional keeps an individual verification status, specialist experience, rate and review history." /></Reveal>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {roster.map((professional, index) => (
            <Reveal key={professional.id} delay={(index % 2) * 70}>
              <Link href={`/professionals/${professional.id}`} className="block h-full">
                <Card className="group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-700 to-teal-950 text-xl font-semibold text-white">{professional.headline.charAt(0)}</div>
                    <div className="min-w-0 flex-1"><VerifiedBadge status={professional.verificationStatus} /><h2 className="mt-3 text-lg font-semibold leading-snug text-ink group-hover:text-teal-800">{professional.headline}</h2><p className="mt-1 text-sm text-ink/50">{professional.location} · {professional.yearsExperience} yrs experience</p></div>
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-4 border-t border-sand-100 pt-5"><StarRating value={professional.ratingAvg} count={professional.ratingCount} /><p className="text-lg font-semibold text-ink">£{professional.hourlyRate}<span className="text-xs font-normal text-ink/40">/hr</span></p></div>
                </Card>
              </Link>
            </Reveal>
          ))}
          {roster.length === 0 && <Card className="p-10 text-center text-ink/60 lg:col-span-2">No roster professionals listed yet.</Card>}
        </div>
      </section>
    </div>
  );
}
