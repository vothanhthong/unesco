"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ClipboardText, LockKey as LockKeyhole } from "@phosphor-icons/react";
import { useLocale } from "@/i18n/LocaleProvider";
import styles from "@/components/toolkit/toolkit.module.css";

interface ReviewDraft {
  id: string;
  status: "draft" | "in_review";
  created_at: string;
  updated_at: string;
  snapshot: { title?: string; summary?: string; category?: string };
}

interface ReviewCopy {
  approve: string;
  reject: string;
  approving: string;
  rejecting: string;
  reviewSuccess: string;
  reviewError: string;
  [key: string]: string;
}

function ReviewDraftItem({ draft, text, onResolved }: { draft: ReviewDraft; text: ReviewCopy; onResolved: (message: string) => void }) {
  const [busyAction, setBusyAction] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");

  async function handleAction(action: "approve" | "reject") {
    setBusyAction(action);
    setError("");
    try {
      const response = await fetch(`/api/contribute/review/${draft.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || text.reviewError);
      }
      onResolved(text.reviewSuccess);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : text.reviewError);
      setBusyAction(null);
    }
  }

  return (
    <article className={styles.reviewQueueItem}>
      <div className={styles.reviewDraftContent}>
        <strong>{draft.snapshot.title || text.untitled}</strong>
        <small>{draft.snapshot.category || text.communityReport}</small>
        {draft.snapshot.summary && <p>{draft.snapshot.summary}</p>}
        {error && <span className={styles.formError} role="alert">{error}</span>}
        <div className={styles.reviewActions}>
          <button className={styles.reviewApproveButton} type="button" disabled={busyAction !== null} onClick={() => handleAction("approve")}>
            {busyAction === "approve" ? text.approving : text.approve}
          </button>
          <button className={styles.reviewRejectButton} type="button" disabled={busyAction !== null} onClick={() => handleAction("reject")}>
            {busyAction === "reject" ? text.rejecting : text.reject}
          </button>
        </div>
      </div>
      <span>{draft.status === "in_review" ? text.inReview : text.draft}</span>
    </article>
  );
}

export default function ReviewHub() {
  const { copy } = useLocale();
  const text = copy.contribute.reviewHub;
  const [authState, setAuthState] = useState<"loading" | "unauthenticated" | "not_reviewer" | "authorized">("loading");
  const [drafts, setDrafts] = useState<ReviewDraft[]>([]);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadQueue() {
      try {
        const response = await fetch("/api/contribute/review", { cache: "no-store" });
        if (response.status === 401) {
          if (!cancelled) setAuthState("unauthenticated");
          return;
        }
        if (!response.ok) throw new Error(text.error);
        const data = (await response.json()) as { authorized: boolean; drafts: ReviewDraft[] };
        if (!cancelled) {
          setAuthState(data.authorized ? "authorized" : "not_reviewer");
          setDrafts(data.drafts);
        }
      } catch {
        if (!cancelled) setError(text.error);
      }
    }
    void loadQueue();
    return () => { cancelled = true; };
  }, [text.error]);

  return (
    <section className={styles.reviewHub} aria-labelledby="review-hub-title">
      <div className={styles.reviewHubHeader}>
        <div className={styles.reviewHubIcon}><ClipboardText size={22} aria-hidden="true" /></div>
        <div>
          <p className={styles.eyebrow}>{text.eyebrow}</p>
          <h2 id="review-hub-title">{text.title}</h2>
        </div>
      </div>
      <p className={styles.reviewHubBody}>{text.body}</p>

      {error && <p className={styles.actionError} role="alert">{error}</p>}
      {!error && authState === "unauthenticated" && (
        <div className={styles.reviewHubAccess}>
          <LockKeyhole size={18} aria-hidden="true" />
          <div>
            <strong>{text.accessTitle}</strong>
            <p>{text.accessBody}</p>
            <Link className={styles.textLink} href="/toolkit/login">{text.signIn} <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
      )}
      {!error && authState === "not_reviewer" && (
        <div className={styles.reviewHubAccess}>
          <LockKeyhole size={18} aria-hidden="true" />
          <div>
            <strong>{text.notReviewerTitle}</strong>
            <p>{text.notReviewerBody}</p>
          </div>
        </div>
      )}
      {!error && authState === "authorized" && drafts.length === 0 && <p className={styles.emptyCopy}>{text.noDrafts}</p>}
      {!error && actionMessage && <p className={styles.formMessage} role="status">{actionMessage}</p>}
      {!error && authState === "authorized" && drafts.length > 0 && (
        <div className={styles.reviewQueue}>
          {drafts.map((draft) => <ReviewDraftItem key={draft.id} draft={draft} text={text} onResolved={(message) => { setDrafts((current) => current.filter((item) => item.id !== draft.id)); setActionMessage(message); }} />)}
        </div>
      )}
    </section>
  );
}
