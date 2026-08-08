import Link from "next/link";
import { Suspense } from "react";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="border-t border-sand-200 mt-24">
      <div className="container-page py-12 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <span className="text-lg font-semibold tracking-tight text-ink">Marram Care</span>
          <p className="mt-3 text-sm text-ink/60 max-w-xs">
            The specialist matching platform connecting families with verified complex care
            professionals — care that moves with the NHS, from hospital to home.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink mb-3">For families</p>
          <ul className="space-y-2 text-sm text-ink/60">
            <li><Link href="/search" className="hover:text-ink">Find a professional</Link></li>
            <li><Link href="/how-it-works" className="hover:text-ink">How matching works</Link></li>
            <li><Link href="/signup?role=FAMILY" className="hover:text-ink">Create a care profile</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink mb-3">For professionals</p>
          <ul className="space-y-2 text-sm text-ink/60">
            <li><Link href="/for-professionals" className="hover:text-ink">Why join Marram Care</Link></li>
            <li><Link href="/signup?role=PROFESSIONAL" className="hover:text-ink">Apply to join</Link></li>
            <li><Link href="/for-agencies" className="hover:text-ink">List your agency roster</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink mb-3">Trust & safety</p>
          <ul className="space-y-2 text-sm text-ink/60">
            <li><Link href="/trust-and-safety" className="hover:text-ink">DBS-checked professionals</Link></li>
            <li><Link href="/trust-and-safety" className="hover:text-ink">Reference &amp; ID verified</Link></li>
            <li>Secure in-app messaging</li>
          </ul>
        </div>
      </div>

      <div className="container-page py-8 border-t border-sand-200">
        <p className="text-sm font-semibold text-ink mb-2">Get updates from Marram Care</p>
        <p className="text-sm text-ink/60 mb-3 max-w-md">
          New verified specialists, product updates, and care-sector news — no spam, unsubscribe
          anytime.
        </p>
        <div className="max-w-sm">
          <Suspense fallback={null}>
            <NewsletterForm source="footer" redirectTo="/" />
          </Suspense>
        </div>
      </div>
      <div className="container-page py-6 border-t border-sand-200 text-xs text-ink/40">
        © {new Date().getFullYear()} Marram Care. Marram Care is a matching marketplace, not a
        regulated care provider or CQC-registered agency. Demo prototype — not for production use.
      </div>
    </footer>
  );
}
