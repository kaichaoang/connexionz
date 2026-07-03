import { useState, useEffect, useCallback } from "react";
import { TIER_ORDER, MAX_MISTAKES } from "./theme";
import { shuffle, buildTiles, setKey, byTier } from "./utils/game";
import { useAchievements } from "./hooks/useAchievements";
import { useAuth } from "./hooks/useAuth";
import { usePuzzles } from "./hooks/usePuzzles";
import type { Tile, SolvedGroup, GameStatus, Tier } from "./types";

import Header from "./components/Header";
import Board from "./components/Board";
import MessageBar from "./components/MessageBar";
import Controls from "./components/Controls";
import EndCard from "./components/EndCard";
import AllSolvedCard from "./components/AllSolvedCard";
import AchievementsBanner from "./components/AchievementsBanner";
import AuthBar from "./components/AuthBar";
import PuzzleBar from "./components/PuzzleBar";
import AchievementToast from "./components/AchievementToast";

export default function App() {
  // Board state — reset whenever the active puzzle changes (see effect below)
  // or when the user replays via the replay counter.
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<SolvedGroup[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [replay, setReplay] = useState(0);

  const auth = useAuth();
  const puzzles = usePuzzles(auth.userId);
  const { definitions, unlocked, justUnlocked, unlock, dismissToast } =
    useAchievements(auth.userId);

  const { activeId, activePuzzle, entries, completions } = puzzles;

  const toastAchievement = justUnlocked
    ? definitions.find((a) => a.id === justUnlocked) ?? null
    : null;

  const flash = useCallback((text: string, ms = 1800): void => {
    setMessage(text);
    if (ms) setTimeout(() => setMessage((m) => (m === text ? null : m)), ms);
  }, []);

  // Build the board on every puzzle switch and on an explicit replay. An already
  // completed puzzle opens in a locked "review" state — every group revealed, no
  // tiles to play — so it can't be re-solved until it's reset.
  useEffect(() => {
    if (!activePuzzle) return;
    const done = activeId ? completions.get(activeId) : undefined;
    setSelected([]);
    setGuessed([]);
    setMessage(null);
    setShakeKey(0);

    if (done) {
      const revealed: SolvedGroup[] = TIER_ORDER.map((tier) => ({
        tier,
        label: activePuzzle[tier].label,
        words: activePuzzle[tier].words,
      }));
      setSolved(revealed);
      setTiles([]);
      setMistakes(done.mistakes);
      setStatus(done.won ? "won" : "lost");
    } else {
      setSolved([]);
      setTiles(buildTiles(activePuzzle));
      setMistakes(0);
      setStatus("playing");
    }
    // `completions` is intentionally not a dep: finishing the active puzzle
    // updates it, but the win/loss is already reflected on screen — we only
    // rebuild when the puzzle changes or a reset/replay bumps `replay`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePuzzle, replay]);

  // Clear the stored completion for this puzzle, then replay it fresh.
  const resetActive = useCallback((): void => {
    if (activeId) puzzles.resetPuzzle(activeId);
    setReplay((n) => n + 1);
  }, [activeId, puzzles]);

  // The next puzzle the user hasn't finished, wrapping around the list.
  const nextUnsolvedId = useCallback(
    (from: string): string => {
      const n = entries.length;
      const idx = entries.findIndex((e) => e.id === from);
      if (idx === -1) return from;
      for (let i = 1; i <= n; i++) {
        const cand = entries[(idx + i) % n];
        if (!completions.has(cand.id)) return cand.id;
      }
      return from;
    },
    [entries, completions]
  );

  // "Play from the top": clear every completion and start fresh at the first
  // puzzle (completed puzzles are otherwise locked, so this is a full restart).
  const replayFromTop = useCallback((): void => {
    puzzles.resetAll();
    const first = entries[0];
    if (first) puzzles.selectPuzzle(first.id);
    setReplay((n) => n + 1);
  }, [entries, puzzles]);

  const onTileClick = (word: string): void => {
    if (status !== "playing") return;
    setMessage(null);
    setSelected((sel) => {
      if (sel.includes(word)) return sel.filter((w) => w !== word);
      if (sel.length >= 4) return sel;
      return [...sel, word];
    });
  };

  const onSubmit = (): void => {
    if (selected.length !== 4 || status !== "playing") return;
    if (!activePuzzle || !activeId) return;
    const puzzle = activePuzzle;

    const key = setKey(selected);
    if (guessed.includes(key)) {
      flash("Already guessed");
      setShakeKey((k) => k + 1);
      return;
    }

    const chosen = tiles.filter((t) => selected.includes(t.word));
    const counts: Partial<Record<Tier, number>> = {};
    chosen.forEach((t) => (counts[t.tier] = (counts[t.tier] ?? 0) + 1));
    const winningTier = (Object.keys(counts) as Tier[]).find(
      (k) => counts[k] === 4
    );

    if (winningTier) {
      const group: SolvedGroup = {
        tier: winningTier,
        label: puzzle[winningTier].label,
        words: puzzle[winningTier].words,
      };
      const nextSolved = [...solved, group].sort(byTier);
      setSolved(nextSolved);
      setTiles((t) => t.filter((x) => !selected.includes(x.word)));
      setSelected([]);

      // Puzzle complete?
      if (nextSolved.length === 4) {
        setStatus("won");

        // Achievement: flawless run (no mistakes on this puzzle).
        if (mistakes === 0) unlock("flawless");

        // Achievements tied to specific puzzles.
        if (activeId === "meow-meow") unlock("meow");
        if (activeId === "the-first-one") unlock("you_remembered");

        // Record the completion, and check for the full-clear achievement.
        puzzles.markCompleted({ id: activeId, won: true, mistakes });
        const clearsAll = entries.every(
          (e) => e.id === activeId || completions.has(e.id)
        );
        if (clearsAll) unlock("completionist");
      }
    } else {
      setGuessed((g) => [...g, key]);
      const near = Math.max(...Object.values(counts)) === 3;
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      setShakeKey((k) => k + 1);

      if (nextMistakes >= MAX_MISTAKES) {
        // Reveal every remaining group, then end.
        const remainingTiers = TIER_ORDER.filter(
          (tier) => !solved.some((s) => s.tier === tier)
        );
        const revealed: SolvedGroup[] = remainingTiers.map((tier) => ({
          tier,
          label: puzzle[tier].label,
          words: puzzle[tier].words,
        }));
        setSolved([...solved, ...revealed].sort(byTier));
        setTiles([]);
        setSelected([]);
        setStatus("lost");
        unlock("back_to_it"); // Achievement: failed a puzzle.
        puzzles.markCompleted({
          id: activeId,
          won: false,
          mistakes: nextMistakes,
        });
      } else if (near) {
        flash("So close — one away");
      } else {
        flash("Not quite");
      }
    }
  };

  // Wait for the puzzle list to resolve before drawing a board.
  if (!puzzles.ready || !activePuzzle) {
    return (
      <div className="root">
        <div className="layout">
          <main className="shell">
            <Header />
            <p className="instructions">Loading puzzles…</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="root">
      <div className="layout">
        <main className="shell">
          <Header />

          <p className="instructions">
            Group the sixteen words into four hidden sets of four.
          </p>

          <AuthBar auth={auth} />

          <Board
            tiles={tiles}
            solved={solved}
            selected={selected}
            shakeKey={shakeKey}
            onTileClick={onTileClick}
          />

          <MessageBar message={message} />

          {status === "playing" ? (
            <Controls
              mistakes={mistakes}
              selectedCount={selected.length}
              onShuffle={() => setTiles((t) => shuffle(t))}
              onDeselect={() => setSelected([])}
              onSubmit={onSubmit}
            />
          ) : puzzles.allCompleted ? (
            <AllSolvedCard onReplay={replayFromTop} />
          ) : (
            <EndCard
              status={status}
              mistakes={mistakes}
              onNext={() =>
                activeId && puzzles.selectPuzzle(nextUnsolvedId(activeId))
              }
            />
          )}

          <PuzzleBar
            entries={entries}
            activeId={activeId}
            completions={completions}
            onSelect={puzzles.selectPuzzle}
            onReset={resetActive}
          />
        </main>

        <AchievementsBanner definitions={definitions} unlocked={unlocked} />
      </div>

      <AchievementToast achievement={toastAchievement} onDismiss={dismissToast} />
    </div>
  );
}
