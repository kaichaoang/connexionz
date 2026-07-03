interface TileProps {
  word: string;
  selected: boolean;
  onClick: () => void;
}

export default function Tile({ word, selected, onClick }: TileProps) {
  return (
    <button
      className={"tile" + (selected ? " sel" : "")}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="tile-word">{word}</span>
    </button>
  );
}
