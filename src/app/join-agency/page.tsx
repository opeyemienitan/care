import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getAgencyInviteByToken, getAgencyById } from "@/lib/queries";
import { Card, Button } from "@/components/ui";
import { acceptAgencyInviteAction, declineAgencyInviteAction } from "@/app/agency-actions";

export const metadata: Metadata = {
  title: "Join an agency roster",
  robots: { index: false, follow: false },
};

export default async function JoinAgencyPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams?.token || "";
  const user = await getCurrentUser();
  const invite = token ? await getAgencyInviteByToken(token) : undefined;
  const agency = invite ? await getAgencyById(invite.agencyId) : undefined;

  return (
    <div className="container-page py-20 max-w-md">
      <h1 className="text-3xl font-semibold text-ink text-center">Join a roster</h1>
      <Card className="mt-8 p-8 text-center">
        {!invite || !agency ? (
          <p className="text-sm text-ink/70">This invite link isn't valid or has already been used.</p>
        ) : invite.status !== "PENDING" ? (
          <p className="text-sm text-ink/70">This invite has already been {invite.status.toLowerCase()}.</p>
        ) : !user ? (
          <>
            <p className="text-sm text-ink/70">
              <strong>{agency.companyName}</strong> invited you to join their roster on Marram Care.
              Log in or create a professional account, then come back to this link to accept.
            </p>
            <div className="mt-4 flex gap-3 justify-center">
              <Link href="/login" className="text-sm text-teal-700 font-medium">
                Log in
              </Link>
              <Link href="/signup?role=PROFESSIONAL" className="text-sm text-teal-700 font-medium">
                Create account
              </Link>
            </div>
          </>
        ) : user.role !== "PROFESSIONAL" ? (
          <p className="text-sm text-ink/70">
            This invite is for a professional account, but you're logged in as {user.role.toLowerCase()}.
            Log in with a professional account to accept.
          </p>
        ) : (
          <>
            <p className="text-sm text-ink/70">
              <strong>{agency.companyName}</strong> invited you to join their roster.
            </p>
            <p className="mt-2 text-xs text-ink/50">{agency.description}</p>
            <div className="mt-5 flex gap-3 justify-center">
              <form action={acceptAgencyInviteAction}>
                <input type="hidden" name="token" value={token} />
                <Button type="submit" size="sm">
                  Join {agency.companyName}
                </Button>
              </form>
              <form action={declineAgencyInviteAction}>
                <input type="hidden" name="token" value={token} />
                <Button type="submit" size="sm" variant="outline">
                  Decline
                </Button>
              </form>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
