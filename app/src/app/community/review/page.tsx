"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, Flag, ThumbsDown, ThumbsUp, Search } from "lucide-react";
import { scamSeedData } from "@/data/scams";
import { getHelpfulVotes, getSavedScamIds, setHelpfulVotes, setSavedScamIds } from "@/lib/community";

const filterOptions = ["All", "Family", "Bank", "Investment", "Job", "Prize", "Newest", "Most Helpful", "Most Saved"];

const categoryMap: Record<string, string> = {
  Family: "Family Scam",
  Bank: "Bank Scam",
  Investment: "Investment Scam",
  Job: "Job Scam",
  Prize: "Prize Scam",
};

export default function CommunityReviewPage() {
  const [filter, setFilter] = useState("All");
  const [savedScams, setSavedScams] = useState<string[]>([]);
  const [helpfulVotes, setHelpfulVotesState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSavedScams(getSavedScamIds());
    setHelpfulVotesState(getHelpfulVotes());
  }, []);

  const filteredScams = useMemo(() => {
    let items = [...scamSeedData];

    if (filter === "All") {
      items = items;
    } else if (categoryMap[filter]) {
      items = items.filter((scam) => scam.category === categoryMap[filter]);
    } else if (filter === "Newest") {
      items = [...items].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    } else if (filter === "Most Helpful") {
      items = [...items].sort((a, b) => b.helpfulCount - a.helpfulCount);
    } else if (filter === "Most Saved") {
      items = [...items].sort((a, b) => b.savedCount - a.savedCount);
    }

    return items;
  }, [filter]);

  const toggleSave = (id: string) => {
    const next = new Set(savedScams);
    if (next.has(id)) next.delete(id); else next.add(id);
    const nextArray = [...next];
    setSavedScams(nextArray);
    setSavedScamIds(nextArray);
  };

  const toggleHelpful = (id: string) => {
    const current = helpfulVotes[id];
    const nextVotes = { ...helpfulVotes, [id]: !current };
    setHelpfulVotesState(nextVotes);
    setHelpfulVotes(nextVotes);
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: "#e0f2fe", display: "grid", placeItems: "center", color: "#0369a1" }}>
            <Search size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#0369a1" }}>Community feed</div>
            <h1 style={{ margin: 0, fontSize: 30 }}>Review Hub</h1>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {filterOptions.map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              border: filter === option ? "1px solid #1d4ed8" : "1px solid rgba(148,163,184,0.25)",
              background: filter === option ? "#dbeafe" : "#fff",
              color: filter === option ? "#1d4ed8" : "#334155",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {option}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
        {filteredScams.map((scam) => {
          const isSaved = savedScams.includes(scam.id);
          const isHelpful = Boolean(helpfulVotes[scam.id]);
          const helperScore = scam.helpfulCount + (isHelpful ? 1 : 0);

          return (
            <div key={scam.id} style={{ background: "#fff", borderRadius: 22, overflow: "hidden", border: "1px solid rgba(148,163,184,0.2)" }}>
              <div style={{ height: 120, background: scam.image }} />
              <div style={{ padding: 18, display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>{scam.category}</div>
                  <span
                    style={{
                      background: scam.dangerLevel === "Critical" ? "#fee2e2" : scam.dangerLevel === "High" ? "#fef3c7" : "#ecfdf5",
                      color: scam.dangerLevel === "Critical" ? "#b91c1c" : scam.dangerLevel === "High" ? "#92400e" : "#166534",
                      padding: "6px 10px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {scam.dangerLevel}
                  </span>
                </div>

                <div style={{ fontSize: 20, fontWeight: 800 }}>{scam.title}</div>
                <div style={{ color: "#475569", fontSize: 14 }}>{scam.preview}</div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#64748b", fontSize: 12 }}>
                  <span>{new Date(scam.dateAdded).toLocaleDateString()}</span>
                  <span>{helperScore} helpful</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button onClick={() => toggleHelpful(scam.id)} style={actionButton(isHelpful ? "#dcfce7" : "#f8fafc", "#0f172a")}>
                    <ThumbsUp size={15} />
                    Helpful
                  </button>
                  <button style={actionButton("#f8fafc", "#0f172a")}>
                    <ThumbsDown size={15} />
                    Not Helpful
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button onClick={() => toggleSave(scam.id)} style={actionButton(isSaved ? "#dbeafe" : "#f8fafc", "#1d4ed8")}>
                    <Bookmark size={15} />
                    {isSaved ? "Saved" : "Save"}
                  </button>
                  <Link href={`/community/scam/${scam.id}`} style={{ ...actionButton("#eff6ff", "#1d4ed8"), textDecoration: "none", justifyContent: "center" }}>
                    <Flag size={15} />
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function actionButton(background: string, color: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.18)",
    background,
    color,
    fontWeight: 700,
    padding: "11px 12px",
    cursor: "pointer",
  };
}
