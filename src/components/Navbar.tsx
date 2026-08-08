import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { LinkButton } from "./ui";
import { logoutAction } from "@/app/(auth)/actions";
import MobileMenu from "./MobileMenu";
import NotificationBell from "./NotificationBell";

export default async function Navbar() {
  const user = await getCurrentUser();

  const dashboardHref = user
    ? user.role === "FAMILY"
      ? "/dashboard/family"
      : user.role === "PROFESSIONAL"
      ? "/dashboard/professional"
      : user.role === "AGENCY"
      ? "/dashboard/agency"
      : "/admin"
    : "/login";

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-sand-50/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white font-serif text-sm font-semibold">
            MC
          </span>
          <span className="text-lg font-semibold tracking-tight text-ink">Marram Care</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-ink/70">
          <Link href="/search" className="hover:text-ink">
            Find care
          </Link>
          <Link href="/for-professionals" className="hover:text-ink">
            Offer care
          </Link>
          <Link href="/how-it-works" className="hover:text-ink">
            How it works
          </Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="hover:text-ink">
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell userId={user.id} />
              <Link href={dashboardHref} className="text-sm font-medium text-ink/80 hover:text-ink">
                Hi, {user.name.split(" ")[0]}
              </Link>
              <form action={logoutAction}>
                <button className="text-sm font-medium text-ink/50 hover:text-ink">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-ink/80 hover:text-ink">
                Log in
              </Link>
              <LinkButton href="/signup" size="sm">
                Get started
              </LinkButton>
            </>
          )}
        </div>

        <div className="flex md:hidden items-center gap-1">
          {user && <NotificationBell userId={user.id} />}
          <MobileMenu isAdmin={user?.role === "ADMIN"} isLoggedIn={!!user} />
        </div>
      </div>
    </header>
  );
}
