import Link from "next/link";
import { Card, Field, inputClass, Button } from "@/components/ui";
import { loginAction } from "../actions";

export default function LoginPage({ searchParams }: { searchParams: { error?: string; reset?: string } }) {
  return (
    <div className="container-page py-20 max-w-md">
      <h1 className="text-3xl font-semibold text-ink text-center">Welcome back</h1>
      <p className="mt-2 text-center text-ink/60 text-sm">Log in to Marram Care.</p>
      <Card className="mt-8 p-8">
        {searchParams?.error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{searchParams.error}</p>
        )}
        {searchParams?.reset && (
          <p role="status" className="mb-4 rounded-lg bg-teal-50 text-teal-700 text-sm px-3 py-2">
            Password updated — log in with your new password.
          </p>
        )}
        <form action={loginAction} className="space-y-5">
          <Field label="Email">
            <input className={inputClass} type="email" name="email" required placeholder="you@example.com" />
          </Field>
          <Field label="Password">
            <input className={inputClass} type="password" name="password" required placeholder="••••••••" />
          </Field>
          <div className="text-right -mt-2">
            <Link href="/forgot-password" className="text-xs text-teal-700 font-medium">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink/60">
          New to Marram Care?{" "}
          <Link href="/signup" className="text-teal-700 font-medium">
            Create an account
          </Link>
        </p>
        <div className="mt-6 border-t border-sand-200 pt-4 text-xs text-ink/40">
          Demo accounts (password <code>password123</code>): grace@family.demo · marcus@pro.demo ·
          agency@marramcare.demo · admin@marramcare.co.uk
        </div>
      </Card>
    </div>
  );
}
