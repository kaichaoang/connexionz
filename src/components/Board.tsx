import SolvedBand from "./SolvedBand";
import TileView from "./Tile";
import type { Tile, SolvedGroup } from "../types";

interface BoardProps {
  tiles: Tile[];
  solved: SolvedGroup[];
  selected: string[];
  shakeKey: number;
  onTileClick: (word: string) => void;
}

export default function Board({
  tiles,
  solved,
  selected,
  shakeKey,
  onTileClick,
}: BoardProps) {
  return (
    <div className="board">
      {solved.map((group, i) => (
        <SolvedBand key={group.tier} group={group} delay={i * 60} />
      ))}

      {tiles.length > 0 && (
        <div className={"grid" + (shakeKey ? " shake" : "")} key={"grid-" + shakeKey}>
          {tiles.map((tile) => (
            <TileView
              key={tile.word}
              word={tile.word}
              selected={selected.includes(tile.word)}
              onClick={() => onTileClick(tile.word)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
