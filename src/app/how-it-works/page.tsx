import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Marram Care Works",
  description: "See how Marram Care matches families with verified complex care, autism, learning disability and mental health support professionals in three steps.",
};

import { Card, SectionHeading, LinkButton, Badge } from "@/components/ui";
import { EXPERIENCE_TAGS } from "@/lib/tags";

export default function HowItWorksPage() {
  return (
    <div className="container-page py-16">
      <SectionHeading
        eyebrow="How it works"
        title="A specialist matching engine, not a generic listing site."
        subtitle="Every match on Marram Care is scored on real experience, verification status, location and budget — so families spend less time filtering and more time choosing with confidence."
      />

      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <Card className="p-8">
          <Badge tone="info">For families</Badge>
          <h3 className="mt-3 font-semibold text-xl text-ink">Build a care profile once</h3>
          <ol className="mt-4 space-y-3 text-sm text-ink/70 list-decimal list-inside">
            <li>Tell us who needs care and which of our 12 specialist experience areas apply.</li>
            <li>Set your location and budget range.</li>
            <li>We rank every verified professional against your profile automatically.</li>
            <li>Message and request a booking directly in-app — no phone tag required.</li>
          </ol>
        </Card>
        <Card className="p-8">
          <Badge tone="warning">For professionals</Badge>
          <h3 className="mt-3 font-semibold text-xl text-ink">Show families what makes you the right fit</h3>
          <ol className="mt-4 space-y-3 text-sm text-ink/70 list-decimal list-inside">
            <li>Build a profile around your real clinical and behavioural experience.</li>
            <li>Submit your DBS, references and qualifications for verification.</li>
            <li>Get discovered by families whose needs match your experience.</li>
            <li>Accept booking requests and manage everything from one dashboard.</li>
          </ol>
        </Card>
      </div>

      <div className="mt-12">
        <h3 className="font-semibold text-ink text-lg">The 12 specialisms we match on</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {EXPERIENCE_TAGS.map((t) => (
            <span key={t.key} className="rounded-full border border-sand-200 bg-white px-3 py-1.5 text-sm text-ink/70">
              {t.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-14 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <LinkButton href="/signup?role=FAMILY" size="lg" className="w-full sm:w-auto">Find specialist care</LinkButton>
        <LinkButton href="/signup?role=PROFESSIONAL" size="lg" variant="outline" className="w-full sm:w-auto">Offer your care expertise</LinkButton>
      </div>
    </div>
  );
}
