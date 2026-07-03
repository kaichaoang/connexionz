interface AllSolvedCardProps {
  onReplay: () => void;
}

export default function AllSolvedCard({ onReplay }: AllSolvedCardProps) {
  return (
    <div className="card allsolved">
      <div className="allsolved-glyph" aria-hidden="true">
        {"\u2726"}
      </div>
      <div className="card-title">All puzzles solved!</div>
      <div className="card-sub allsolved-note">Congrats love &lt;3</div>
      <div className="controls">
        <button className="btn solid" onClick={onReplay}>
          Play from the top
        </button>
      </div>
    </div>
  );
}
