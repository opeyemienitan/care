"use client";

import Link from "next/link";
import { useState } from "react";
import { logoutAction } from "@/app/(auth)/actions";

export default function MobileMenu({ isAdmin, isLoggedIn }: { isAdmin: boolean; isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const links = [
    ["Find care", "/search"],
    ["How it works", "/how-it-works"],
    ["For professionals", "/for-professionals"],
    ["For agencies", "/for-agencies"],
    ["Trust & safety", "/trust-and-safety"],
  ];

  return (
    <div className="md:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        onClick={() => setOpen((value) => !value)}
        className="-mr-2 flex h-11 w-11 items-center justify-center rounded-xl text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        {open ? (
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
        ) : (
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" /></svg>
        )}
      </button>

      {open && (
        <div id="mobile-nav-menu" className="fixed inset-x-0 top-[72px] z-30 border-b border-sand-200 bg-sand-50/95 shadow-2xl backdrop-blur-xl">
          <nav aria-label="Mobile" className="container-page flex flex-col py-4 text-base font-semibold text-ink/80">
            {links.map(([label, href]) => (
              <Link key={href} href={href} onClick={close} className="border-b border-sand-100 py-3.5 transition hover:text-teal-700">{label}</Link>
            ))}
            {isAdmin && <Link href="/admin" onClick={close} className="border-b border-sand-100 py-3.5">Admin</Link>}
            {!isLoggedIn ? (
              <div className="flex gap-3 pt-5">
                <Link href="/login" onClick={close} className="flex-1 rounded-full border border-teal-700 py-2.5 text-center font-semibold text-teal-700">Log in</Link>
                <Link href="/signup" onClick={close} className="flex-1 rounded-full bg-coral-500 py-2.5 text-center font-semibold text-white">Get started</Link>
              </div>
            ) : (
              <form action={logoutAction} className="pt-5">
                <button className="w-full rounded-full border border-sand-200 py-2.5 font-semibold text-ink/60">Log out</button>
              </form>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
