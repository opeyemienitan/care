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
    <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-sand-50/90 backdrop-blur-xl">
      <div className="container-page flex h-[72px] items-center justify-between gap-5">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-teal-800 text-white shadow-lg shadow-teal-900/20">
            <span className="font-serif text-base font-semibold">M</span>
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-coral-400" />
          </span>
          <span>
            <span className="block text-lg font-semibold leading-none tracking-tight text-ink">Marram Care</span>
            <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40 sm:block">Specialist care matching</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:flex items-center gap-6 text-sm font-semibold text-ink/60">
          <Link href="/search" className="transition hover:text-teal-700">Find care</Link>
          <Link href="/how-it-works" className="transition hover:text-teal-700">How it works</Link>
          <Link href="/for-professionals" className="transition hover:text-teal-700">For professionals</Link>
          <Link href="/for-agencies" className="transition hover:text-teal-700">For agencies</Link>
          <Link href="/trust-and-safety" className="transition hover:text-teal-700">Trust & safety</Link>
          {user?.role === "ADMIN" && <Link href="/admin" className="transition hover:text-teal-700">Admin</Link>}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell userId={user.id} />
              <Link href={dashboardHref} className="text-sm font-semibold text-ink/75 transition hover:text-teal-700">
                Hi, {user.name.split(" ")[0]}
              </Link>
              <form action={logoutAction}>
                <button className="text-sm font-semibold text-ink/50 transition hover:text-ink">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-ink/75 transition hover:text-teal-700">Log in</Link>
              <LinkButton href="/signup" size="sm">Get started</LinkButton>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          {user && <NotificationBell userId={user.id} />}
          <MobileMenu isAdmin={user?.role === "ADMIN"} isLoggedIn={!!user} />
        </div>
      </div>
    </header>
  );
}
