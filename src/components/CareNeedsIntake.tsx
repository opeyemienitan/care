"use client";

import { useState, useTransition } from "react";
import { suggestTagsAction } from "@/app/actions";
import { EXPERIENCE_TAGS } from "@/lib/tags";
import { inputClass } from "./ui";

export default function CareNeedsIntake({ initialChecked = [] as string[] }) {
  const [description, setDescription] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set(initialChecked));
  const [pending, startTransition] = useTransition();
  const [suggested, setSuggested] = useState<string[]>([]);

  function suggest() {
    startTransition(async () => {
      const { tagKeys } = await suggestTagsAction(description);
      setSuggested(tagKeys);
      setChecked((prev) => new Set([...prev, ...tagKeys]));
    });
  }

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">
        Describe what&apos;s going on, in your own words
        <span className="block text-xs font-normal text-ink/50 mt-0.5">
          Optional — we&apos;ll suggest which specialisms apply below. You can always adjust the selection yourself.
        </span>
      </label>
      <textarea
        className={inputClass}
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g. Mum was recently discharged after a stroke and needs help with mobility and her medication twice a day..."
      />
      <button
        type="button"
        onClick={suggest}
        disabled={pending || description.trim().length < 8}
        className="mt-2 text-sm font-medium text-teal-700 disabled:text-ink/30"
      >
        {pending ? "Thinking…" : "✨ Suggest specialisms from this description"}
      </button>

      <div className="mt-5">
        <span className="block text-sm font-medium text-ink mb-2">
          Which needs apply? Select all that are relevant.
        </span>
        <div className="grid sm:grid-cols-2 gap-2">
          {EXPERIENCE_TAGS.map((tag) => (
            <label
              key={tag.key}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer ${
                suggested.includes(tag.key) ? "border-teal-300 bg-teal-50" : "border-sand-200 hover:border-teal-300"
              }`}
            >
              <input
                type="checkbox"
                name="conditions"
                value={tag.key}
                checked={checked.has(tag.key)}
                onChange={() => toggle(tag.key)}
                className="accent-teal-600"
              />
              {tag.label}
              {suggested.includes(tag.key) && <span className="ml-auto text-xs text-teal-600">suggested</span>}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
