/**
 * AI layer for Marram Care.
 *
 * Design principle: AI should reduce cognitive load for stressed families and
 * admins, never add friction. Every function here degrades gracefully to a
 * deterministic, fully-functional fallback when no ANTHROPIC_API_KEY is set —
 * the app never blocks, hangs, or breaks waiting on an AI call, and no key is
 * required to run the app end to end.
 *
 * Set ANTHROPIC_API_KEY to enable real model calls (uses a small, fast model
 * suited to short classification/extraction tasks, not open-ended chat).
 */
import { EXPERIENCE_TAGS } from "./tags";

const MODEL = "claude-haiku-4-5-20251001";

function hasApiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

async function callClaude(system: string, user: string): Promise<string | null> {
  if (!hasApiKey()) return null;
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system,
      messages: [{ role: "user", content: user }],
    });
    const block = res.content[0];
    return block && block.type === "text" ? block.text : null;
  } catch {
    // Network blocked, no key, rate limited, or malformed response — fall back silently.
    return null;
  }
}

// ---------- 1. Natural-language care-need intake ----------

const TAG_KEYWORDS: Record<string, string[]> = {
  complex_health: ["complex", "medical", "tube", "ventilator", "hospital"],
  peg_feeding: ["peg", "feeding tube", "tube fed", "gastrostomy"],
  tracheostomy: ["tracheostomy", "trachy", "ventilator", "breathing tube"],
  medication: ["medication", "meds", "tablets", "insulin", "injections"],
  palliative: ["palliative", "end of life", "hospice", "terminal"],
  paediatric_complex: ["child", "son", "daughter", "baby", "paediatric", "pediatric"],
  learning_disability: ["learning disability", "learning difficulties", "down syndrome", "downs syndrome"],
  autism: ["autism", "autistic", "asd", "sensory"],
  mental_health: ["mental health", "depression", "anxiety", "psychosis", "bipolar"],
  physical_disability: ["wheelchair", "mobility", "physical disability", "paralysed", "paralyzed", "stroke"],
  behavioural_support: ["challenging behaviour", "challenging behavior", "aggressive", "behaviour support", "behavior support"],
  community_care: ["companionship", "shopping", "housework", "general help", "everyday"],
};

export async function suggestTagsFromDescription(
  description: string
): Promise<{ tagKeys: string[]; source: "ai" | "keyword" }> {
  const aiText = await callClaude(
    `You help match UK families to specialist care professionals. Given a free-text description of a ` +
      `care need, return ONLY a JSON array of matching tag keys from this exact list, most relevant first, ` +
      `max 5: ${EXPERIENCE_TAGS.map((t) => t.key).join(", ")}. No prose, no markdown, just the JSON array.`,
    description
  );
  if (aiText) {
    try {
      const parsed = JSON.parse(aiText.trim());
      const valid = EXPERIENCE_TAGS.map((t) => t.key);
      if (Array.isArray(parsed)) {
        const tagKeys = parsed.filter((k) => valid.includes(k));
        if (tagKeys.length > 0) return { tagKeys, source: "ai" };
      }
    } catch {
      // fall through to keyword matching
    }
  }

  const lower = description.toLowerCase();
  const tagKeys = Object.entries(TAG_KEYWORDS)
    .filter(([, keywords]) => keywords.some((k) => lower.includes(k)))
    .map(([key]) => key);
  return { tagKeys, source: "keyword" };
}

// ---------- 2. Match narrative ----------

export async function generateMatchNarrative(
  familyConditions: string[],
  professionalHeadline: string,
  professionalBio: string,
  matchedTagLabels: string[]
): Promise<string | null> {
  if (matchedTagLabels.length === 0) return null;
  const aiText = await callClaude(
    "You write a single warm, specific, one-sentence explanation (max 30 words) of why a care professional " +
      "is a good match for a family's needs. No greeting, no markdown, just the sentence. UK English.",
    `Family needs: ${familyConditions.join(", ")}\nProfessional: ${professionalHeadline}\nBio: ${professionalBio}\nShared specialisms: ${matchedTagLabels.join(", ")}`
  );
  return aiText?.trim() || null;
}

// ---------- 3. Safeguarding triage (invisible, admin-only) ----------

const URGENT_KEYWORDS = ["abuse", "unsafe", "hurt", "danger", "assault", "neglect", "injury", "police", "hospital", "unconscious"];

export async function triageSafeguardingReport(
  details: string,
  category: string
): Promise<{ severity: "URGENT" | "HIGH" | "MEDIUM" | "LOW"; summary: string }> {
  const aiText = await callClaude(
    'You triage safeguarding reports for a UK care marketplace admin team. Given a report, respond with ONLY ' +
      'compact JSON: {"severity": "URGENT"|"HIGH"|"MEDIUM"|"LOW", "summary": "one-line summary under 15 words"}. ' +
      "URGENT = immediate risk to life/safety. No prose outside the JSON.",
    `Category: ${category}\nDetails: ${details}`
  );
  if (aiText) {
    try {
      const parsed = JSON.parse(aiText.trim());
      if (parsed.severity && parsed.summary) {
        return { severity: parsed.severity, summary: parsed.summary };
      }
    } catch {
      // fall through
    }
  }

  const lower = details.toLowerCase();
  const severity = URGENT_KEYWORDS.some((k) => lower.includes(k)) ? "HIGH" : "MEDIUM";
  const summary = details.length > 70 ? `${details.slice(0, 70)}…` : details;
  return { severity, summary };
}

export function aiEnabled() {
  return hasApiKey();
}
