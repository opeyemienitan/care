import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/seo";
import { getAgencyById, listRosterForAgency } from "@/lib/queries";
import { Card, Badge, StarRating, VerifiedBadge, SectionHeading } from "@/components/ui";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const agency = await getAgencyById(params.id);
  if (!agency) return { title: "Agency not found" };
  const title = `${agency.companyName} — Marram Care agency profile`;
  const description = agency.description.slice(0, 150);
  return {
    title,
    description,
    openGraph: { title, description, url: `${SITE_URL}/agencies/${agency.id}` },
    alternates: { canonical: `${SITE_URL}/agencies/${agency.id}` },
  };
}

export default async function AgencyProfilePage({ params }: { params: { id: string } }) {
  const agency = await getAgencyById(params.id);
  if (!agency || agency.verificationStatus !== "VERIFIED") notFound();

  const roster = (await listRosterForAgency(agency.id)).filter((p) => p.verificationStatus !== "REJECTED");

  return (
    <div className="container-page py-14">
      <Badge tone="success">Verified agency</Badge>
      <h1 className="mt-3 text-3xl font-semibold text-ink">{agency.companyName}</h1>
      <p className="mt-1 text-ink/50">{agency.location}</p>
      <p className="mt-4 max-w-2xl text-ink/70 leading-relaxed">{agency.description}</p>
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        {agency.website && (
          <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-700 underline">
            {agency.website}
          </a>
        )}
        {agency.cqcRegistered && (
          <span className="text-xs text-ink/40">CQC provider number: {agency.cqcNumber || "—"}</span>
        )}
      </div>

      <div className="mt-10">
        <SectionHeading eyebrow="Roster" title={`${roster.length} professional${roster.length === 1 ? "" : "s"}`} />
        <div className="mt-6 grid gap-5">
          {roster.map((p) => (
            <Link key={p.id} href={`/professionals/${p.id}`}>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <VerifiedBadge status={p.verificationStatus} />
                    <h3 className="mt-2 font-semibold text-lg text-ink">{p.headline}</h3>
                    <p className="text-sm text-ink/50">
                      {p.location} · {p.yearsExperience} yrs experience
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-semibold text-ink">£{p.hourlyRate}/hr</p>
                    <StarRating value={p.ratingAvg} count={p.ratingCount} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
          {roster.length === 0 && (
            <Card className="p-8 text-center text-ink/60">No roster professionals listed yet.</Card>
          )}
        </div>
      </div>
    </div>
  );
}
