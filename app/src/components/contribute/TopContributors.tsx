"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/components/toolkit/toolkit.module.css";

type Contributor = { user_id: string; display_name: string; verified_scenario_count: number; helpful_votes_received: number; lesson_additions_received: number; rank: number; is_current_user: boolean };

export default function TopContributors() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  useEffect(() => { void fetch("/api/contribute/leaderboard", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((data: { contributors: Contributor[] } | null) => setContributors(data?.contributors ?? [])); }, []);
  const currentUserListed = contributors.some((contributor) => contributor.is_current_user);
  return <section className={styles.leaderboard} aria-labelledby="leaderboard-title"><header><p className={styles.eyebrow}>Community recognition</p><h1 id="leaderboard-title">Top Contributors</h1><p>Recognising community members whose verified scam patterns are helping more people learn, practise, and stay safer online.</p></header><ol>{contributors.slice(0, 5).map((contributor) => <li key={contributor.user_id} className={contributor.is_current_user ? styles.currentContributor : ""}><strong>#{contributor.rank} {contributor.display_name} {contributor.is_current_user && <small>You</small>}</strong><span>{contributor.verified_scenario_count} verified scenarios · {contributor.helpful_votes_received} helpful votes · Added to {contributor.lesson_additions_received} lessons</span></li>)}</ol>{!currentUserListed && <p className={styles.leaderboardNote}>Keep contributing verified scam patterns to strengthen safer learning across the community.</p>}<p className={styles.privacyNote}>Recognition is based on verified community contributions and learning use. Contributors can choose how their name is displayed.</p><Link className={styles.primaryAction} href="/toolkit/contribute/report">Report a pattern <span aria-hidden="true">→</span></Link></section>;
}