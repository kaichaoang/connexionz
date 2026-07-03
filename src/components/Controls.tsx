import { MAX_MISTAKES } from "../theme";

interface ControlsProps {
  mistakes: number;
  selectedCount: number;
  onShuffle: () => void;
  onDeselect: () => void;
  onSubmit: () => void;
}

export default function Controls({
  mistakes,
  selectedCount,
  onShuffle,
  onDeselect,
  onSubmit,
}: ControlsProps) {
  const remaining = MAX_MISTAKES - mistakes;

  return (
    <>
      <div className="mistakes">
        <span className="mistakes-label">Mistakes left</span>
        <div className="dots">
          {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
            <span key={i} className={"dot" + (i < remaining ? " full" : "")} />
          ))}
        </div>
      </div>

      <div className="controls">
        <button className="btn ghost" onClick={onShuffle}>
          Shuffle
        </button>
        <button className="btn ghost" onClick={onDeselect} disabled={!selectedCount}>
          Deselect all
        </button>
        <button className="btn solid" onClick={onSubmit} disabled={selectedCount !== 4}>
          Submit
        </button>
      </div>
    </>
  );
}
