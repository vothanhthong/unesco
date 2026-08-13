"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Shield, TrendingUp, Users, BookmarkCheck } from "lucide-react";
import { scamSeedData } from "@/data/scams";
import { readStorageJSON } from "@/lib/community";

const statsDefault = {
  reports: 245,
  reviews: 1024,
  saved: 380,
  contributors: 56,
};

export default function CommunityHomePage() {
  const [stats, setStats] = useState(statsDefault);

  useEffect(() => {
    const storedReports = readStorageJSON<Array<Record<string, unknown>>>("community_reports", []);
    const savedScams = readStorageJSON<string[]>("community_saved_scams", []);
    setStats({
      reports: 245 + storedReports.length,
      reviews: 1024 + Math.max(0, storedReports.length * 3),
      saved: 380 + savedScams.length,
      contributors: 56 + Math.min(12, Math.max(0, storedReports.length)),
    });
  }, []);

  const trending = useMemo(
    () => [
      { ...scamSeedData[0], label: "Most Viewed" },
      { ...scamSeedData[3], label: "Most Saved" },
      { ...scamSeedData[6], label: "Most Discussed" },
    ],
    [],
  );

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <section
        style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 45%, #f8fafc 100%)",
          border: "1px solid rgba(59,130,246,.12)",
          borderRadius: 28,
          padding: "28px 20px",
          display: "grid",
          gap: 22,
          boxShadow: "0 12px 35px rgba(37,99,235,0.08)",
        }}
      >
        <div style={{ display: "grid", gap: 14 }}>
          <span
            style={{
              display: "inline-flex",
              alignSelf: "start",
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(30,64,175,0.08)",
              color: "#1d4ed8",
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            Community Protection Network
          </span>
          <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.08, letterSpacing: "-0.05em" }}>
            Help Protect Your Community from Scams
          </h1>
          <p style={{ margin: 0, maxWidth: 560, fontSize: 17, color: "#475569", lineHeight: 1.6 }}>
            Share scam examples, learn from others, and help families stay safe online.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/community/report"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 20px",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#fff",
              borderRadius: 14,
              textDecoration: "none",
              fontWeight: 800,
              boxShadow: "0 12px 24px rgba(37,99,235,0.28)",
            }}
          >
            Report Scam
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/community/review"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 20px",
              background: "#ffffff",
              color: "#1e3a8a",
              borderRadius: 14,
              textDecoration: "none",
              fontWeight: 800,
              border: "1px solid rgba(96,165,250,0.3)",
            }}
          >
            Browse Scams
          </Link>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16 }}>
        {[
          { label: "Scams Reported", value: `${stats.reports} Scams Reported`, icon: Shield },
          { label: "Community Reviews", value: `${stats.reviews} Community Reviews`, icon: TrendingUp },
          { label: "Scams Saved", value: `${stats.saved} Scams Saved`, icon: BookmarkCheck },
          { label: "Top Contributors", value: `${stats.contributors} Top Contributors`, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            style={{
              background: "#fff",
              border: "1px solid rgba(148,163,184,0.18)",
              borderRadius: 18,
              padding: 18,
              display: "grid",
              gap: 8,
              boxShadow: "0 10px 28px rgba(15,23,42,0.04)",
            }}
          >
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#eff6ff", display: "grid", placeItems: "center", color: "#1d4ed8" }}>
              <Icon size={20} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{value.split(" ")[0]}</div>
            <div style={{ color: "#475569", fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gap: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 900 }}>Trending Scams</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {trending.map((scam) => (
            <div
              key={scam.id}
              style={{
                background: "#fff",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 10px 20px rgba(15,23,42,0.04)",
              }}
            >
              <div style={{ height: 110, background: scam.image }} />
              <div style={{ padding: 18, display: "grid", gap: 8 }}>
                <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700 }}>{scam.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{scam.title}</div>
                <div style={{ color: "#475569", fontWeight: 600 }}>{scam.category}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: scam.dangerLevel === "Critical" ? "#fee2e2" : scam.dangerLevel === "High" ? "#fef3c7" : "#dcfce7",
                      color: scam.dangerLevel === "Critical" ? "#991b1b" : scam.dangerLevel === "High" ? "#92400e" : "#166534",
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {scam.dangerLevel}
                  </span>
                  <Link
                    href={`/community/scam/${scam.id}`}
                    style={{
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      fontWeight: 700,
                      textDecoration: "none",
                      padding: "8px 12px",
                      borderRadius: 10,
                    }}
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
