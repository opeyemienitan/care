import Link from "next/link";
import HeroSlideshow from "@/components/HeroSlideshow";
import MediaStory from "@/components/MediaStory";
import Reveal from "@/components/Reveal";
import StoryCarousel, { type CareStory } from "@/components/StoryCarousel";
import { LinkButton, Card, SectionHeading, Badge, StarRating } from "@/components/ui";
import { EXPERIENCE_TAGS } from "@/lib/tags";
import { listProfessionals } from "@/lib/queries";

const heroSlides = [
  {
    src: "https://images.pexels.com/photos/7446755/pexels-photo-7446755.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "A family supporting a wheelchair user with a health check at home",
    label: "Care built around home life",
  },
  {
    src: "https://images.pexels.com/photos/29372715/pexels-photo-29372715/free-photo-of-elderly-care-routine-in-a-cozy-home-setting.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "A care professional assisting an older adult using a walking frame at home",
    label: "Support that protects independence",
  },
  {
    src: "https://images.pexels.com/photos/7551611/pexels-photo-7551611.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "A care professional supporting an older adult with movement and exercise",
    label: "Experience for real-life needs",
  },
];

const stories: CareStory[] = [
  {
    eyebrow: "Illustrative care journey",
    title: "A discharge plan needs more than 'general care experience'.",
    body: "A family can describe PEG feeding, medication support and mobility needs once, then see professionals whose experience directly overlaps with that care profile.",
    detail: "Complex health · medication · mobility support",
  },
  {
    eyebrow: "Illustrative care journey",
    title: "Autism support should be matched on confidence and hands-on experience.",
    body: "Instead of scrolling through generic listings, families can surface professionals who explicitly describe autism, learning-disability and positive-behaviour-support experience.",
    detail: "Autism · learning disability · PBS",
  },
  {
    eyebrow: "Illustrative care journey",
    title: "Funding should not feel like a hidden detail at the end of the process.",
    body: "Marram Care captures whether a family is self-funding, using a local-authority direct payment or an NHS CHC personal health budget from the start.",
    detail: "Self-funded · direct payment · NHS CHC PHB",
  },
];

export default async function HomePage() {
  const allPros = await listProfessionals();
  const featured = allPros.filter((p) => p.verificationStatus === "VERIFIED").slice(0, 3);

  return (
    <div>
      <HeroSlideshow slides={heroSlides}>
        <div className="max-w-3xl">
          <div className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            <span className="h-2 w-2 rounded-full bg-coral-300" />
            Specialist care, closer to home
          </div>
          <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-[1.03] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
            Find care that understands the <span className="font-serif italic text-coral-200">whole person.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-xl">
            Marram Care helps families discover verified professionals by the specialist experience that actually matters — complex health, autism, learning disability, mental health, physical disability and more.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <LinkButton href="/signup?role=FAMILY" size="lg" className="w-full sm:w-auto">
              Find specialist care <span aria-hidden>→</span>
            </LinkButton>
            <LinkButton href="/how-it-works" size="lg" variant="outline" className="w-full border-white/60 bg-white/10 text-white hover:bg-white/20 sm:w-auto">
              See how matching works
            </LinkButton>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/60">
            <span className="flex items-center gap-2"><span className="text-coral-300">✓</span> DBS-led verification</span>
            <span className="flex items-center gap-2"><span className="text-coral-300">✓</span> Specialist-first matching</span>
            <span className="flex items-center gap-2"><span className="text-coral-300">✓</span> Funding-aware onboarding</span>
          </div>
        </div>
      </HeroSlideshow>

      <section className="relative z-10 -mt-3 border-b border-sand-200/70 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="container-page grid gap-0 sm:grid-cols-3">
          {[
            ["12", "specialist experience areas"],
            ["3", "ways to join: family, professional, agency"],
            ["1", "care profile powering every personalised match"],
          ].map(([value, label], index) => (
            <div key={label} className={`px-5 py-7 text-center ${index > 0 ? "border-t border-sand-200 sm:border-l sm:border-t-0" : ""}`}>
              <p className="text-3xl font-semibold tracking-tight text-teal-800">{value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.13em] text-ink/50">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page section-pad">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Care is not generic"
            title="Search around the support someone actually needs."
            subtitle="A diagnosis or complex routine changes what a good match looks like. Marram Care makes specialist experience visible instead of burying it inside a CV."
          />
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Complex healthcare", "PEG feeding, tracheostomy, medication and other hands-on clinical routines.", "✚"],
            ["Autism support", "Experience that respects communication, routine, sensory needs and individual preferences.", "∞"],
            ["Learning disability", "Support focused on choice, independence, communication and everyday quality of life.", "◌"],
            ["Mental health", "Calm, person-centred support from professionals who understand mental-health needs.", "☼"],
            ["Physical disability", "Mobility, transfers and practical support that protects dignity and independence.", "↗"],
            ["Behavioural / PBS", "Professionals with positive-behaviour-support and challenging-behaviour experience.", "◇"],
          ].map(([title, body, icon], index) => (
            <Reveal key={title} delay={index * 70}>
              <Card className="group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-lg font-semibold text-teal-700 transition group-hover:bg-teal-700 group-hover:text-white">{icon}</div>
                <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link href="/search" className="text-sm font-semibold text-teal-700 hover:text-teal-900">Explore all {EXPERIENCE_TAGS.length} specialisms →</Link>
        </div>
      </section>

      <section className="border-y border-sand-200/70 bg-white/60">
        <div className="container-page section-pad">
          <MediaStory
            image="https://images.pexels.com/photos/8088598/pexels-photo-8088598.jpeg?auto=compress&cs=tinysrgb&w=1400"
            alt="A woman providing comfort to an older adult at home"
            eyebrow="Confidence before contact"
            title="Trust should be visible before a family has to ask for it."
            body="Profiles bring verification status, specialist experience, training, location, rates and reviews into one place. Families can understand why someone might fit before starting a conversation."
            bullets={[
              "DBS, identity and reference status surfaced clearly on the profile.",
              "Hands-on experience shown by specialist area and experience level.",
              "Transparent hourly pricing and in-app booking flow.",
            ]}
            cta={{ href: "/trust-and-safety", label: "How we approach trust & safety" }}
          />
        </div>
      </section>

      <section className="relative overflow-hidden bg-teal-950 text-white">
        <div className="absolute inset-0 ambient-grid opacity-20" />
        <div className="container-page relative section-pad">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-300">How Marram Care works</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">Less filtering. More confidence in the shortlist.</h2>
              </div>
              <p className="max-w-2xl text-base leading-relaxed text-white/60 lg:justify-self-end">The platform combines the care profile with professional experience, verification, location, rating and budget fit to make relevant people easier to find.</p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {[
              ["01", "Tell us what care looks like", "Create a care profile around specialist needs, location, budget and funding source."],
              ["02", "See relevant professionals first", "Verified profiles are ranked against the needs in that care profile."],
              ["03", "Message, book and build trust", "Talk safely in-app, request a booking and review the experience after care is completed."],
            ].map(([step, title, body], index) => (
              <Reveal key={step} delay={index * 100}>
                <div className="h-full rounded-[1.7rem] border border-white/10 bg-white/[0.06] p-7 backdrop-blur-sm transition hover:bg-white/[0.1]">
                  <p className="font-serif text-4xl italic text-coral-300">{step}</p>
                  <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10"><LinkButton href="/how-it-works" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">Explore the matching process</LinkButton></div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container-page section-pad">
          <Reveal><SectionHeading eyebrow="Verified network" title="Specialist experience you can understand at a glance." subtitle="A few of the verified profiles already available in the demo data." /></Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {featured.map((professional, index) => (
              <Reveal key={professional.id} delay={index * 90}>
                <Link href={`/professionals/${professional.id}`} className="block h-full">
                  <Card className="group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 text-lg font-semibold text-white shadow-lg">{professional.headline.charAt(0)}</div>
                      <Badge tone="success">Verified</Badge>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold leading-snug text-ink group-hover:text-teal-800">{professional.headline}</h3>
                    <p className="mt-1 text-sm text-ink/50">{professional.location} · {professional.yearsExperience} yrs experience</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {professional.experiences.slice(0, 2).map((experience) => {
                        const tag = EXPERIENCE_TAGS.find((item) => item.key === experience.tagKey);
                        return <span key={experience.tagKey} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">{tag?.label ?? experience.tagKey}</span>;
                      })}
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-4 border-t border-sand-100 pt-5">
                      <StarRating value={professional.ratingAvg} count={professional.ratingCount} />
                      <span className="text-base font-semibold text-ink">£{professional.hourlyRate}/hr</span>
                    </div>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="container-page pb-20">
        <Reveal><SectionHeading eyebrow="What better matching changes" title="Care journeys, not generic listings." subtitle="These are illustrative scenarios showing how the product is designed to make specialist needs easier to express and match." /></Reveal>
        <div className="mt-9"><StoryCarousel stories={stories} /></div>
      </section>

      <section className="border-y border-sand-200/70 bg-white/60">
        <div className="container-page section-pad">
          <MediaStory
            reverse
            image="https://images.pexels.com/photos/7446757/pexels-photo-7446757.jpeg?auto=compress&cs=tinysrgb&w=1400"
            alt="Family members supporting a wheelchair user with health monitoring at home"
            eyebrow="Funding-aware from the start"
            title="The way care is funded is part of the care journey."
            body="A family can record whether support is self-funded, paid through a local-authority direct payment, an NHS Continuing Healthcare personal health budget, or another family arrangement."
            bullets={[
              "Funding source is captured during family onboarding.",
              "Budget fit is one of the signals used by the matching engine.",
              "Rates and platform fees are visible before a booking request is submitted.",
            ]}
            cta={{ href: "/signup?role=FAMILY", label: "Build a care profile" }}
          />
        </div>
      </section>

      <section className="container-page py-20 sm:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-teal-700 via-teal-800 to-teal-950 px-6 py-14 text-center text-white shadow-2xl sm:px-12 sm:py-16">
            <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-coral-300/10 blur-3xl" />
            <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-teal-200/10 blur-3xl" />
            <div className="relative mx-auto max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-200">Care should feel personal before it even begins</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">Start with the needs. Find the people who understand them.</h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/60">Create a family profile, join as a specialist professional, or bring a vetted agency roster onto Marram Care.</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <LinkButton href="/signup?role=FAMILY" size="lg" className="w-full sm:w-auto">Find specialist care</LinkButton>
                <LinkButton href="/signup?role=PROFESSIONAL" size="lg" variant="outline" className="w-full border-white/40 bg-white/5 text-white hover:bg-white/10 sm:w-auto">Join as a professional</LinkButton>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
