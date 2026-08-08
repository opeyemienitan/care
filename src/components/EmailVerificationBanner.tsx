import { resendVerificationAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui";

export default function EmailVerificationBanner({ verified }: { verified: boolean }) {
  if (verified) return null;
  return (
    <div className="mt-6 flex items-center justify-between gap-4 flex-wrap rounded-xl2 border border-amber-200 bg-amber-50 px-5 py-3.5">
      <p className="text-sm text-amber-800">
        Please verify your email address — check your inbox for a link from Marram Care.
      </p>
      <form action={resendVerificationAction}>
        <Button type="submit" size="sm" variant="outline">
          Resend email
        </Button>
      </form>
    </div>
  );
}
