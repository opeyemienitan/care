import Link from "next/link";
import { Suspense } from "react";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="mt-24 overflow-hidden bg-teal-950 text-white">
      <div className="container-page py-14">
        <div className="grid gap-10 rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-300">Stay close to better care</p>
            <h2 className="mt-3 max-w-xl text-2xl font-semibold leading-tight sm:text-3xl">Useful updates for families, professionals and care agencies.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">New specialist areas, product updates and practical care-sector news. No spam.</p>
          </div>
          <div className="lg:justify-self-end lg:w-full lg:max-w-md">
            <Suspense fallback={null}><NewsletterForm source="footer" redirectTo="/" /></Suspense>
          </div>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white text-teal-900"><span className="font-serif font-semibold">M</span><span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-coral-400" /></span>
              <div><p className="text-lg font-semibold">Marram Care</p><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Specialist care matching</p></div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">A specialist matching marketplace helping families discover care professionals by the experience that matters in real life.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Families</p>
            <ul className="mt-4 space-y-3 text-sm text-white/60"><li><Link href="/search" className="hover:text-white">Find care</Link></li><li><Link href="/how-it-works" className="hover:text-white">How matching works</Link></li><li><Link href="/signup?role=FAMILY" className="hover:text-white">Create a care profile</Link></li></ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Join Marram</p>
            <ul className="mt-4 space-y-3 text-sm text-white/60"><li><Link href="/for-professionals" className="hover:text-white">For professionals</Link></li><li><Link href="/for-agencies" className="hover:text-white">For agencies</Link></li><li><Link href="/signup" className="hover:text-white">Get started</Link></li></ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Confidence</p>
            <ul className="mt-4 space-y-3 text-sm text-white/60"><li><Link href="/trust-and-safety" className="hover:text-white">Trust & safety</Link></li><li>DBS-led verification</li><li>Secure in-app messaging</li></ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs leading-relaxed text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Marram Care.</span>
          <span>Marram Care is a matching marketplace, not a regulated care provider or CQC-registered agency. Demo prototype — not for production use.</span>
        </div>
      </div>
    </footer>
  );
}
