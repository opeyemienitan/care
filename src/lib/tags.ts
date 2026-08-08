import type { ExperienceTag } from "./types";

export const EXPERIENCE_TAGS: ExperienceTag[] = [
  { key: "complex_health", label: "Complex healthcare needs", category: "Clinical" },
  { key: "peg_feeding", label: "PEG feeding", category: "Clinical" },
  { key: "tracheostomy", label: "Tracheostomy / ventilator care", category: "Clinical" },
  { key: "medication", label: "Medication administration", category: "Clinical" },
  { key: "palliative", label: "Palliative & end-of-life care", category: "Clinical" },
  { key: "paediatric_complex", label: "Paediatric complex care", category: "Clinical" },
  { key: "learning_disability", label: "Learning disability support", category: "Support" },
  { key: "autism", label: "Autism support", category: "Support" },
  { key: "mental_health", label: "Mental health support", category: "Support" },
  { key: "physical_disability", label: "Physical disability / mobility support", category: "Support" },
  { key: "behavioural_support", label: "Challenging behaviour / PBS", category: "Support" },
  { key: "community_care", label: "Community / domiciliary care", category: "Support" },
];

export const LEVEL_LABEL: Record<string, string> = {
  TRAINED: "Trained",
  ONE_PLUS: "1+ years hands-on",
  FIVE_PLUS: "5+ years hands-on",
};
