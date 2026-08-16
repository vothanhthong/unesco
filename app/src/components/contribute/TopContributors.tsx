"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/components/toolkit/toolkit.module.css";

type Contributor = { user_id: string; display_name: string; verified_scenario_count: number; helpful_votes_received: number; lesson_additions_received: number; rank: number; is_current_user: boolean };

export default function TopContributors() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const loadContributors = async () => {
    setStatus("loading");
    const response = await fetch("/api/contribute/leaderboard", { cache: "no-store" });
    if (!response.ok) { setStatus("error"); return; }
    const data = (await response.json()) as { contributors: Contributor[] };
    setContributors(data.contributors);
    setStatus("ready");
  };
  useEffect(() => {
    void fetch("/api/contribute/leaderboard", { cache: "no-store" })
      .then(async (response) => ({ response, data: await response.json().catch(() => null) }))
      .then(({ response, data }: { response: Response; data: { contributors?: Contributor[] } | null }) => {
        if (!response.ok || !data?.contributors) { setStatus("error"); return; }
        setContributors(data.contributors);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);
  if (status === "loading") return <section className={styles.leaderboard} aria-live="polite"><h1>Top Contributors</h1><p>Loading top contributors...</p></section>;
  if (status === "error") return <section className={styles.leaderboard} role="alert"><h1>Top Contributors</h1><p>We could not load Top Contributors right now.</p><button className={styles.subtleAction} type="button" onClick={() => void loadContributors()}>Try again</button></section>;
  const currentUserListed = contributors.some((contributor) => contributor.is_current_user);
  return <section className={styles.leaderboard} aria-labelledby="leaderboard-title"><header><p className={styles.eyebrow}>Community recognition</p><h1 id="leaderboard-title">Top Contributors</h1><p>Recognising community members whose verified scam patterns are helping more people learn, practise, and stay safer online.</p></header>{contributors.length === 0 ? <p className={styles.leaderboardNote}>Top contributors will appear as verified scam patterns are shared and used in lessons.</p> : <ol>{contributors.slice(0, 5).map((contributor) => <li key={contributor.user_id} className={contributor.is_current_user ? styles.currentContributor : ""}><strong>#{contributor.rank} {contributor.display_name} {contributor.is_current_user && <small>You</small>}</strong><span>{contributor.verified_scenario_count} verified scenarios · {contributor.helpful_votes_received} helpful votes · Added to {contributor.lesson_additions_received} lessons</span></li>)}</ol>}{!currentUserListed && <p className={styles.leaderboardNote}>Keep contributing verified scam patterns to strengthen safer learning across the community.</p>}<p className={styles.privacyNote}>Recognition is based on verified community contributions and learning use. Contributors can choose how their name is displayed.</p><Link className={styles.primaryAction} href="/toolkit/contribute/report">Report a pattern <span aria-hidden="true">→</span></Link></section>;
}