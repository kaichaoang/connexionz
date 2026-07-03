import type { Tier, TierInfo } from "./types";

// Central design tokens. Colors are also mirrored as CSS variables in
// styles/global.css — keep the two in sync if you change the palette.

export const TIERS: Record<Tier, TierInfo> = {
  yellow: { color: "#E4B84A", ink: "#3A2E10", name: "Straightforward" },
  green: { color: "#8FB05A", ink: "#22300F", name: "Steady" },
  blue: { color: "#6E92D6", ink: "#122038", name: "Tricky" },
  purple: { color: "#A96FC4", ink: "#2E1338", name: "Devious" },
};

// Difficulty order, easiest first. Drives band sorting and puzzle layout.
export const TIER_ORDER: Tier[] = ["yellow", "green", "blue", "purple"];

export const MAX_MISTAKES = 4;
