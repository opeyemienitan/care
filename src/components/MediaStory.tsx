import Image from "next/image";
import Reveal from "./Reveal";
import { LinkButton } from "./ui";

export default function MediaStory({
  image,
  alt,
  eyebrow,
  title,
  body,
  bullets = [],
  cta,
  reverse = false,
}: {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets?: string[];
  cta?: { href: string; label: string };
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <Reveal className={reverse ? "lg:order-2" : undefined}>
        <div className="image-zoom relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-teal-100 shadow-2xl">
          <Image src={image} alt={alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-950/20 via-transparent to-transparent" />
        </div>
      </Reveal>

      <Reveal delay={120} className={reverse ? "lg:order-1" : undefined}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-600">{eyebrow}</p>
        <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-ink/60">{body}</p>
        {bullets.length > 0 && (
          <ul className="mt-7 space-y-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-ink/75">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">✓</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
        {cta && (
          <div className="mt-8">
            <LinkButton href={cta.href} variant="secondary" size="lg">{cta.label}</LinkButton>
          </div>
        )}
      </Reveal>
    </div>
  );
}
