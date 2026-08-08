import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Care Professionals",
  description: "Join Marram Care to get matched with families who need your specialist complex care, autism, mental health or learning disability experience.",
};

import { Card, SectionHeading, LinkButton } from "@/components/ui";

export default function ForProfessionalsPage() {
  return (
    <div className="container-page py-16">
      <SectionHeading
        eyebrow="For care professionals"
        title="Get matched with families who need exactly what you offer."
        subtitle="Stop competing on generic job boards. Your PEG feeding, autism, mental health or complex care experience is the headline — not a line buried in a CV."
      />

      <div className="mt-12 grid sm:grid-cols-3 gap-6">
        {[
          { title: "Verified, not generic", body: "DBS, references and qualifications reviewed by our team — so families trust your badge on sight." },
          { title: "Matched, not searched", body: "Families see you because your specialist tags match their care recipient's actual needs." },
          { title: "Paid securely", body: "Transparent rates and secure in-app booking, with your fee shown clearly upfront." },
        ].map((f) => (
          <Card key={f.title} className="p-6">
            <h3 className="font-semibold text-ink">{f.title}</h3>
            <p className="mt-2 text-sm text-ink/60">{f.body}</p>
          </Card>
        ))}
      </div>

      <div className="mt-14">
        {/* full-width on mobile */}
        <LinkButton href="/signup?role=PROFESSIONAL" size="lg" className="w-full sm:w-auto">Apply to join Marram Care</LinkButton>
      </div>
    </div>
  );
}
