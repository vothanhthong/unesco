"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, ArrowUpRight, BookOpen, Check, ShieldCheck } from "@phosphor-icons/react";
import { useLocale } from "@/i18n/LocaleProvider";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "@/components/toolkit/toolkit.module.css";

interface CommunityCluster {
  id: string;
  title: string;
  summary: string;
  category: string;
  locale: string;
  report_count: number;
  contributor_count: number;
  upvote_count: number;
  lesson_addition_count: number;
  is_trending: boolean;
  has_voted: boolean;
  has_added_to_lesson: boolean;
  is_shared_by_current_user: boolean;
}

type FeedSort = "latest" | "trending";

export default function CommunityTrends() {
  const { copy, locale } = useLocale();
  const text = copy.contribute.community;
  const [clusters, setClusters] = useState<CommunityCluster[]>([]);
  const [sort, setSort] = useState<FeedSort>("latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [votingId, setVotingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadCommunity() {
      try {
        const response = await fetch(`/api/contribute/community?sort=${sort}&locale=${locale}`, { cache: "no-store" });
        if (!response.ok) throw new Error(text.error);
        const data = (await response.json()) as { clusters: CommunityCluster[] };
        if (!cancelled) setClusters(data.clusters);
      } catch {
        if (!cancelled) setError(text.error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadCommunity();
    return () => { cancelled = true; };
  }, [locale, sort, text.error]);

  async function handleUpvote(clusterId: string) {
    const selected = clusters.find((cluster) => cluster.id === clusterId);
    if (!selected) return;
    const nextVoted = !selected.has_voted;
    setClusters((current) => current.map((cluster) => cluster.id === clusterId ? { ...cluster, has_voted: nextVoted, upvote_count: cluster.upvote_count + (nextVoted ? 1 : -1) } : cluster));
    setVotingId(clusterId);
    setError("");
    try {
      const response = await fetch(`/api/contribute/community/${clusterId}/vote`, { method: "POST" });
      if (!response.ok) {
        if (response.status === 401) throw new Error(text.signInToVote);
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || text.error);
      }
    } catch (voteError) {
      setClusters((current) => current.map((cluster) => cluster.id === clusterId ? { ...cluster, has_voted: selected.has_voted, upvote_count: selected.upvote_count } : cluster));
      setError(voteError instanceof Error ? voteError.message : text.error);
    } finally {
      setVotingId(null);
    }
  }

  async function handleAddToLesson(clusterId: string) {
    const selected = clusters.find((cluster) => cluster.id === clusterId);
    if (!selected) return;
    if (selected.has_added_to_lesson) {
      setSavingId(clusterId);
      const response = await fetch(`/api/contribute/community/${clusterId}/lesson`, { method: "DELETE" });
      if (response.ok) setClusters((current) => current.map((cluster) => cluster.id === clusterId ? { ...cluster, has_added_to_lesson: false, lesson_addition_count: Math.max(0, cluster.lesson_addition_count - 1) } : cluster));
      else setError(text.error);
      setSavingId(null);
      return;
    }
    setSavingId(clusterId);
    setError("");
    try {
      const response = await fetch("/api/train/community-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cluster_id: clusterId, locale }),
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error(text.signInToAdd);
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || text.error);
      }
      setClusters((current) => current.map((cluster) => cluster.id === clusterId ? { ...cluster, has_added_to_lesson: true, lesson_addition_count: cluster.lesson_addition_count + 1 } : cluster));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : text.error);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className={styles.communitySection} aria-labelledby="community-reports-title">
      <h2 id="community-reports-title" className={styles.srOnly}>{text.title}</h2>
      <div className={styles.communityToolbar}>
        <div className={styles.communityTabs} role="tablist" aria-label={text.title}>
          <button
            className={sort === "latest" ? styles.communityTabActive : styles.communityTab}
            type="button"
            role="tab"
            aria-selected={sort === "latest"}
            onClick={() => setSort("latest")}
          >
            {text.latest}
          </button>
          <button
            className={sort === "trending" ? styles.communityTabActive : styles.communityTab}
            type="button"
            role="tab"
            aria-selected={sort === "trending"}
            onClick={() => setSort("trending")}
          >
            {text.trendTab}
          </button>
        </div>
        <p>{sort === "latest" ? text.latestDescription : text.trendingDescription}</p>
        <Link className={styles.primaryAction} href="/toolkit/contribute/report">
          {text.report} <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {loading && (
        <div className={styles.communityList} aria-label={text.loading}>
          {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className={styles.communitySkeleton} />)}
        </div>
      )}
      {!loading && error && <p className={styles.actionError} role="alert">{error}</p>}
      {!loading && !error && clusters.length === 0 && <p className={styles.communityEmpty}>{text.noTrends}</p>}
      {!loading && !error && clusters.length > 0 && (
        <div className={styles.communityList}>
          {clusters.map((cluster) => (
            <article key={cluster.id} className={styles.communityCard}>
              <div className={styles.communityCardMain}>
                <div className={styles.communityMeta}>
                  <span>{cluster.category}</span>
                  {cluster.is_trending && <span className={styles.communityTrend}>{text.trending}</span>}
                  <span className={styles.communityVerified}><ShieldCheck size={14} aria-hidden="true" /> {text.verified}</span>
                </div>
                <h3>{cluster.title}</h3>
                <p>{cluster.summary}</p>
                <small>{cluster.report_count} {text.reports} · {cluster.contributor_count} {text.contributors}</small>
                <small>{cluster.upvote_count} people found this helpful · Added to {cluster.lesson_addition_count} lessons {cluster.is_shared_by_current_user && "· Shared by you"}</small>
              </div>
               <div className={styles.communityCardActions}>
                 <button
                   className={`${styles.lessonButton} ${cluster.has_added_to_lesson ? styles.lessonButtonActive : ""}`}
                   type="button"
                   disabled={savingId === cluster.id}
                   aria-pressed={cluster.has_added_to_lesson}
                   onClick={() => handleAddToLesson(cluster.id)}
                 >
                   {cluster.has_added_to_lesson ? <Check size={16} aria-hidden="true" /> : <BookOpen size={16} aria-hidden="true" />}
                   <span>{cluster.has_added_to_lesson ? text.addedToLesson : savingId === cluster.id ? text.adding : text.addToLesson}</span>
                 </button>
                 <button
                   className={`${styles.upvoteButton} ${cluster.has_voted ? styles.upvoteButtonActive : ""}`}
                   type="button"
                   disabled={votingId === cluster.id}
                   aria-pressed={cluster.has_voted}
                   onClick={() => handleUpvote(cluster.id)}
                 >
                   {cluster.has_voted ? <Check size={16} aria-hidden="true" /> : <ArrowUp size={16} aria-hidden="true" />}
                   <span>{cluster.has_voted ? text.voted : text.upvote}</span>
                   <strong>{cluster.upvote_count}</strong>
                 </button>
               </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
