"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/app/(auth)/actions";

export default function MobileMenu({
  isAdmin,
  isLoggedIn,
}: {
  isAdmin: boolean;
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-ink -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        {open ? (
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div id="mobile-nav-menu" className="fixed inset-x-0 top-16 z-30 border-b border-sand-200 bg-sand-50 shadow-card">
          <nav aria-label="Mobile" className="container-page flex flex-col py-4 text-base font-medium text-ink/80">
            <Link href="/search" onClick={() => setOpen(false)} className="py-3 border-b border-sand-100">
              Find care
            </Link>
            <Link href="/for-professionals" onClick={() => setOpen(false)} className="py-3 border-b border-sand-100">
              Offer care
            </Link>
            <Link href="/how-it-works" onClick={() => setOpen(false)} className="py-3 border-b border-sand-100">
              How it works
            </Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="py-3 border-b border-sand-100">
                Admin
              </Link>
            )}
            {!isLoggedIn ? (
              <div className="flex gap-3 pt-4">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center rounded-full border border-teal-700 text-teal-700 py-2.5 font-medium"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center rounded-full bg-coral-500 text-white py-2.5 font-medium"
                >
                  Get started
                </Link>
              </div>
            ) : (
              <form action={logoutAction} className="pt-4">
                <button className="w-full rounded-full border border-sand-200 text-ink/60 py-2.5 font-medium">
                  Log out
                </button>
              </form>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
