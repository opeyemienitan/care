import type { Metadata } from "next";
import Link from "next/link";
import { Card, Field, inputClass, Button } from "@/components/ui";
import { resetPasswordAction } from "../actions";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string; error?: string };
}) {
  const token = searchParams?.token || "";

  return (
    <div className="container-page py-20 max-w-md">
      <h1 className="text-3xl font-semibold text-ink text-center">Set a new password</h1>
      <Card className="mt-8 p-8">
        {!token ? (
          <p className="text-sm text-ink/70">
            This link is missing a reset token.{" "}
            <Link href="/forgot-password" className="text-teal-700 font-medium">
              Request a new one
            </Link>
            .
          </p>
        ) : (
          <>
            {searchParams?.error && (
              <p role="alert" className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{searchParams.error}</p>
            )}
            <form action={resetPasswordAction} className="space-y-5">
              <input type="hidden" name="token" value={token} />
              <Field label="New password">
                <input className={inputClass} type="password" name="password" required minLength={6} placeholder="At least 6 characters" />
              </Field>
              <Button type="submit" className="w-full">
                Update password
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
