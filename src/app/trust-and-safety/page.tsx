import type { Metadata } from "next";
import Link from "next/link";
import HeroSlideshow from "@/components/HeroSlideshow";
import Reveal from "@/components/Reveal";
import { Card, SectionHeading, Badge, LinkButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Trust, Safety & Compliance",
  description: "How Marram Care approaches CQC positioning, DBS verification, safeguarding and UK GDPR for a specialist complex care matching platform.",
};

const slides = [
  {
    src: "https://images.pexels.com/photos/7446757/pexels-photo-7446757.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "A family supporting a wheelchair user with a home healthcare routine",
    label: "Trust built around real care moments",
  },
  {
    src: "https://images.pexels.com/photos/8088598/pexels-photo-8088598.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "A woman providing comfort to an older adult at home",
    label: "Dignity and safeguarding matter",
  },
];

const detailSections = [
  {
    tone: "info" as const,
    label: "Regulatory position",
    title: "CQC registration",
    body: "The Care Quality Commission does not require introduction agencies to register when they have no ongoing role in the personal care delivered after an introduction — registration is triggered by activities like directing, monitoring, or managing how care is delivered. Marram Care is built to stay on the introduction side of that line: we verify and match, families and professionals agree and deliver care directly, and we do not supervise or manage visits. If Marram Care later adds features that cross into monitoring care delivery, that feature and its CQC implications should be reviewed with a regulatory specialist before launch.",
  },
  {
    tone: "success" as const,
    label: "Employment model",
    title: "Employment agency position",
    body: "Employment agency licensing was abolished UK-wide, but the Conduct of Employment Agencies and Employment Businesses Regulations 2003 still matter. Marram Care is designed as an introduction marketplace rather than an employment business: professionals contract directly with families and the platform does not direct, supervise or control the care they deliver. This remains fact-sensitive and should be reviewed by an employment solicitor before commercial launch.",
  },
  {
    tone: "success" as const,
    label: "Verification",
    title: "DBS checks",
    body: "Every professional must submit an Enhanced DBS certificate, with barred-list checking where the role involves regulated activity, before their profile goes live. The product tracks document status and can surface DBS Update Service participation so families can understand the current verification picture rather than relying on an unexplained badge.",
  },
  {
    tone: "info" as const,
    label: "Agencies",
    title: "Agency rosters",
    body: "Care agencies can bring vetted staff onto Marram Care as a roster. An agency account only becomes publicly visible once an admin verifies it, while each professional retains an individual verification status. Agencies remain responsible for their own regulatory and employment obligations where they directly employ, direct or manage staff.",
  },
  {
    tone: "warning" as const,
    label: "Safeguarding",
    title: "Safeguarding reports",
    body: "Anyone can report a safeguarding concern about a booking or professional from the platform. Reports go to the admin safeguarding queue independently of routine document review. Marram Care does not investigate criminal matters; concerns involving immediate risk of harm should also go to the police or the relevant local-authority safeguarding team.",
  },
  {
    tone: "info" as const,
    label: "Data protection",
    title: "UK GDPR and special-category data",
    body: "Care needs and conditions are special-category health data. The product captures explicit consent when a family builds a care profile and is designed to share that information only within the care-matching and engagement journey, not for advertising or resale. Uploaded verification documents are served through an authenticated route rather than public URLs.",
  },
  {
    tone: "warning" as const,
    label: "Registration",
    title: "ICO data protection fee",
    body: "A UK organisation processing personal data may need to register and pay the Information Commissioner's Office data protection fee unless an exemption applies. This should be completed before processing real family or professional data in production and reviewed alongside the wider UK GDPR compliance programme.",
  },
  {
    tone: "neutral" as const,
    label: "Payments",
    title: "Client money and payment flow",
    body: "The product is designed around a Stripe Connect-style flow: payment is authorised when a booking is requested, released to the professional on completion, or refunded on decline or cancellation. The current build uses a mock adapter for testing, so no real card is charged until the live payment integration is implemented and reviewed.",
  },
  {
    tone: "neutral" as const,
    label: "Tax",
    title: "VAT",
    body: "VAT registration needs to be monitored against the applicable UK threshold as platform fee revenue grows. Professional tax obligations remain separate from the platform's own obligations.",
  },
];

export default function TrustAndSafetyPage() {
  return (
    <div>
      <HeroSlideshow slides={slides} compact>
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-200">Trust, safety & compliance</p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">Trust is not one badge. It is a system of visible safeguards.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">Marram Care is designed as a specialist matching marketplace. Verification, safeguarding, data handling and transparent platform boundaries all contribute to how families decide whether to engage.</p>
        </div>
      </HeroSlideshow>

      <section className="container-page section-pad">
        <Reveal><SectionHeading align="center" eyebrow="What families should be able to see" title="Confidence before a booking request." subtitle="The product surfaces practical trust signals at the moment they matter rather than hiding them in policy pages." /></Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["DBS-led", "Verification", "Document status is visible on the professional profile."],
            ["Private", "Health information", "Sensitive care information stays inside the matching journey."],
            ["Priority", "Safeguarding", "Concerns have a dedicated reporting and admin-review path."],
            ["Clear", "Platform role", "Marram Care explains where matching ends and care delivery begins."],
          ].map(([value, title, body], index) => (
            <Reveal key={title} delay={index * 70}>
              <Card className="h-full p-6"><p className="text-2xl font-semibold text-teal-800">{value}</p><h2 className="mt-3 font-semibold text-ink">{title}</h2><p className="mt-2 text-sm leading-relaxed text-ink/60">{body}</p></Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-sand-200/70 bg-white/60">
        <div className="container-page section-pad">
          <Reveal><SectionHeading eyebrow="The detail behind the trust layer" title="Regulatory and safety decisions should be inspectable." subtitle="Open any topic below for the current product position. These notes explain design intent and are not legal advice." /></Reveal>
          <div className="mt-9 grid gap-4 lg:grid-cols-2">
            {detailSections.map((section, index) => (
              <Reveal key={section.title} delay={(index % 2) * 60}>
                <details className="group h-full rounded-[1.5rem] border border-sand-200 bg-white p-6 shadow-sm open:shadow-lg">
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-start justify-between gap-4">
                      <div><Badge tone={section.tone}>{section.label}</Badge><h2 className="mt-3 text-lg font-semibold text-ink">{section.title}</h2></div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand-50 text-lg text-ink/50 transition group-open:rotate-45">+</span>
                    </div>
                  </summary>
                  <p className="mt-5 border-t border-sand-100 pt-5 text-sm leading-7 text-ink/60">{section.body}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <Reveal>
          <div className="rounded-[2rem] bg-teal-950 p-8 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-8">
            <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-300">Design intent, not legal advice</p><h2 className="mt-3 text-2xl font-semibold sm:text-3xl">The commercial launch should still receive specialist UK legal and regulatory review.</h2><p className="mt-3 text-sm leading-relaxed text-white/60">The platform documentation gives that review a concrete starting point instead of a black box.</p></div>
            <div className="mt-7 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0"><LinkButton href="/how-it-works" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">See how matching works</LinkButton><LinkButton href="/signup">Get started</LinkButton></div>
          </div>
        </Reveal>
        <p className="mt-8 text-center text-xs text-ink/40">For immediate danger or an emergency, contact the appropriate emergency services first.</p>
        <div className="mt-3 text-center"><Link href="/" className="text-sm font-semibold text-teal-700">Back to Marram Care →</Link></div>
      </section>
    </div>
  );
}
