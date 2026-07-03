import { TIERS } from "../theme";
import type { SolvedGroup } from "../types";

interface SolvedBandProps {
  group: SolvedGroup;
  delay?: number;
}

export default function SolvedBand({ group, delay = 0 }: SolvedBandProps) {
  const tier = TIERS[group.tier];
  return (
    <div
      className="band"
      style={{
        background: tier.color,
        color: tier.ink,
        animationDelay: delay + "ms",
      }}
    >
      <div className="band-label">{group.label.toUpperCase()}</div>
      <div className="band-words">{group.words.join(" \u00B7 ")}</div>
    </div>
  );
}
