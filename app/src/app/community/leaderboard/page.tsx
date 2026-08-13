"use client";

import { leaderboardSeed, levelNames } from "@/data/leaderboard";

const pointRules = [
  { name: "Scam Submitted", points: "+50" },
  { name: "High Risk Scam", points: "+150" },
  { name: "Helpful Vote", points: "+5" },
  { name: "Useful Comment", points: "+10" },
];

const badges = ["First Report", "Top Contributor", "Expert Reviewer", "100 Upvotes", "Family Protector"];

export default function CommunityLeaderboardPage() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>Recognition</div>
        <h1 style={{ margin: 0, fontSize: 32 }}>Leaderboard</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {leaderboardSeed.map((user, index) => (
          <div key={user.id} style={{ background: "#fff", borderRadius: 22, padding: 18, border: "1px solid rgba(148,163,184,0.18)", display: "grid", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#64748b" }}>#{index + 1}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", display: "grid", placeItems: "center", fontWeight: 800, color: "#1d4ed8" }}>{user.avatar}</div>
                <div>
                  <div style={{ fontWeight: 800 }}>{user.username}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{levelNames[user.level - 1]}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>{user.points}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>Points</div>
              </div>
              <div style={{ padding: "8px 12px", borderRadius: 999, background: "#eff6ff", color: "#1d4ed8", fontWeight: 800, fontSize: 12 }}>
                Level {user.level}
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {user.badges.map((badge) => (
                <span key={badge} style={{ padding: "6px 10px", borderRadius: 999, background: "#f8fafc", color: "#334155", border: "1px solid rgba(148,163,184,0.2)", fontSize: 11, fontWeight: 700 }}>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
        <div style={{ background: "#fff", borderRadius: 22, padding: 22, border: "1px solid rgba(148,163,184,0.18)" }}>
          <h2 style={{ margin: "0 0 14px", fontSize: 20 }}>Point Rules</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {pointRules.map((rule) => (
              <div key={rule.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 12, background: "#f8fafc" }}>
                <span style={{ fontWeight: 600 }}>{rule.name}</span>
                <strong style={{ color: "#1d4ed8" }}>{rule.points}</strong>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 22, padding: 22, border: "1px solid rgba(148,163,184,0.18)" }}>
          <h2 style={{ margin: "0 0 14px", fontSize: 20 }}>Badges</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {badges.map((badge) => (
              <span key={badge} style={{ padding: "8px 12px", borderRadius: 999, background: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: 12 }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
