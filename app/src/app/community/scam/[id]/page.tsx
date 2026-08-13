"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquareText, ShieldAlert, Star, User } from "lucide-react";
import { useParams } from "next/navigation";
import { scamSeedData } from "@/data/scams";
import { mockComments } from "@/data/comments";
import { getCommunityComments, setCommunityComments } from "@/lib/community";

export default function ScamDetailPage() {
  const params = useParams<{ id: string }>();
  const scamId = params?.id ?? "s1";
  const scam = scamSeedData.find((item) => item.id === scamId) ?? scamSeedData[0];

  const [commentDraft, setCommentDraft] = useState("");
  const [comments, setComments] = useState<Array<{ user: string; text: string; date: string }>>([]);

  useEffect(() => {
    const stored = getCommunityComments();
    const list = stored[scam.id] ?? [];
    setComments([...mockComments.filter((item) => item.scamId === scam.id).map((item) => ({ user: item.user, text: item.comment, date: item.date })), ...list]);
  }, [scam.id]);

  const addComment = () => {
    if (!commentDraft.trim()) return;
    const next = { user: "You", text: commentDraft.trim(), date: new Date().toISOString() };
    const existing = getCommunityComments();
    const base = existing[scam.id] ?? [];
    const updated = { ...existing, [scam.id]: [...base, next] };
    setCommunityComments(updated);
    setComments((prev) => [...prev, next]);
    setCommentDraft("");
  };

  const tacticText = useMemo(
    () => `This scam uses ${scam.tags.slice(0, 2).join(" and ")} to pressure victims into acting quickly.`,
    [scam.tags],
  );

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div style={{ background: "#fff", borderRadius: 28, overflow: "hidden", border: "1px solid rgba(148,163,184,0.18)" }}>
        <div style={{ height: 180, background: scam.image }} />
        <div style={{ padding: 22, display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b" }}>{scam.category}</div>
              <h1 style={{ margin: "8px 0 0", fontSize: 36, lineHeight: 1.1 }}>{scam.title}</h1>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span style={{ ...pillStyle, background: "#e0f2fe", color: "#0369a1" }}>Danger: {scam.dangerLevel}</span>
              <span style={{ ...pillStyle, background: "#fef3c7", color: "#92400e" }}>Convincing: {scam.convincingScore}/10</span>
            </div>
          </div>

          <div style={{ color: "#475569", lineHeight: 1.7, fontSize: 16 }}>{scam.description}</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
            <div style={statCardStyle}><div style={{ color: "#64748b" }}>Platform</div><strong>{scam.platform}</strong></div>
            <div style={statCardStyle}><div style={{ color: "#64748b" }}>Date Added</div><strong>{new Date(scam.dateAdded).toLocaleDateString()}</strong></div>
            <div style={statCardStyle}><div style={{ color: "#64748b" }}>Helpful Count</div><strong>{scam.helpfulCount}</strong></div>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 24, padding: 22, border: "1px solid rgba(148,163,184,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <ShieldAlert size={22} color="#1d4ed8" />
          <h2 style={{ margin: 0, fontSize: 24 }}>Scam Tactics</h2>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
          {scam.tags.map((tag) => (
            <span key={tag} style={{ ...pillStyle, background: "#eff6ff", color: "#1d4ed8" }}>{tag}</span>
          ))}
        </div>

        <p style={{ margin: 0, color: "#334155", lineHeight: 1.7 }}>{tacticText}</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 24, padding: 22, border: "1px solid rgba(148,163,184,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <MessageSquareText size={22} color="#0f172a" />
          <h2 style={{ margin: 0, fontSize: 24 }}>Community Comments</h2>
        </div>

        <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
          {comments.map((item, index) => (
            <div key={`${item.user}-${index}`} style={{ border: "1px solid rgba(148,163,184,0.16)", background: "#f8fafc", borderRadius: 16, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 999, background: "#dbeafe", display: "grid", placeItems: "center", color: "#1d4ed8", fontWeight: 800 }}>
                  {item.user.slice(0, 1)}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.user}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{new Date(item.date).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{ color: "#334155", lineHeight: 1.6 }}>{item.text}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <textarea
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value)}
            placeholder="Add a comment"
            rows={4}
            style={{ border: "1px solid rgba(148,163,184,0.2)", borderRadius: 16, padding: 14, fontSize: 15, resize: "vertical" }}
          />
          <button onClick={addComment} style={{ justifySelf: "flex-end", background: "#1d4ed8", color: "#fff", border: 0, borderRadius: 12, padding: "12px 18px", fontWeight: 800, cursor: "pointer" }}>
            Add Comment
          </button>
        </div>
      </div>
    </div>
  );
}

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "7px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
};

const statCardStyle: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid rgba(148,163,184,0.16)",
  borderRadius: 16,
  padding: 14,
  display: "grid",
  gap: 4,
};
