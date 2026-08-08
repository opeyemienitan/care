import type { Metadata } from "next";
import Link from "next/link";
import { Card, Button } from "@/components/ui";
import { verifyEmailAction, resendVerificationAction } from "../actions";

export const metadata: Metadata = {
  title: "Verify your email",
  robots: { index: false, follow: false },
};

export default async function VerifyEmailPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams?.token || "";
  const result = token ? await verifyEmailAction(token) : "invalid";

  return (
    <div className="container-page py-20 max-w-md">
      <h1 className="text-3xl font-semibold text-ink text-center">Verify your email</h1>
      <Card className="mt-8 p-8 text-center">
        {result === "verified" && (
          <>
            <p className="text-sm text-teal-700 font-medium">Your email is verified.</p>
            <Link href="/" className="mt-4 inline-block text-sm text-teal-700 font-medium">
              Continue to Marram Care →
            </Link>
          </>
        )}
        {result === "expired" && (
          <>
            <p className="text-sm text-ink/70">
              This verification link has expired. Log in and we'll send you a fresh one from your
              dashboard.
            </p>
            <form action={resendVerificationAction} className="mt-4">
              <Button type="submit" size="sm" variant="outline">
                Resend verification email
              </Button>
            </form>
          </>
        )}
        {result === "invalid" && (
          <p className="text-sm text-ink/70">
            This verification link isn't valid. If you still need to verify, log in and resend it
            from your dashboard.
          </p>
        )}
      </Card>
    </div>
  );
}
