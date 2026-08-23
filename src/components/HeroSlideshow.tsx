"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";

type Slide = {
  src: string;
  alt: string;
  label: string;
};

export default function HeroSlideshow({
  slides,
  children,
  compact = false,
}: {
  slides: Slide[];
  children: ReactNode;
  compact?: boolean;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [slides.length]);

  const minHeight = compact ? "min-h-[520px]" : "min-h-[680px] lg:min-h-[760px]";

  return (
    <section className={`relative isolate overflow-hidden bg-teal-950 text-white ${minHeight}`}>
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className={`object-cover transition duration-[1600ms] ease-out ${
              index === active ? "scale-100 opacity-100" : "scale-105 opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-950 via-teal-950/80 to-teal-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-950/60 via-transparent to-black/10" />
        <div className="absolute inset-0 ambient-grid opacity-25" />
      </div>

      <div className={`container-page relative z-10 flex ${minHeight} items-center py-20`}>
        {children}
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-7 left-0 right-0 z-20">
          <div className="container-page flex items-center gap-3">
            <div className="flex gap-2" aria-label="Hero slideshow controls">
              {slides.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  aria-label={`Show slide: ${slide.label}`}
                  aria-current={index === active}
                  onClick={() => setActive(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === active ? "w-10 bg-white" : "w-5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-white/70">
              {slides[active]?.label}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
