import type { Achievement } from "../types";

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export default function AchievementToast({
  achievement,
  onDismiss,
}: AchievementToastProps) {
  if (!achievement) return null;

  return (
    <button className="toast" onClick={onDismiss} aria-live="assertive">
      <span className="toast-glyph">{achievement.glyph}</span>
      <span className="toast-text">
        <span className="toast-kicker">Achievement unlocked</span>
        <span className="toast-title">{achievement.title}</span>
      </span>
    </button>
  );
}
