"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/components/toolkit/toolkit.module.css";

type Impact = { scenarios_shared: number; votes_received: number; lesson_additions_received: number };

export default function CommunityImpact() {
  const [impact, setImpact] = useState<Impact | null>(null);
  const [status, setStatus] = useState<"loading" | "signed-out" | "error" | "ready">("loading");
  const loadImpact = async () => {
    setStatus("loading");
    const response = await fetch("/api/contribute/impact", { cache: "no-store" });
    if (response.status === 401) { setStatus("signed-out"); return; }
    if (!response.ok) { setStatus("error"); return; }
    const data = (await response.json()) as { impact: Impact };
    setImpact(data.impact);
    setStatus("ready");
  };
  useEffect(() => {
    void fetch("/api/contribute/impact", { cache: "no-store" })
      .then(async (response) => ({ response, data: await response.json().catch(() => null) }))
      .then(({ response, data }: { response: Response; data: { impact?: Impact } | null }) => {
        if (response.status === 401) { setStatus("signed-out"); return; }
        if (!response.ok || !data?.impact) { setStatus("error"); return; }
        setImpact(data.impact);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);
  if (status === "loading") return <section className={styles.communityImpact} aria-live="polite"><h2>Your Community Impact</h2><p>Loading your community impact...</p></section>;
  if (status === "signed-out") return <section className={styles.communityImpact}><h2>Your Community Impact</h2><p>Sign in to see how your shared scam patterns are helping the community.</p><Link className={styles.textLink} href="/toolkit/login?next=/toolkit/contribute">Sign in <span aria-hidden="true">→</span></Link></section>;
  if (status === "error" || !impact) return <section className={styles.communityImpact} role="alert"><h2>Your Community Impact</h2><p>We could not load your community impact right now.</p><button className={styles.subtleAction} type="button" onClick={() => void loadImpact()}>Try again</button></section>;
  if (impact.scenarios_shared === 0) return <section className={styles.communityImpact}><h2>Your Community Impact</h2><p>You have not shared a scam pattern yet.</p><p>Your experience could help others practise safer responses.</p><Link className={styles.textLink} href="/toolkit/contribute/report">Report a pattern <span aria-hidden="true">→</span></Link></section>;
  const metrics = [[impact.scenarios_shared, "Scenarios shared"], [impact.votes_received, "Community votes received"], [impact.lesson_additions_received, "Times your scenarios were added to lessons"]] as const;
  return <section className={styles.communityImpact} aria-labelledby="community-impact-title"><div><h2 id="community-impact-title">Your Community Impact</h2><p>See how the scam patterns you shared are helping the community learn and practise safely.</p></div><div className={styles.impactMetrics}>{metrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><Link className={styles.textLink} href="/leaderboard">See Top Contributors <span aria-hidden="true">→</span></Link></section>;
}