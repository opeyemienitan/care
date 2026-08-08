import type { FundingSource } from "./types";

export const FUNDING_SOURCES: { value: FundingSource; label: string; hint: string }[] = [
  {
    value: "SELF_FUNDED",
    label: "Self-funded",
    hint: "Paying privately for care.",
  },
  {
    value: "LOCAL_AUTHORITY_DIRECT_PAYMENT",
    label: "Local authority direct payment",
    hint: "Council-assessed budget paid directly to you to arrange your own care.",
  },
  {
    value: "NHS_CHC_PHB",
    label: "NHS Continuing Healthcare / Personal Health Budget",
    hint: "Fully NHS-funded care, or an NHS personal health budget you manage yourself.",
  },
  {
    value: "FAMILY_OTHER",
    label: "Family contribution / other",
    hint: "Funded by family, a trust, insurance, or another arrangement.",
  },
];

export const FUNDING_LABEL: Record<FundingSource, string> = Object.fromEntries(
  FUNDING_SOURCES.map((f) => [f.value, f.label])
) as Record<FundingSource, string>;
