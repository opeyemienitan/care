import type { Metadata } from "next";
import HeroSlideshow from "@/components/HeroSlideshow";
import MediaStory from "@/components/MediaStory";
import Reveal from "@/components/Reveal";
import { Card, SectionHeading, LinkButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "For Care Professionals",
  description: "Join Marram Care to get matched with families who need your specialist complex care, autism, mental health or learning disability experience.",
};

const slides = [
  {
    src: "https://images.pexels.com/photos/7551611/pexels-photo-7551611.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "A care professional supporting an older adult with exercise at home",
    label: "Make specialist experience visible",
  },
  {
    src: "https://images.pexels.com/photos/29372715/pexels-photo-29372715/free-photo-of-elderly-care-routine-in-a-cozy-home-setting.jpeg?auto=compress&cs=tinysrgb&w=1800",
    alt: "A care professional assisting an older adult with a walking frame",
    label: "Support built around independence",
  },
];

export default function ForProfessionalsPage() {
  return (
    <div>
      <HeroSlideshow slides={slides} compact>
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-200">For care professionals</p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">Your specialist experience should be the reason a family finds you.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">Build a profile around the care you actually know how to deliver — then get discovered by families whose needs overlap with your experience.</p>
          <div className="mt-8"><LinkButton href="/signup?role=PROFESSIONAL" size="lg">Apply to join Marram Care <span aria-hidden>→</span></LinkButton></div>
        </div>
      </HeroSlideshow>

      <section className="container-page section-pad">
        <Reveal><SectionHeading align="center" eyebrow="Be known for what you do well" title="A profile that feels more like your practice than a generic CV." subtitle="Marram Care turns experience, verification, training and availability into clear signals families can understand." /></Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            ["Specialist-first profile", "Put PEG feeding, autism, mental health, learning disability, mobility support and other hands-on areas at the centre of your profile.", "01"],
            ["Trust you can show", "DBS, identity, references and verified training are surfaced clearly so families do not have to guess what has been checked.", "02"],
            ["Transparent bookings", "Set your rate, receive relevant requests and keep messaging, booking and visit history together in one place.", "03"],
          ].map(([title, body, number], index) => (
            <Reveal key={title} delay={index * 80}>
              <Card className="h-full p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <p className="font-serif text-3xl italic text-coral-500">{number}</p>
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
            image="https://images.pexels.com/photos/7446755/pexels-photo-7446755.jpeg?auto=compress&cs=tinysrgb&w=1400"
            alt="A family and a wheelchair user managing a health routine at home"
            eyebrow="The right work, not just more work"
            title="Get discovered when your experience is relevant to the care profile."
            body="A family’s care profile captures specialist needs, location and budget. Your profile makes the same experience visible from your side, giving the matching engine stronger signals than a generic keyword search."
            bullets={[
              "Choose specialist tags and show your hands-on experience level.",
              "Add verified training and certifications as your professional profile grows.",
              "Families can understand your rate and experience before contacting you.",
            ]}
          />
        </div>
      </section>

      <section className="container-page section-pad">
        <Reveal><SectionHeading eyebrow="Joining the network" title="From application to a profile families can trust." /></Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {[
            ["Create your account", "Tell us who you are and start your professional profile."],
            ["Show your experience", "Add specialist areas, location, rate and a clear professional bio."],
            ["Complete verification", "Submit the documents and training evidence required for review."],
            ["Receive relevant requests", "Once visible, families can discover you through search and personalised matching."],
          ].map(([title, body], index) => (
            <Reveal key={title} delay={index * 70}>
              <div className="relative h-full rounded-[1.5rem] border border-sand-200 bg-white p-6 shadow-sm">
                <span className="absolute right-5 top-5 text-xs font-semibold text-ink/30">0{index + 1}</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 font-semibold text-teal-700">✓</div>
                <h3 className="mt-5 font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <Reveal>
          <div className="rounded-[2rem] bg-teal-950 px-7 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-300">Ready when you are</p><h2 className="mt-3 text-3xl font-semibold">Let families find the experience they have been looking for.</h2><p className="mt-3 text-sm leading-relaxed text-white/60">Create your profile now; real third-party integrations can be connected later without changing the core profile journey.</p></div>
            <div className="mt-7 shrink-0 lg:mt-0"><LinkButton href="/signup?role=PROFESSIONAL" size="lg">Apply to join Marram Care</LinkButton></div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
