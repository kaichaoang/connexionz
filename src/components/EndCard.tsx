import type { GameStatus } from "../types";

interface EndCardProps {
  status: GameStatus;
  mistakes: number;
  onNext: () => void;
}

export default function EndCard({ status, mistakes, onNext }: EndCardProps) {
  const won = status === "won";

  const subtitle = won
    ? mistakes === 0
      ? "A flawless run. Not one wrong turn."
      : `Cracked it with ${mistakes} mistake${mistakes > 1 ? "s" : ""}.`
    : "The answers are revealed above.";

  return (
    <div className="card">
      <div className="card-title">{won ? "Solved" : "Out of guesses"}</div>
      <div className="card-sub">{subtitle}</div>
      <div className="controls">
        <button className="btn solid" onClick={onNext}>
          Next puzzle
        </button>
      </div>
      <div className="card-hint">Use Reset below to play this puzzle again.</div>
    </div>
  );
}
