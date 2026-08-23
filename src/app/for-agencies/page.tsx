import type { Metadata } from "next";
import HeroSlideshow from "@/components/HeroSlideshow";
import MediaStory from "@/components/MediaStory";
import Reveal from "@/components/Reveal";
import { Card, SectionHeading, LinkButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "For Care Agencies",
  description: "Bring your vetted roster of complex care professionals onto Marram Care and get matched with families who need exactly what your staff offer.",
};

const slides = [
  {
    src: "https://images.pexels.com/photos/7446755/pexels-photo-7446755.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "A family supporting a wheelchair user during a health routine at home",
    label: "Specialist support families can understand",
  },
  {
    src: "https://images.pexels.com/photos/29372715/pexels-photo-29372715/free-photo-of-elderly-care-routine-in-a-cozy-home-setting.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "A care professional supporting an older adult at home",
    label: "Put roster experience in front of families",
  },
];

export default function ForAgenciesPage() {
  return (
    <div>
      <HeroSlideshow slides={slides} compact>
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-200">For care agencies</p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">Turn a trusted roster into a specialist discovery channel.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">Bring verified staff onto Marram Care, keep each professional’s experience visible, and help families find the right person by specialist fit rather than agency name alone.</p>
          <div className="mt-8"><LinkButton href="/signup?role=AGENCY" size="lg">List your agency roster <span aria-hidden>→</span></LinkButton></div>
        </div>
      </HeroSlideshow>

      <section className="container-page section-pad">
        <Reveal><SectionHeading align="center" eyebrow="A second way to be discovered" title="Your agency brand plus each professional’s individual credibility." subtitle="Families can understand who is providing the care, what that person is experienced in, and which verified agency they belong to." /></Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            ["Bring the roster", "Invite professionals by email. Each person keeps an individual profile and verification status while showing the agency relationship."],
            ["Surface specialist fit", "Roster professionals appear in family search when their experience matches what a family is looking for."],
            ["Build agency credibility", "A public agency profile brings the verified roster together so families can explore your people in one place."],
          ].map(([title, body], index) => (
            <Reveal key={title} delay={index * 80}>
              <Card className="h-full p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-coral-50 font-serif text-xl italic text-coral-600">0{index + 1}</div>
                <h2 className="mt-5 text-xl font-semibold text-ink">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink/60">{body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-sand-200/70 bg-white/60">
        <div className="container-page section-pad">
          <MediaStory
            reverse
            image="https://images.pexels.com/photos/7551611/pexels-photo-7551611.jpeg?auto=compress&cs=tinysrgb&w=1400"
            alt="A care professional supporting an older adult with movement and exercise"
            eyebrow="Make the roster human"
            title="Families are choosing a person, not a staffing spreadsheet."
            body="Agency discovery is strongest when each professional has a clear story: experience, specialisms, verification, location, training and rate. Marram Care keeps that person-level detail visible while preserving the agency relationship."
            bullets={[
              "Verified agency badge shown alongside eligible roster professionals.",
              "Public agency page groups the roster in one trusted destination.",
              "Individual profiles retain their own verification and specialist experience.",
            ]}
          />
        </div>
      </section>

      <section className="container-page section-pad">
        <Reveal><SectionHeading eyebrow="Agency onboarding" title="A straightforward route from company profile to discoverable roster." /></Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {[
            ["Create the agency account", "Add your company profile, location and registration details."],
            ["Complete agency review", "The agency stays private until the admin verification step is complete."],
            ["Invite your professionals", "Staff accept the roster invite from their own professional account."],
            ["Go live together", "Eligible roster profiles gain the agency association and can appear in family search."],
          ].map(([title, body], index) => (
            <Reveal key={title} delay={index * 70}>
              <div className="h-full rounded-[1.5rem] border border-sand-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-coral-600">Step {index + 1}</p>
                <h3 className="mt-4 font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <Reveal>
          <div className="rounded-[2rem] bg-gradient-to-br from-teal-700 to-teal-950 px-7 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-200">Build a stronger discovery surface</p><h2 className="mt-3 text-3xl font-semibold">Let specialist experience lead families to your roster.</h2></div>
            <div className="mt-7 shrink-0 lg:mt-0"><LinkButton href="/signup?role=AGENCY" size="lg">List your roster on Marram Care</LinkButton></div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
