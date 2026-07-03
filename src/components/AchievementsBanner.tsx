import type { Achievement, AchievementId } from "../types";

// Side rail listing every achievement slot. Unlocked ones reveal their badge,
// title, and how you earned them; locked ones stay a "?" mystery so players know
// easter eggs remain. Definitions come from the database (via useAchievements).

interface AchievementsBannerProps {
  definitions: Achievement[];
  unlocked: Set<AchievementId>;
}

export default function AchievementsBanner({
  definitions,
  unlocked,
}: AchievementsBannerProps) {
  const earned = definitions.filter((a) => unlocked.has(a.id)).length;

  return (
    <aside className="ach-rail" aria-label="Achievements">
      <div className="ach-head">
        <span className="ach-title">Achievements</span>
        <span className="ach-count">
          {earned} / {definitions.length}
        </span>
      </div>
      <ul className="ach-list">
        {definitions.map((a) => {
          const has = unlocked.has(a.id);
          return (
            <li
              key={a.id}
              className={"ach-item" + (has ? " earned" : " locked")}
            >
              <span className="ach-glyph">{has ? a.glyph : "?"}</span>
              <span className="ach-text">
                <span className="ach-name">{has ? a.title : "Hidden"}</span>
                <span className="ach-desc">
                  {has ? a.description : "Locked — find the trigger."}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
