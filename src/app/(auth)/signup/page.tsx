import Link from "next/link";
import { Card, Field, inputClass, Button } from "@/components/ui";
import { signupAction } from "../actions";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { role?: string; error?: string; ref?: string };
}) {
  const role =
    searchParams?.role === "PROFESSIONAL"
      ? "PROFESSIONAL"
      : searchParams?.role === "AGENCY"
      ? "AGENCY"
      : "FAMILY";

  return (
    <div className="container-page py-20 max-w-md">
      <h1 className="text-3xl font-semibold text-ink text-center">Create your account</h1>
      {searchParams?.ref && (
        <p className="mt-2 text-center text-xs text-teal-700 bg-teal-50 rounded-full px-3 py-1 inline-block w-full">
          Invited with code {searchParams.ref.toUpperCase()}
        </p>
      )}
      <p className="mt-2 text-center text-ink/60 text-sm">
        {role === "FAMILY"
          ? "Set up a care profile for your loved one."
          : role === "PROFESSIONAL"
          ? "Apply to join as a specialist professional."
          : "Bring your roster onto Marram Care and find families for your staff."}
      </p>
      <Card className="mt-8 p-8">
        {searchParams?.error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{searchParams.error}</p>
        )}
        <div className="mb-6 flex rounded-full bg-sand-100 p-1 text-sm font-medium">
          <Link
            href="/signup?role=FAMILY"
            className={`flex-1 text-center rounded-full py-2 ${role === "FAMILY" ? "bg-white shadow-soft text-ink" : "text-ink/50"}`}
          >
            Family
          </Link>
          <Link
            href="/signup?role=PROFESSIONAL"
            className={`flex-1 text-center rounded-full py-2 ${role === "PROFESSIONAL" ? "bg-white shadow-soft text-ink" : "text-ink/50"}`}
          >
            Professional
          </Link>
          <Link
            href="/signup?role=AGENCY"
            className={`flex-1 text-center rounded-full py-2 ${role === "AGENCY" ? "bg-white shadow-soft text-ink" : "text-ink/50"}`}
          >
            Agency
          </Link>
        </div>
        <form action={signupAction} className="space-y-5">
          <input type="hidden" name="role" value={role} />
          <input type="hidden" name="ref" value={searchParams?.ref || ""} />
          <Field label={role === "AGENCY" ? "Your name" : "Full name"}>
            <input className={inputClass} name="name" required placeholder="Jane Doe" />
          </Field>
          <Field label="Email">
            <input className={inputClass} type="email" name="email" required placeholder="you@example.com" />
          </Field>
          <Field label="Password" hint="At least 6 characters.">
            <input className={inputClass} type="password" name="password" required minLength={6} />
          </Field>
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-700 font-medium">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
