import type { Metadata } from "next";
import Link from "next/link";
import { Card, Field, inputClass, Button } from "@/components/ui";
import { requestPasswordResetAction } from "../actions";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage({ searchParams }: { searchParams: { sent?: string } }) {
  return (
    <div className="container-page py-20 max-w-md">
      <h1 className="text-3xl font-semibold text-ink text-center">Reset your password</h1>
      <p className="mt-2 text-center text-ink/60 text-sm">
        We'll email you a link to set a new one.
      </p>
      <Card className="mt-8 p-8">
        {searchParams?.sent ? (
          <div className="text-center">
            <p className="text-sm text-ink/70">
              If an account exists for that email, we've sent a password reset link. It expires in
              24 hours.
            </p>
            <Link href="/login" className="mt-4 inline-block text-sm text-teal-700 font-medium">
              Back to login
            </Link>
          </div>
        ) : (
          <form action={requestPasswordResetAction} className="space-y-5">
            <Field label="Email">
              <input className={inputClass} type="email" name="email" required placeholder="you@example.com" />
            </Field>
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-ink/60">
          <Link href="/login" className="text-teal-700 font-medium">
            Back to login
          </Link>
        </p>
      </Card>
    </div>
  );
}
