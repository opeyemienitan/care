import { clsx } from "clsx";
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
        variant === "primary" && "bg-coral-500 text-white hover:bg-coral-600",
        variant === "secondary" && "bg-teal-700 text-white hover:bg-teal-800",
        variant === "outline" && "border border-teal-700 text-teal-700 hover:bg-teal-50",
        variant === "ghost" && "text-teal-700 hover:bg-teal-50",
        size === "sm" && "px-3.5 py-1.5 text-sm",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-7 py-3.5 text-base",
        className
      )}
      {...props}
    />
  );
}

export function LinkButton({
  className,
  variant = "primary",
  size = "md",
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
        variant === "primary" && "bg-coral-500 text-white hover:bg-coral-600",
        variant === "secondary" && "bg-teal-700 text-white hover:bg-teal-800",
        variant === "outline" && "border border-teal-700 text-teal-700 hover:bg-teal-50",
        variant === "ghost" && "text-teal-700 hover:bg-teal-50",
        size === "sm" && "px-3.5 py-1.5 text-sm",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-7 py-3.5 text-base",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={clsx("rounded-xl2 bg-white shadow-card border border-sand-200", className)}>
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "bg-sand-100 text-ink",
        tone === "success" && "bg-teal-100 text-teal-800",
        tone === "warning" && "bg-coral-100 text-coral-700",
        tone === "danger" && "bg-red-100 text-red-700",
        tone === "info" && "bg-teal-50 text-teal-600",
        className
      )}
    >
      {children}
    </span>
  );
}

export function VerifiedBadge({ status }: { status: string }) {
  if (status === "VERIFIED") {
    return (
      <Badge tone="success">
        <CheckIcon /> Verified professional
      </Badge>
    );
  }
  if (status === "IN_REVIEW") {
    return <Badge tone="info">Verification in review</Badge>;
  }
  if (status === "REJECTED") {
    return <Badge tone="danger">Verification rejected</Badge>;
  }
  if (status === "EXPIRED") {
    return <Badge tone="warning">Verification expired</Badge>;
  }
  return <Badge tone="neutral">Verification pending</Badge>;
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
      <path
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
        fill="currentColor"
      />
    </svg>
  );
}

export function StarRating({ value, count }: { value: number; count: number }) {
  if (count === 0) {
    return <span className="text-sm text-ink/50">New professional · no reviews yet</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="text-coral-500" aria-hidden>
        ★
      </span>
      <span className="font-semibold">{value.toFixed(1)}</span>
      <span className="text-ink/50">({count} reviews)</span>
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wide text-coral-500 mb-3">{eyebrow}</p>
      )}
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-ink/70">{subtitle}</p>}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-ink/50 mt-1">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-sand-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent";
