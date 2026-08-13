"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, UploadCloud } from "lucide-react";
import { getCommunityReports, setCommunityReports, setCurrentPoints } from "@/lib/community";

const categories = [
  "Family Scam",
  "Bank Scam",
  "Police Scam",
  "Investment Scam",
  "Job Scam",
  "Prize Scam",
  "Payment Scam",
  "Shopping Scam",
  "Other",
];

const platforms = ["Zalo", "Facebook", "SMS", "Email", "Phone Call", "Website", "Other"];
const dangerLevels = ["Low", "Medium", "High", "Critical"];

export default function CommunityReportPage() {
  const [title, setTitle] = useState("Fake BIDV OTP Warning");
  const [category, setCategory] = useState(categories[1]);
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState(platforms[0]);
  const [dangerLevel, setDangerLevel] = useState(dangerLevels[3]);
  const [convincingScore, setConvincingScore] = useState(8);
  const [files, setFiles] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const pointsAwarded = useMemo(() => 50, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(event.target.files ?? []).map((file) => file.name);
    setFiles(chosen);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const report = {
      id: `report-${Date.now()}`,
      title,
      category,
      description,
      platform,
      dangerLevel,
      convincingScore,
      evidence: files,
      createdAt: new Date().toISOString(),
    };

    const existing = getCommunityReports();
    const nextReports = [report, ...existing];
    setCommunityReports(nextReports);

    const currentPoints = Number(window.localStorage.getItem("community_points") ?? "0");
    setCurrentPoints(currentPoints + pointsAwarded);

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 26,
            padding: "34px 28px",
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
            border: "1px solid rgba(34,197,94,0.24)",
            boxShadow: "0 18px 32px rgba(34,197,94,0.1)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ margin: 0, fontSize: 32, lineHeight: 1.2 }}>Report Submitted</h2>
          <p style={{ margin: "14px 0 20px", color: "#475569", lineHeight: 1.6 }}>
            Thank you for helping protect the community.
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 18px",
              borderRadius: 999,
              background: "#ecfdf5",
              color: "#166534",
              fontWeight: 800,
            }}
          >
            +50 Community Points
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: "#dbeafe", display: "grid", placeItems: "center", color: "#1d4ed8" }}>
          <ShieldCheck size={22} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>Share a scam</div>
          <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.1 }}>Report Scam</h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: 20,
          border: "1px solid rgba(148,163,184,0.18)",
          display: "grid",
          gap: 18,
        }}
      >
        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: 700 }}>Scam Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Fake BIDV OTP Warning" style={inputStyles} />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: 700 }}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyles}>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: 700 }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the scam and how it works."
            rows={5}
            style={{ ...inputStyles, resize: "vertical", minHeight: 120 }}
          />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: 700 }}>Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={inputStyles}>
            {platforms.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: 700 }}>Danger Level</label>
          <select value={dangerLevel} onChange={(e) => setDangerLevel(e.target.value)} style={inputStyles}>
            {dangerLevels.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: 700 }}>How convincing was this scam? ({convincingScore}/10)</label>
          <input
            type="range"
            min={1}
            max={10}
            value={convincingScore}
            onChange={(e) => setConvincingScore(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: 700 }}>Upload Evidence</label>
          <label
            style={{
              display: "grid",
              placeItems: "center",
              gap: 10,
              minHeight: 130,
              border: "1.5px dashed rgba(59,130,246,0.4)",
              borderRadius: 18,
              background: "#f8fbff",
              color: "#1d4ed8",
              cursor: "pointer",
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            <UploadCloud size={26} />
            {files.length ? files.join(", ") : "Select Image, Audio, PDF"}
            <input type="file" accept="image/*,audio/*,.pdf" multiple onChange={handleFileChange} style={{ display: "none" }} />
          </label>
        </div>

        <button
          type="submit"
          style={{
            padding: "16px 22px",
            border: 0,
            borderRadius: 16,
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Submit Report
        </button>
      </form>
    </div>
  );
}

const inputStyles: React.CSSProperties = {
  width: "100%",
  border: "1px solid rgba(148,163,184,0.24)",
  borderRadius: 14,
  padding: "14px 16px",
  fontSize: 15,
  background: "#f8fafc",
  color: "#0f172a",
  outline: "none",
};
