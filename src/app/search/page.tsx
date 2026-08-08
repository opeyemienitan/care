import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Specialist Care Professionals",
  description: "Search DBS-checked, specialist-verified care professionals matched to your family's complex health, autism, learning disability or mental health needs.",
};

import Link from "next/link";
import { Card, Badge, StarRating, VerifiedBadge, SectionHeading } from "@/components/ui";
import { listProfessionals, getFamilyByUserId, getAgencyById } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { rankMatches } from "@/lib/matching";
import { EXPERIENCE_TAGS, LEVEL_LABEL } from "@/lib/tags";
import type { ProfessionalProfile } from "@/lib/types";

const PAGE_SIZE = 6;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { tag?: string; location?: string; page?: string };
}) {
  const user = await getCurrentUser();
  const family = user?.role === "FAMILY" ? await getFamilyByUserId(user.id) : undefined;

  let professionals = (await listProfessionals()).filter((p) => p.verificationStatus !== "REJECTED");

  if (searchParams.tag) {
    professionals = professionals.filter((p) => p.experiences.some((e) => e.tagKey === searchParams.tag));
  }
  if (searchParams.location) {
    professionals = professionals.filter((p) =>
      p.location.toLowerCase().includes(searchParams.location!.toLowerCase())
    );
  }

  const ranked = family
    ? rankMatches(family, professionals)
    : professionals.map((p) => ({ professional: p, score: 0, matchedTags: [], sameLocation: false }));

  const sorted = family ? ranked : ranked.sort((a, b) => b.professional.ratingAvg - a.professional.ratingAvg);

  const currentPage = Math.max(1, Number(searchParams.page) || 1);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pageHref = (p: number) => {
    const qs = new URLSearchParams();
    if (searchParams.tag) qs.set("tag", searchParams.tag);
    if (searchParams.location) qs.set("location", searchParams.location);
    if (p > 1) qs.set("page", String(p));
    const query = qs.toString();
    return `/search${query ? `?${query}` : ""}`;
  };

  return (
    <div className="container-page py-14">
      <SectionHeading
        eyebrow={family ? `Matches for ${family.careRecipientName}` : "Browse professionals"}
        title="Find the right specialist, ranked by real experience."
        subtitle={
          family
            ? "Ranked using your care profile: experience overlap, verification status, location and budget fit."
            : "Sign up as a family to see personalised match scores based on your care profile."
        }
      />

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/search"
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium border ${
            !searchParams.tag ? "bg-teal-700 text-white border-teal-700" : "border-sand-200 text-ink/70"
          }`}
        >
          All specialisms
        </Link>
        {EXPERIENCE_TAGS.map((tag) => (
          <Link
            key={tag.key}
            href={`/search?tag=${tag.key}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium border ${
              searchParams.tag === tag.key
                ? "bg-teal-700 text-white border-teal-700"
                : "border-sand-200 text-ink/70 hover:border-teal-300"
            }`}
          >
            {tag.label}
          </Link>
        ))}
      </div>

      <p className="mt-6 text-sm text-ink/50">
        {sorted.length} professional{sorted.length === 1 ? "" : "s"} found
      </p>

      <div className="mt-4 grid gap-5">
        {pageItems.map(({ professional, score, matchedTags }) => (
          <ProfessionalRow
            key={professional.id}
            professional={professional}
            score={family ? score : undefined}
            matchedTags={matchedTags}
          />
        ))}
        {sorted.length === 0 && (
          <Card className="p-8 text-center text-ink/60">No professionals match those filters yet.</Card>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Search results pages">
          <Link
            href={pageHref(Math.max(1, currentPage - 1))}
            aria-disabled={currentPage === 1}
            className={`rounded-full px-4 py-2 text-sm font-medium border ${
              currentPage === 1
                ? "pointer-events-none opacity-40 border-sand-200 text-ink/40"
                : "border-sand-200 text-ink/70 hover:border-teal-300"
            }`}
          >
            Previous
          </Link>
          <span className="text-sm text-ink/50 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Link
            href={pageHref(Math.min(totalPages, currentPage + 1))}
            aria-disabled={currentPage === totalPages}
            className={`rounded-full px-4 py-2 text-sm font-medium border ${
              currentPage === totalPages
                ? "pointer-events-none opacity-40 border-sand-200 text-ink/40"
                : "border-sand-200 text-ink/70 hover:border-teal-300"
            }`}
          >
            Next
          </Link>
        </nav>
      )}
    </div>
  );
}

async function ProfessionalRow({
  professional,
  score,
  matchedTags,
}: {
  professional: ProfessionalProfile;
  score?: number;
  matchedTags: { key: string; level: string }[];
}) {
  const agency = professional.agencyId ? await getAgencyById(professional.agencyId) : undefined;

  return (
    <Link href={`/professionals/${professional.id}`}>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-2 flex-wrap">
              <VerifiedBadge status={professional.verificationStatus} />
              {score !== undefined && score > 0 && (
                <Badge tone="warning">{score}% match</Badge>
              )}
              {agency && agency.verificationStatus === "VERIFIED" && (
                <Badge tone="info">via {agency.companyName}</Badge>
              )}
            </div>
            <h3 className="mt-2 font-semibold text-lg text-ink">{professional.headline}</h3>
            <p className="text-sm text-ink/50">
              {professional.location} · {professional.yearsExperience} yrs experience
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {professional.experiences.slice(0, 4).map((e) => {
                const tag = EXPERIENCE_TAGS.find((t) => t.key === e.tagKey);
                const matched = matchedTags.some((m) => m.key === e.tagKey);
                return (
                  <span
                    key={e.tagKey}
                    className={`text-xs rounded-full px-2.5 py-1 border ${
                      matched
                        ? "bg-coral-50 border-coral-200 text-coral-700 font-medium"
                        : "bg-sand-50 border-sand-200 text-ink/60"
                    }`}
                  >
                    {tag?.label ?? e.tagKey} · {LEVEL_LABEL[e.level]}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-semibold text-ink">£{professional.hourlyRate}/hr</p>
            <div className="mt-1">
              <StarRating value={professional.ratingAvg} count={professional.ratingCount} />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
