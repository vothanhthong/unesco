"use client";

import { useDeferredValue, useEffect, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle as CheckCircle2,
  Funnel as Filter,
  Plus,
  MagnifyingGlass as Search,
  ShieldWarning as ShieldAlert,
  Trash,
  User as UserRound,
} from "@phosphor-icons/react";
import { recommendScenarios, type ScenarioRecommendation } from "@/lib/train/recommendations";
import { buildDebrief } from "@/lib/train/debrief";
import styles from "@/components/toolkit/toolkit.module.css";
import { useLocale } from "@/i18n/LocaleProvider";
import { localizeScenario } from "@/lib/scenarios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

interface FamilyMember {
  id: string;
  display_name: string;
  relationship: string | null;
  locale: string;
  notes: string | null;
}

interface Scenario {
  id: string;
  slug: string;
  category: string;
  title: string;
  sender: string;
  content: string;
  link_hint: string | null;
  locale?: string | null;
  is_verified?: boolean;
  community_cluster_id?: string | null;
}

interface PracticeSession {
  id: string;
  pairing_code: string;
  status: "waiting" | "paired" | "triggered" | "passed" | "failed";
  family_member_id: string | null;
  scenario_id: string | null;
  created_at: string;
  completed_at: string | null;
  familyMember: FamilyMember | null;
  scenario: Scenario | null;
  result: {
    result: "passed" | "failed";
    warning_signs: string[];
    debrief_notes: string | null;
    created_at: string;
  } | null;
}

interface OverviewResponse {
  familyMembers: FamilyMember[];
  scenarios: Scenario[];
  sessions: PracticeSession[];
}

export default function TrainDashboard() {
  const { locale, copy, formatDate } = useLocale();
  const text = copy.train;
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [newName, setNewName] = useState("");
  const [newRelationship, setNewRelationship] = useState("");
  const [editName, setEditName] = useState("");
  const [editRelationship, setEditRelationship] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editingMember, setEditingMember] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("vi"));

  useEffect(() => {
    let cancelled = false;
    async function loadOverview() {
      try {
        const response = await fetch("/api/train/overview", { cache: "no-store" });
        if (response.status === 401) {
          if (!cancelled) setAuthRequired(true);
          return;
        }
        if (!response.ok) throw new Error("overview request failed");
        const data = (await response.json()) as OverviewResponse;
        if (!cancelled) {
          setOverview(data);
          const firstMember = data.familyMembers[0];
          setSelectedMemberId((current) => current ?? firstMember?.id ?? null);
          if (firstMember) {
            setEditName(firstMember.display_name);
            setEditRelationship(firstMember.relationship ?? "");
            setEditNotes(firstMember.notes ?? "");
          }
        }
      } catch {
        if (!cancelled) setError("Không thể tải dashboard TRAIN. Vui lòng thử lại.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadOverview();
    return () => { cancelled = true; };
  }, []);

  if (authRequired) {
    return (
      <section className={styles.emptyState} aria-labelledby="train-auth-title">
        <UserRound size={22} aria-hidden="true" />
        <p className={styles.eyebrow}>{text.authEyebrow}</p>
        <h2 id="train-auth-title">{text.authTitle}</h2>
        <p>{text.authBody}</p>
        <Link className={styles.primaryAction} href="/toolkit/login">{text.signIn} <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </section>
    );
  }

  if (loading) {
    return (
      <section className={styles.trainSkeleton} role="status" aria-label={text.loading} aria-live="polite">
        <div className={styles.trainSkeletonIntro}>
          <div>
            <Skeleton className={`${styles.skeletonLine} ${styles.skeletonEyebrow}`} />
            <Skeleton className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
            <Skeleton className={`${styles.skeletonLine} ${styles.skeletonTitleShort}`} />
            <Skeleton className={`${styles.skeletonLine} ${styles.skeletonBody}`} />
            <Skeleton className={`${styles.skeletonLine} ${styles.skeletonBodyShort}`} />
          </div>
          <div className={styles.trainSkeletonCount}>
            <Skeleton className={`${styles.skeletonLine} ${styles.skeletonCountLabel}`} />
            <Skeleton className={`${styles.skeletonLine} ${styles.skeletonCountValue}`} />
          </div>
        </div>

        <div className={styles.trainSkeletonLayout}>
          <aside className={styles.trainSkeletonPanel}>
            <Skeleton className={`${styles.skeletonLine} ${styles.skeletonPanelLabel}`} />
            <Skeleton className={`${styles.skeletonLine} ${styles.skeletonPanelTitle}`} />
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className={`${styles.skeletonLine} ${styles.skeletonMemberRow}`} />
            ))}
          </aside>

          <div className={styles.trainSkeletonMain}>
            <div className={styles.trainSkeletonToolbar}>
              <div>
                <Skeleton className={`${styles.skeletonLine} ${styles.skeletonPanelLabel}`} />
                <Skeleton className={`${styles.skeletonLine} ${styles.skeletonPanelTitle}`} />
              </div>
              <Skeleton className={`${styles.skeletonLine} ${styles.skeletonSearch}`} />
            </div>
            <div className={styles.trainSkeletonCards}>
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className={styles.trainSkeletonCard}>
                  <Skeleton className={`${styles.skeletonLine} ${styles.skeletonCardLabel}`} />
                  <Skeleton className={`${styles.skeletonLine} ${styles.skeletonCardTitle}`} />
                  <Skeleton className={`${styles.skeletonLine} ${styles.skeletonCardBody}`} />
                  <Skeleton className={`${styles.skeletonLine} ${styles.skeletonCardBodyShort}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !overview) {
    return (
      <section className={styles.emptyState} aria-labelledby="train-error-title">
        <p className={styles.eyebrow}>{text.errorEyebrow}</p>
        <h2 id="train-error-title">{text.errorTitle}</h2>
        <p>{error || text.errorBody}</p>
      </section>
    );
  }

  const selectedMember = overview.familyMembers.find((member) => member.id === selectedMemberId) ?? null;
  const localizedScenarios = overview.scenarios.map((scenario) => localizeScenario(scenario, locale));
  const memberSessions = overview.sessions.filter((session) => session.family_member_id === selectedMemberId);
  const outcomes = memberSessions.flatMap((session) => session.result && session.scenario ? [{
    scenarioSlug: session.scenario.slug,
    result: session.result.result,
    completedAt: session.result.created_at,
  }] : []);
  const recommendations = recommendScenarios(
    localizedScenarios.map(({ slug, category, title, locale: scenarioLocale, is_verified }) => ({ slug, category, title, locale: scenarioLocale, verified: is_verified })),
    outcomes,
    { locale: locale === "vi" ? "vi-VN" : "en-US" }
  );
  const visibleScenarios = localizedScenarios.filter((scenario) => {
    const matchesCategory = category === "all" || scenario.category === category;
    const haystack = `${scenario.title} ${scenario.sender} ${scenario.content}`.toLocaleLowerCase("vi");
    return matchesCategory && (!deferredSearch || haystack.includes(deferredSearch));
  });

  function sessionGuidance(session: PracticeSession) {
    if (!session.scenario) return null;
    const localizedScenario = localizeScenario(session.scenario, locale);
    if (session.result?.warning_signs?.length) {
      return {
        warningSigns: session.result.warning_signs,
        discussionPrompt: session.result.debrief_notes,
      };
    }
    return buildDebrief({
      category: localizedScenario.category,
      title: localizedScenario.title,
      sender: localizedScenario.sender,
      content: localizedScenario.content,
      linkHint: localizedScenario.link_hint,
    }, session.result?.result ?? (session.status === "failed" ? "failed" : "passed"), locale);
  }

  function scenarioCategoryLabel(scenario: Scenario) {
    if (scenario.community_cluster_id) return text.communityLesson;
    return { message: text.message, call: text.call, investment: text.investment }[scenario.category] || scenario.category;
  }

  function addFamilyMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");
    startTransition(async () => {
      const response = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: newName, relationship: newRelationship || undefined }),
      });
      if (!response.ok) {
        setActionError(text.addError);
        return;
      }
      const { data } = (await response.json()) as { data: FamilyMember };
      setOverview((current) => current ? { ...current, familyMembers: [...current.familyMembers, data] } : current);
      setSelectedMemberId(data.id);
      setEditName(data.display_name);
      setEditRelationship(data.relationship ?? "");
      setEditNotes(data.notes ?? "");
      setEditingMember(false);
      setNewName("");
      setNewRelationship("");
    });
  }

  function selectFamilyMember(member: FamilyMember) {
    setSelectedMemberId(member.id);
    setEditName(member.display_name);
    setEditRelationship(member.relationship ?? "");
    setEditNotes(member.notes ?? "");
    setEditingMember(false);
  }

  function updateFamilyMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMemberId) return;
    setActionError("");
    startTransition(async () => {
      const response = await fetch(`/api/family/${selectedMemberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: editName,
          relationship: editRelationship || null,
          notes: editNotes || null,
        }),
      });
      if (!response.ok) {
        setActionError(text.updateError);
        return;
      }
      const { data } = (await response.json()) as { data: FamilyMember };
      setOverview((current) => current ? { ...current, familyMembers: current.familyMembers.map((member) => member.id === data.id ? data : member) } : current);
      setEditingMember(false);
    });
  }

  function deleteFamilyMember() {
    if (!selectedMemberId || !selectedMember) return;
    if (!window.confirm(text.deleteConfirm)) return;
    const memberId = selectedMemberId;
    const nextMember = overview?.familyMembers.find((member) => member.id !== memberId) ?? null;
    setActionError("");
    startTransition(async () => {
      const response = await fetch(`/api/family/${memberId}`, { method: "DELETE" });
      if (!response.ok) {
        setActionError(text.deleteError);
        return;
      }
      setOverview((current) => current ? { ...current, familyMembers: current.familyMembers.filter((member) => member.id !== memberId) } : current);
      setSelectedMemberId(nextMember?.id ?? null);
      setEditName(nextMember?.display_name ?? "");
      setEditRelationship(nextMember?.relationship ?? "");
      setEditNotes(nextMember?.notes ?? "");
      setEditingMember(false);
    });
  }

  function startPractice(scenario: Pick<ScenarioRecommendation, "slug">) {
    setActionError("");
    window.location.assign(`/toolkit/train/session?scenario_slug=${encodeURIComponent(scenario.slug)}`);
  }

  return (
    <div className={styles.trainDashboard}>
      <div className={styles.trainIntro}>
        <div>
          <p className={styles.eyebrow}>{text.introEyebrow}</p>
          <h1>{text.introTitle}</h1>
          <p>{text.introBody}</p>
        </div>
        <div className={styles.memberCount}>
          <span>{text.memberCount}</span>
          <strong>{overview.familyMembers.length.toString().padStart(2, "0")}</strong>
        </div>
      </div>

      <div className={styles.trainLayout}>
        <aside className={styles.familyPanel} aria-labelledby="family-panel-title">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.eyebrow}>{text.people}</p>
              <h2 id="family-panel-title">{text.family}</h2>
            </div>
            <UserRound size={18} aria-hidden="true" />
          </div>
          <div className={styles.familyList}>
            {overview.familyMembers.map((member) => (
              <button
                key={member.id}
                className={`${styles.familyButton} ${selectedMemberId === member.id ? styles.familyButtonActive : ""}`}
                type="button"
                onClick={() => selectFamilyMember(member)}
                aria-pressed={selectedMemberId === member.id}
              >
                <span className={styles.familyInitial} aria-hidden="true">{member.display_name.slice(0, 1).toUpperCase()}</span>
                <span><strong>{member.display_name}</strong><small>{member.relationship || text.familyMember}</small></span>
              </button>
            ))}
          </div>
          {selectedMember && (
            <div className={styles.selectedMemberCard}>
               <div className={styles.selectedMemberHeading}><span><small>{text.selected}</small><strong>{selectedMember.display_name}</strong></span><span className={styles.memberActions}><button className={styles.inlineAction} type="button" onClick={() => setEditingMember((current) => !current)}>{editingMember ? text.close : text.edit}</button><button className={`${styles.inlineAction} ${styles.deleteAction}`} type="button" onClick={deleteFamilyMember} disabled={isPending}><Trash size={13} aria-hidden="true" /> {text.deleteMember}</button></span></div>
              {editingMember && <form className={styles.memberEditForm} onSubmit={updateFamilyMember}>
                <label htmlFor="edit-member-name">{text.name}</label>
                <Input id="edit-member-name" required minLength={2} value={editName} onChange={(event) => setEditName(event.target.value)} />
                <label htmlFor="edit-member-relationship">{text.relationship}</label>
                <Input id="edit-member-relationship" value={editRelationship} onChange={(event) => setEditRelationship(event.target.value)} />
                <label htmlFor="edit-member-notes">{text.notes}</label>
                <Textarea id="edit-member-notes" maxLength={500} value={editNotes} onChange={(event) => setEditNotes(event.target.value)} rows={3} />
                <Button variant="outline" type="submit" disabled={isPending}>{text.save}</Button>
              </form>}
            </div>
          )}
          <form className={styles.memberForm} onSubmit={addFamilyMember}>
            <label htmlFor="new-member-name">{text.add}</label>
            <Input id="new-member-name" required minLength={2} value={newName} onChange={(event) => setNewName(event.target.value)} placeholder={text.name} />
            <Input aria-label={text.relationship} value={newRelationship} onChange={(event) => setNewRelationship(event.target.value)} placeholder={text.relationshipOptional} />
            <Button variant="secondary" type="submit" disabled={isPending || !newName.trim()}><Plus data-icon="inline-start" aria-hidden="true" /> {text.addPerson}</Button>
          </form>
        </aside>

        <section className={styles.trainMain} aria-labelledby="recommendation-title">
          <div className={styles.panelHeading}>
             <div><p className={styles.eyebrow}>{text.recommendationEyebrow}</p><h2 id="recommendation-title">{selectedMember ? `${text.forMember} ${selectedMember.display_name}` : text.recommendationTitle}</h2></div>
            <ShieldAlert size={20} aria-hidden="true" />
          </div>
          {recommendations.length > 0 ? (
            <div className={styles.recommendationList}>
              {recommendations.slice(0, 3).map((recommendation) => (
                <article className={styles.recommendationCard} key={recommendation.slug}>
                  <div><span className={styles.recommendationRank}>{text.recommended}</span><h3>{recommendation.title}</h3><p>{recommendation.reason}</p></div>
                  <Button type="button" disabled={isPending} onClick={() => startPractice(recommendation)}>{text.start} <ArrowUpRight data-icon="inline-end" aria-hidden="true" /></Button>
                </article>
              ))}
            </div>
          ) : <p className={styles.emptyCopy}>{text.allRecent}</p>}

          <div className={styles.panelHeadingFilter}>
            <div><p className={styles.eyebrow}>{text.libraryEyebrow}</p><h2>{text.libraryTitle}</h2></div>
            <Filter size={18} aria-hidden="true" />
          </div>
          <div className={styles.filters}>
            <label className={styles.searchField} htmlFor="scenario-search"><Search size={15} aria-hidden="true" /><span className={styles.srOnly}>{text.searchLabel}</span><Input id="scenario-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={text.search} /></label>
            <label className={styles.selectField} htmlFor="scenario-category"><span className={styles.srOnly}>{text.categoryLabel}</span><select id="scenario-category" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">{text.allCategories}</option><option value="message">{text.message}</option><option value="call">{text.call}</option><option value="investment">{text.investment}</option></select></label>
          </div>
          <div className={styles.scenarioGrid}>
             {visibleScenarios.map((scenario) => <button key={scenario.id} className={styles.libraryCard} type="button" onClick={() => startPractice(scenario)} disabled={isPending}><span>{scenarioCategoryLabel(scenario)}</span><strong>{scenario.title}</strong><small>{scenario.sender}</small></button>)}
          </div>
        </section>
      </div>

      <section className={styles.historyPanel} aria-labelledby="history-title">
        <div className={styles.panelHeading}><div><p className={styles.eyebrow}>{text.historyEyebrow}</p><h2 id="history-title">{text.historyTitle}</h2></div><CheckCircle2 size={20} aria-hidden="true" /></div>
        {memberSessions.length === 0 ? <p className={styles.emptyCopy}>{text.noHistory}</p> : <div className={styles.historyList}>{memberSessions.slice(0, 5).map((session) => { const guidance = sessionGuidance(session); const localizedScenario = session.scenario ? localizeScenario(session.scenario, locale) : null; const statusText = { waiting: text.waiting, paired: text.paired, triggered: text.active, passed: text.passed, failed: text.failed }[session.status]; return <article className={styles.historyRow} key={session.id}><span className={`${styles.historyStatus} ${session.status === "passed" ? styles.historyPassed : styles.historyFailed}`}>{statusText}</span><span><strong>{localizedScenario?.title || text.historyTitle}</strong><small>{guidance?.discussionPrompt || (session.status === "failed" ? text.discussPressure : text.safeRecorded)}</small>{guidance && <span className={styles.warningList}>{guidance.warningSigns.map((warning) => <span key={warning}>• {warning}</span>)}</span>}</span><time dateTime={session.created_at}>{formatDate(session.created_at)}</time></article>; })}</div>}
      </section>
      {actionError && <p className={styles.actionError} role="alert">{actionError}</p>}
    </div>
  );
}
