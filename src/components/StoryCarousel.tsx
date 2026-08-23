"use client";

import { useEffect, useState } from "react";

export type CareStory = {
  eyebrow: string;
  title: string;
  body: string;
  detail: string;
};

export default function StoryCarousel({ stories }: { stories: CareStory[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (stories.length < 2) return;
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % stories.length);
    }, 7500);
    return () => window.clearInterval(interval);
  }, [stories.length]);

  const story = stories[active];
  if (!story) return null;

  const move = (direction: number) => {
    setActive((current) => (current + direction + stories.length) % stories.length);
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-teal-950 p-8 text-white shadow-2xl sm:p-12">
      <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-coral-500/20 blur-3xl" />
      <div className="absolute -bottom-24 left-20 h-64 w-64 rounded-full bg-teal-300/20 blur-3xl" />
      <div className="relative max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-300">{story.eyebrow}</p>
        <h3 className="mt-4 text-2xl font-semibold leading-tight sm:text-4xl">{story.title}</h3>
        <p className="mt-5 text-base leading-relaxed text-white/75 sm:text-lg">{story.body}</p>
        <p className="mt-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80">
          {story.detail}
        </p>
      </div>

      <div className="relative mt-10 flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {stories.map((item, index) => (
            <button
              key={item.title}
              type="button"
              aria-label={`Show care journey ${index + 1}`}
              onClick={() => setActive(index)}
              className={`h-2 rounded-full transition-all ${index === active ? "w-10 bg-coral-300" : "w-2 bg-white/30 hover:bg-white/60"}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous care journey"
            onClick={() => move(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-lg transition hover:bg-white/20"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next care journey"
            onClick={() => move(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-lg transition hover:bg-white/20"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
