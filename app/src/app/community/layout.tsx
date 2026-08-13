import Link from "next/link";
import { ShieldCheck, Flag, Newspaper, Trophy, BookOpen } from "lucide-react";

const navItems = [
  { href: "/community", label: "Home", icon: ShieldCheck },
  { href: "/community/report", label: "Report Scam", icon: Flag },
  { href: "/community/review", label: "Review Hub", icon: Newspaper },
  { href: "/community/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/community/library", label: "My Library", icon: BookOpen },
];

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f3f7ff", color: "#0f172a" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: "linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 800,
              }}
            >
              C
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>Community Hub</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Scam awareness & reporting</div>
            </div>
          </div>

          <nav
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: "#eff6ff",
                  color: "#1e3a8a",
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid rgba(59, 130, 246, 0.12)",
                }}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 48px" }}>{children}</main>
    </div>
  );
}
