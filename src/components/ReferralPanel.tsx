import { Card } from "./ui";
import { SITE_URL } from "@/lib/seo";

export default function ReferralPanel({
  referralCode,
  referralCount,
  role,
}: {
  referralCode: string;
  referralCount: number;
  role: "FAMILY" | "PROFESSIONAL";
}) {
  const link = `${SITE_URL}/signup?role=${role}&ref=${referralCode}`;

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-ink text-sm">
        {role === "FAMILY" ? "Know another family who needs this?" : "Know another specialist professional?"}
      </h3>
      <p className="mt-1 text-xs text-ink/50">
        Share your link — Marram Care grows fastest through people who already trust it.
      </p>
      <div className="mt-3 rounded-lg bg-sand-50 border border-sand-200 px-3 py-2 text-xs text-ink/70 break-all font-mono">
        {link}
      </div>
      <p className="mt-2 text-xs text-ink/50">
        {referralCount} {referralCount === 1 ? "person has" : "people have"} joined with your code{" "}
        <span className="font-medium text-ink/70">{referralCode}</span>.
      </p>
    </Card>
  );
}
