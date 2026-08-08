import Link from "next/link";
import { LinkButton, Card, SectionHeading, Badge, StarRating } from "@/components/ui";
import { EXPERIENCE_TAGS } from "@/lib/tags";
import { listProfessionals } from "@/lib/queries";

export default async function HomePage() {
  const allPros = await listProfessionals();
  const featured = allPros.filter((p) => p.verificationStatus === "VERIFIED").slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-sand-200 bg-gradient-to-b from-teal-50 to-sand-50">
        <div className="container-page py-20 sm:py-28 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge tone="info" className="mb-6">
              Built for the shift from hospital to home
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-ink leading-[1.1]">
              Specialist care, matched with confidence — not a job board.
            </h1>
            <p className="mt-6 text-lg text-ink/70 max-w-xl">
              The NHS is moving care closer to home. Marram Care connects families managing complex
              health, learning disability, autism, mental health and physical disability needs with
              DBS-checked, reference-verified professionals who have the right hands-on experience —
              searchable the way you&apos;d book accommodation or a taxi.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <LinkButton href="/signup?role=FAMILY" size="lg" className="w-full sm:w-auto">
                Find specialist care
              </LinkButton>
              <LinkButton href="/signup?role=PROFESSIONAL" size="lg" variant="outline" className="w-full sm:w-auto">
                Offer your care expertise
              </LinkButton>
            </div>
            <p className="mt-5 text-sm text-ink/50">
              Demo prototype · try it with <code className="text-ink/70">grace@family.demo</code> or{" "}
              <code className="text-ink/70">marcus@pro.demo</code> · password{" "}
              <code className="text-ink/70">password123</code>
            </p>
          </div>
          <Card className="p-8">
            <p className="text-sm font-semibold text-ink/50 uppercase tracking-wide mb-5">
              Search by real experience, not keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {EXPERIENCE_TAGS.map((t) => (
                <span
                  key={t.key}
                  className="rounded-full border border-teal-200 bg-teal-50 text-teal-700 px-3 py-1.5 text-sm font-medium"
                >
                  {t.label}
                </span>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-sand-200 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-semibold text-ink">100%</p>
                <p className="text-xs text-ink/50 mt-1">DBS checked before going live</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-ink">12</p>
                <p className="text-xs text-ink/50 mt-1">specialist experience tags</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-ink">3</p>
                <p className="text-xs text-ink/50 mt-1">reference checks minimum</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Problem */}
      <section className="container-page py-20">
        <SectionHeading
          eyebrow="The problem"
          title="Thousands of families are managing complex care alone."
          subtitle="Complex healthcare needs. Learning disabilities. Autism. Mental health conditions. Physical disabilities. Challenging behaviours. Generic care listings don't capture any of it — so families can't tell who actually has the right experience."
        />
        <div className="mt-10 grid sm:grid-cols-3 gap-6">
          {[
            {
              title: "Families search blind",
              body: "Job boards list availability, not clinical or behavioural experience — so families gamble on fit.",
            },
            {
              title: "Skilled professionals go unseen",
              body: "Nursing associates and specialist support workers can't showcase what makes them the right match.",
            },
            {
              title: "Verification is scattered",
              body: "DBS checks, references and qualifications live in emails and PDFs, not somewhere families can trust at a glance.",
            },
          ].map((f) => (
            <Card key={f.title} className="p-6">
              <h3 className="font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ink/60">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-teal-900 text-white">
        <div className="container-page py-20">
          <SectionHeading
            eyebrow="How Marram Care works"
            title="From complex need to verified match in three steps."
          />
          <div className="mt-10 grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Build a care profile",
                body: "Tell us about the conditions, needs and schedule involved — this drives every match.",
              },
              {
                step: "02",
                title: "See ranked, verified matches",
                body: "Our matching engine scores professionals on experience relevance, verification, location and budget fit.",
              },
              {
                step: "03",
                title: "Message, book, and review",
                body: "Chat safely in-app, confirm a booking, and leave a review once care begins.",
              },
            ].map((s) => (
              <div key={s.step}>
                <p className="text-coral-300 font-serif text-3xl">{s.step}</p>
                <h3 className="mt-3 font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-white/70 text-sm">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured professionals */}
      {featured.length > 0 && (
        <section className="container-page py-20">
          <SectionHeading eyebrow="Verified professionals" title="Meet a few specialists on Marram Care." />
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {featured.map(({ id: proId, headline, location, hourlyRate, ratingAvg, ratingCount }) => (
              <Link key={proId} href={`/professionals/${proId}`}>
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <Badge tone="success">Verified professional</Badge>
                  <h3 className="mt-4 font-semibold text-ink leading-snug">{headline}</h3>
                  <p className="mt-1 text-sm text-ink/50">{location}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <StarRating value={ratingAvg} count={ratingCount} />
                    <span className="text-sm font-semibold text-ink">£{hourlyRate}/hr</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="container-page pb-24">
        <Card className="p-12 text-center bg-gradient-to-br from-teal-700 to-teal-900 border-none">
          <h2 className="text-3xl font-semibold text-white">
            The future of healthcare isn&apos;t only hospitals.
          </h2>
          <p className="mt-3 text-white/70 max-w-xl mx-auto">
            It&apos;s personalised care, delivered in homes and communities — matched by real
            experience, not guesswork.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <LinkButton href="/signup?role=FAMILY" size="lg" className="w-full sm:w-auto">
              Find specialist care
            </LinkButton>
            <LinkButton href="/signup?role=PROFESSIONAL" size="lg" variant="outline" className="w-full sm:w-auto !text-white !border-white hover:!bg-white/10">
              Offer your care expertise
            </LinkButton>
          </div>
        </Card>
      </section>
    </div>
  );
}
