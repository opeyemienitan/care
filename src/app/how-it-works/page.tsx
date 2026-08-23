import type { Metadata } from "next";
import HeroSlideshow from "@/components/HeroSlideshow";
import Reveal from "@/components/Reveal";
import { Card, SectionHeading, LinkButton, Badge } from "@/components/ui";
import { EXPERIENCE_TAGS } from "@/lib/tags";

export const metadata: Metadata = {
  title: "How Marram Care Works",
  description: "See how Marram Care matches families with verified complex care, autism, learning disability and mental health support professionals in three steps.",
};

const slides = [
  {
    src: "https://images.pexels.com/photos/7446757/pexels-photo-7446757.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "A family supporting a wheelchair user with a home health routine",
    label: "Start with the person and their needs",
  },
  {
    src: "https://images.pexels.com/photos/7551611/pexels-photo-7551611.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "A care professional supporting an older adult at home",
    label: "Match on real hands-on experience",
  },
];

export default function HowItWorksPage() {
  const signals = [
    ["40%", "Specialism coverage", "How much of the family’s required specialist experience appears on the professional profile."],
    ["20%", "Experience level", "Hands-on depth across matched specialist areas."],
    ["15%", "Location", "Whether the professional and family are in the same location area."],
    ["15%", "Verification", "A stronger score for a fully verified professional profile."],
    ["5%", "Rating", "Review history adds a smaller quality signal."],
    ["5%", "Budget fit", "Whether the hourly rate sits within the family’s stated range."],
  ];

  return (
    <div>
      <HeroSlideshow slides={slides} compact>
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-200">How it works</p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">A matching engine built around care reality, not keyword luck.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">The family describes the care. Professionals describe their specialist experience. Marram Care uses both sides to create a more meaningful shortlist.</p>
        </div>
      </HeroSlideshow>

      <section className="container-page section-pad">
        <Reveal><SectionHeading align="center" eyebrow="The family journey" title="Three moments that turn a complex need into a clearer shortlist." /></Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {[
            ["01", "Build the care picture", "Capture specialist needs, location, budget and funding source once instead of repeating the same explanation across multiple calls."],
            ["02", "Understand why people match", "Professionals are ranked on experience overlap plus secondary signals such as verification, location, rating and budget fit."],
            ["03", "Move from shortlist to relationship", "Open a profile, review trust signals, message safely, request a booking and keep the care conversation in one place."],
          ].map(([step, title, body], index) => (
            <Reveal key={step} delay={index * 90}>
              <Card className="h-full p-7">
                <div className="flex items-center justify-between"><span className="font-serif text-4xl italic text-coral-500">{step}</span><span className="h-px w-16 bg-sand-200" /></div>
                <h2 className="mt-6 text-xl font-semibold text-ink">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink/60">{body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-teal-950 text-white">
        <div className="absolute inset-0 ambient-grid opacity-20" />
        <div className="container-page relative section-pad">
          <Reveal><SectionHeading className="[&_h2]:text-white [&_p]:text-white/60" eyebrow="Inside the match score" title="Experience leads. Everything else helps refine the fit." subtitle="The current matching function is deliberately transparent and tunable rather than a black box." /></Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {signals.map(([weight, title, body], index) => (
              <Reveal key={title} delay={index * 55}>
                <div className="h-full rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm">
                  <p className="text-3xl font-semibold text-coral-300">{weight}</p>
                  <h3 className="mt-3 font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page section-pad">
        <Reveal><SectionHeading eyebrow="The specialist vocabulary" title="Twelve experience areas make complex care searchable." subtitle="Families and professionals use the same underlying taxonomy, which gives the matching engine a shared language." /></Reveal>
        <div className="mt-8 flex flex-wrap gap-2.5">
          {EXPERIENCE_TAGS.map((tag, index) => (
            <Reveal key={tag.key} delay={(index % 6) * 35}>
              <span className="inline-flex rounded-full border border-teal-100 bg-white px-4 py-2.5 text-sm font-medium text-ink/70 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-800">{tag.label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-sand-200/70 bg-white/60">
        <div className="container-page section-pad grid gap-6 lg:grid-cols-2">
          <Reveal>
            <Card className="h-full p-8 sm:p-10"><Badge tone="info">For families</Badge><h2 className="mt-5 text-2xl font-semibold text-ink">Describe care once. Use that profile everywhere.</h2><p className="mt-3 text-sm leading-relaxed text-ink/60">The family profile becomes the context for personalised search, match scoring and booking. It helps make the platform feel consistent instead of making families start from zero on every profile.</p><div className="mt-7"><LinkButton href="/signup?role=FAMILY" variant="secondary">Create a care profile</LinkButton></div></Card>
          </Reveal>
          <Reveal delay={90}>
            <Card className="h-full p-8 sm:p-10"><Badge tone="warning">For professionals</Badge><h2 className="mt-5 text-2xl font-semibold text-ink">Make your practical experience discoverable.</h2><p className="mt-3 text-sm leading-relaxed text-ink/60">A profile is not just a biography. It is structured evidence of where your experience sits, how long you have worked with those needs, and which verification or training signals a family can see.</p><div className="mt-7"><LinkButton href="/signup?role=PROFESSIONAL">Join as a professional</LinkButton></div></Card>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
