import type { PuzzleEntry, PuzzleCompletion } from "../types";

interface PuzzleBarProps {
  entries: PuzzleEntry[]; // in added order
  activeId: string | null;
  completions: Map<string, PuzzleCompletion>;
  onSelect: (id: string) => void;
  onReset: () => void;
}

export default function PuzzleBar({
  entries,
  activeId,
  completions,
  onSelect,
  onReset,
}: PuzzleBarProps) {
  if (entries.length === 0) return null;

  const activeDone = activeId ? completions.has(activeId) : false;

  return (
    <div className="puzzlebar">
      <label className="puzzlebar-label" htmlFor="puzzle-select">
        Puzzle
      </label>
      <select
        id="puzzle-select"
        className="puzzlebar-select"
        value={activeId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
      >
        {entries.map((e) => (
          <option key={e.id} value={e.id}>
            {completions.has(e.id) ? `✓ ${e.title}` : e.title}
          </option>
        ))}
      </select>

      {activeDone ? (
        <button className="puzzlebar-reset" onClick={onReset}>
          Reset
        </button>
      ) : null}
    </div>
  );
}
