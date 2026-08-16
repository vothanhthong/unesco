"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/components/toolkit/toolkit.module.css";

type Impact = { scenarios_shared: number; votes_received: number; lesson_additions_received: number };

export default function CommunityImpact() {
  const [impact, setImpact] = useState<Impact | null>(null);
  useEffect(() => { void fetch("/api/contribute/impact", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((data: { impact: Impact } | null) => setImpact(data?.impact ?? null)); }, []);
  if (!impact) return null;
  const metrics = [[impact.scenarios_shared, "Scenarios shared"], [impact.votes_received, "Community votes received"], [impact.lesson_additions_received, "Times your scenarios were added to lessons"]] as const;
  return <section className={styles.communityImpact} aria-labelledby="community-impact-title"><div><h2 id="community-impact-title">Your Community Impact</h2><p>See how the scam patterns you shared are helping the community learn and practise safely.</p></div><div className={styles.impactMetrics}>{metrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><Link className={styles.textLink} href="/leaderboard">See Top Contributors <span aria-hidden="true">→</span></Link></section>;
}