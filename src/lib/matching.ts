import type { FamilyProfile, ProfessionalProfile } from "./types";
import { LEVEL_LABEL } from "./tags";

const LEVEL_WEIGHT: Record<string, number> = { TRAINED: 0.5, ONE_PLUS: 0.75, FIVE_PLUS: 1 };

export interface MatchResult {
  professional: ProfessionalProfile;
  score: number;
  matchedTags: { key: string; level: string }[];
  sameLocation: boolean;
}

export function scoreMatch(family: FamilyProfile, pro: ProfessionalProfile): MatchResult {
  const needed = new Set(family.conditions);
  const matchedTags = pro.experiences.filter((e) => needed.has(e.tagKey));

  const tagCoverage = needed.size > 0 ? matchedTags.length / needed.size : 0;
  const tagQuality =
    matchedTags.length > 0
      ? matchedTags.reduce((sum, e) => sum + LEVEL_WEIGHT[e.level], 0) / matchedTags.length
      : 0;

  const sameLocation = pro.location.toLowerCase() === family.location.toLowerCase();
  const proximityScore = sameLocation ? 1 : 0.35;

  const verifiedBoost =
    pro.verificationStatus === "VERIFIED" ? 1 : pro.verificationStatus === "IN_REVIEW" ? 0.5 : 0.1;

  const ratingScore = pro.ratingCount > 0 ? pro.ratingAvg / 5 : 0.6;

  const budgetFit = pro.hourlyRate <= family.budgetMax ? 1 : pro.hourlyRate <= family.budgetMax * 1.15 ? 0.5 : 0.1;

  const score =
    tagCoverage * 40 +
    tagQuality * 20 +
    proximityScore * 15 +
    verifiedBoost * 15 +
    ratingScore * 5 +
    budgetFit * 5;

  return {
    professional: pro,
    score: Math.round(score),
    matchedTags: matchedTags.map((m) => ({ key: m.tagKey, level: LEVEL_LABEL[m.level] })),
    sameLocation,
  };
}

export function rankMatches(family: FamilyProfile, pros: ProfessionalProfile[]): MatchResult[] {
  return pros
    .map((p) => scoreMatch(family, p))
    .sort((a, b) => b.score - a.score);
}
