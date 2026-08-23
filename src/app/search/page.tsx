import type { Metadata } from "next";
import Link from "next/link";
import { Card, Badge, StarRating, VerifiedBadge, SectionHeading, Button, inputClass } from "@/components/ui";
import Reveal from "@/components/Reveal";
import { listProfessionals, getFamilyByUserId, getAgencyById } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { rankMatches } from "@/lib/matching";
import { EXPERIENCE_TAGS, LEVEL_LABEL } from "@/lib/tags";
import type { ProfessionalProfile } from "@/lib/types";

export const metadata: Metadata = {
  title: "Find Specialist Care Professionals",
  description: "Search DBS-checked, specialist-verified care professionals matched to your family's complex health, autism, learning disability or mental health needs.",
};

const PAGE_SIZE = 6;

export default async function SearchPage({ searchParams }: { searchParams: { tag?: string; location?: string; page?: string } }) {
  const user = await getCurrentUser();
  const family = user?.role === "FAMILY" ? await getFamilyByUserId(user.id) : undefined;

  let professionals = (await listProfessionals()).filter((p) => p.verificationStatus !== "REJECTED");
  if (searchParams.tag) professionals = professionals.filter((p) => p.experiences.some((e) => e.tagKey === searchParams.tag));
  if (searchParams.location) professionals = professionals.filter((p) => p.location.toLowerCase().includes(searchParams.location!.toLowerCase()));

  const ranked = family ? rankMatches(family, professionals) : professionals.map((professional) => ({ professional, score: 0, matchedTags: [], sameLocation: false }));
  const sorted = family ? ranked : ranked.sort((a, b) => b.professional.ratingAvg - a.professional.ratingAvg);
  const currentPage = Math.max(1, Number(searchParams.page) || 1);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pageHref = (page: number) => {
    const qs = new URLSearchParams();
    if (searchParams.tag) qs.set("tag", searchParams.tag);
    if (searchParams.location) qs.set("location", searchParams.location);
    if (page > 1) qs.set("page", String(page));
    const query = qs.toString();
    return `/search${query ? `?${query}` : ""}`;
  };

  return (
    <div>
      <section className="relative overflow-hidden border-b border-sand-200 bg-gradient-to-br from-teal-950 via-teal-900 to-teal-800 py-14 text-white sm:py-16">
        <div className="absolute inset-0 ambient-grid opacity-20" />
        <div className="container-page relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-200">{family ? `Personalised for ${family.careRecipientName}` : "Specialist search"}</p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">Find someone whose experience makes sense for the care in front of you.</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60">{family ? "Results use your care profile to surface relevant experience, verification, location and budget fit." : "Browse verified and in-review professionals by specialism and location. Create a family profile to unlock personalised match scores."}</p>
          <form method="get" action="/search" className="glass-panel mt-8 flex max-w-3xl flex-col gap-3 rounded-[1.5rem] p-3 sm:flex-row">
            {searchParams.tag && <input type="hidden" name="tag" value={searchParams.tag} />}
            <input name="location" defaultValue={searchParams.location ?? ""} className={`${inputClass} flex-1 border-white/20 bg-white/95`} placeholder="Search by town or location" aria-label="Location" />
            <Button type="submit" variant="primary" className="sm:px-7">Search location</Button>
          </form>
        </div>
      </section>

      <section className="container-page py-12 sm:py-14">
        <Reveal>
          <SectionHeading eyebrow="Filter by specialist experience" title="Make the shortlist more specific." subtitle="Choose the area that matters most right now. You can open a profile to see the full experience picture." />
        </Reveal>
        <div className="mt-7 flex flex-wrap gap-2">
          <Link href={searchParams.location ? `/search?location=${encodeURIComponent(searchParams.location)}` : "/search"} className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${!searchParams.tag ? "border-teal-700 bg-teal-700 text-white" : "border-sand-200 bg-white text-ink/60 hover:border-teal-300"}`}>All specialisms</Link>
          {EXPERIENCE_TAGS.map((tag) => {
            const qs = new URLSearchParams(); qs.set("tag", tag.key); if (searchParams.location) qs.set("location", searchParams.location);
            return <Link key={tag.key} href={`/search?${qs.toString()}`} className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${searchParams.tag === tag.key ? "border-teal-700 bg-teal-700 text-white" : "border-sand-200 bg-white text-ink/60 hover:border-teal-300 hover:text-teal-800"}`}>{tag.label}</Link>;
          })}
        </div>

        <div className="mt-9 flex flex-wrap items-end justify-between gap-3 border-b border-sand-200 pb-5">
          <div><p className="text-sm font-semibold text-ink">{sorted.length} professional{sorted.length === 1 ? "" : "s"} found</p><p className="mt-1 text-xs text-ink/50">{family ? "Ordered by personalised match score" : "Ordered by rating where available"}</p></div>
          {(searchParams.tag || searchParams.location) && <Link href="/search" className="text-sm font-semibold text-teal-700">Clear filters</Link>}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {pageItems.map(({ professional, score, matchedTags }, index) => (
            <Reveal key={professional.id} delay={(index % 2) * 70}>
              <ProfessionalCard professional={professional} score={family ? score : undefined} matchedTags={matchedTags} />
            </Reveal>
          ))}
          {sorted.length === 0 && <Card className="p-10 text-center text-ink/60 lg:col-span-2"><p className="text-lg font-semibold text-ink">No matching profiles yet.</p><p className="mt-2 text-sm">Try clearing a filter or searching a nearby location.</p></Card>}
        </div>

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Search results pages">
            <Link href={pageHref(Math.max(1, currentPage - 1))} aria-disabled={currentPage === 1} className={`rounded-full border px-4 py-2 text-sm font-semibold ${currentPage === 1 ? "pointer-events-none border-sand-200 text-ink/30" : "border-sand-200 bg-white text-ink/60 hover:border-teal-300"}`}>Previous</Link>
            <span className="text-sm text-ink/50">{currentPage} / {totalPages}</span>
            <Link href={pageHref(Math.min(totalPages, currentPage + 1))} aria-disabled={currentPage === totalPages} className={`rounded-full border px-4 py-2 text-sm font-semibold ${currentPage === totalPages ? "pointer-events-none border-sand-200 text-ink/30" : "border-sand-200 bg-white text-ink/60 hover:border-teal-300"}`}>Next</Link>
          </nav>
        )}
      </section>
    </div>
  );
}

async function ProfessionalCard({ professional, score, matchedTags }: { professional: ProfessionalProfile; score?: number; matchedTags: { key: string; level: string }[] }) {
  const agency = professional.agencyId ? await getAgencyById(professional.agencyId) : undefined;

  return (
    <Link href={`/professionals/${professional.id}`} className="block h-full">
      <Card className="group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-700 to-teal-950 text-xl font-semibold text-white shadow-lg">{professional.headline.charAt(0)}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5"><VerifiedBadge status={professional.verificationStatus} />{agency?.verificationStatus === "VERIFIED" && <Badge tone="info">via {agency.companyName}</Badge>}</div>
            <h2 className="mt-3 text-lg font-semibold leading-snug text-ink transition group-hover:text-teal-800">{professional.headline}</h2>
            <p className="mt-1 text-sm text-ink/50">{professional.location} · {professional.yearsExperience} yrs experience</p>
          </div>
          {score !== undefined && score > 0 && <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-coral-50 text-coral-700"><span className="text-sm font-bold">{score}%</span><span className="text-[9px] font-semibold uppercase">match</span></div>}
        </div>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {professional.experiences.slice(0, 4).map((experience) => {
            const tag = EXPERIENCE_TAGS.find((item) => item.key === experience.tagKey);
            const matched = matchedTags.some((item) => item.key === experience.tagKey);
            return <span key={experience.tagKey} className={`rounded-full border px-2.5 py-1 text-xs ${matched ? "border-coral-200 bg-coral-50 font-semibold text-coral-700" : "border-sand-200 bg-sand-50 text-ink/60"}`}>{tag?.label ?? experience.tagKey} · {LEVEL_LABEL[experience.level]}</span>;
          })}
        </div>
        <div className="mt-auto flex items-end justify-between gap-4 border-t border-sand-100 pt-5"><StarRating value={professional.ratingAvg} count={professional.ratingCount} /><p className="shrink-0 text-lg font-semibold text-ink">£{professional.hourlyRate}<span className="text-xs font-normal text-ink/40">/hr</span></p></div>
      </Card>
    </Link>
  );
}
