"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  CaretLeft as ChevronLeft,
  Phone,
  VideoCamera as Video,
  DotsThree as MoreHorizontal,
  Microphone as Mic,
  Image as ImageIcon,
  Smiley as Smile,
  Trash as Trash2,
  Warning as AlertTriangle,
  CheckCircle as CheckCircle2,
  Bell,
  BellSlash as BellOff,
  MagnifyingGlass,
  Shield,
} from "@phosphor-icons/react";
import { useLocale } from "@/i18n/LocaleProvider";
import LanguageSwitcher from "@/i18n/LanguageSwitcher";
import styles from "./learner.module.css";

type SessionStatus = "waiting" | "paired" | "triggered" | "passed" | "failed" | "closed";
type PushState = "idle" | "requesting" | "subscribed" | "denied" | "unsupported";

interface ScamPayload {
  type: string;
  sender: string;
  content: string;
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return buffer;
}

type RiskCategory = "urgency" | "money" | "link" | "impersonation" | "reward";

interface RiskHighlight {
  start: number;
  end: number;
  phrase: string;
  category: RiskCategory;
}

const RISK_PATTERNS: Array<{ category: RiskCategory; pattern: RegExp }> = [
  { category: "link", pattern: /(?:https?:\/\/)?[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/\S*)?/giu },
  { category: "urgency", pattern: /\b(?:gấp|khẩn cấp|ngay|trong \d+ giờ|24 giờ|urgent|immediately|within \d+ hours?)\b/giu },
  { category: "money", pattern: /\b(?:chuyển tiền|chuyển khoản|tiền|phí|otp|mã otp|bank account|transfer|payment|money)\b/giu },
  { category: "impersonation", pattern: /\b(?:công an|cảnh sát|bệnh viện|ngân hàng|tài khoản|xác minh|police|hospital|bank|account|verify)\b/giu },
  { category: "reward", pattern: /\b(?:trúng thưởng|nhận thưởng|quà|giải thưởng|prize|reward|won|winner)\b/giu },
];

function findRiskHighlights(content: string): RiskHighlight[] {
  const candidates: RiskHighlight[] = [];
  for (const { category, pattern } of RISK_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      if (match.index === undefined) continue;
      candidates.push({
        start: match.index,
        end: match.index + match[0].length,
        phrase: match[0],
        category,
      });
    }
  }

  return candidates
    .sort((left, right) => left.start - right.start || right.end - right.start)
    .filter((candidate, index, all) => !all.slice(0, index).some((previous) => candidate.start < previous.end && candidate.end > previous.start))
    .sort((left, right) => left.start - right.start);
}

export default function LearnerPage() {
  const { locale, copy, formatTime } = useLocale();
  const text = copy.learner;
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionStatus>("waiting");
  const [scam, setScam] = useState<ScamPayload | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [pushState, setPushState] = useState<PushState>(() =>
    typeof window !== "undefined" && "serviceWorker" in navigator ? "idle" : "unsupported"
  );
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgTime = formatTime(new Date());

  const startWaitingSession = useCallback(async () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    localStorage.removeItem("zalo_session_id");
    setShowWarning(false);
    setShowSuccess(false);
    setShowReview(false);
    setScam(null);
    setSessionId(null);
    setStatus("waiting");
    setPushState(typeof window !== "undefined" && "serviceWorker" in navigator ? "idle" : "unsupported");
    try {
      const response = await fetch("/api/session/create", { method: "POST" });
      if (!response.ok) throw new Error("Failed to create session");
      const data = await response.json() as { session_id: string };
      localStorage.setItem("zalo_session_id", data.session_id);
      setSessionId(data.session_id);
    } catch (error) {
      console.error("Session reset error:", error);
    }
  }, []);

  const closeReview = useCallback(() => {
    setShowReview(false);
    setShowWarning(false);
    setShowSuccess(false);
    setStatus("paired");
  }, []);

  useEffect(() => {
    if (!showReview) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeReview();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showReview, closeReview]);

  // Create or restore session on mount
  useEffect(() => {
    async function init() {
      try {
        // Check if there's an existing session in localStorage
        const savedId = localStorage.getItem("zalo_session_id");
        if (savedId) {
          // Verify the session still exists on the server
          const checkRes = await fetch(`/api/session/status?session_id=${savedId}`);
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            // Reuse only sessions that can still receive a pairing or simulation.
            const reusableStatuses: SessionStatus[] = ["waiting", "paired", "triggered"];
            if (reusableStatuses.includes(checkData.status as SessionStatus)) {
              setSessionId(savedId);
              setStatus(checkData.status);
              if (checkData.scam) setScam(checkData.scam);
              console.log("[Session] Restored session:", savedId);
              return;
            }
            localStorage.removeItem("zalo_session_id");
          }
        }
        await startWaitingSession();
      } catch (err) {
        console.error("Session init error:", err);
      }
    }
    init();
  }, [startWaitingSession]);

  // Register service worker + listen for messages from SW
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(console.error);

    // Listen for messages from the service worker (e.g. notification click)
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === "NOTIFICATION_CLICKED") {
        console.log("[SW Message] Notification clicked, session:", event.data.sessionId);
        // The session is already restored from localStorage in the init effect.
        // Just trigger a fresh poll to show the triggered scam message immediately.
        if (event.data.sessionId) {
          const savedId = localStorage.getItem("zalo_session_id");
          if (savedId === event.data.sessionId) {
            // Force an immediate status poll
            fetch(`/api/session/status?session_id=${savedId}`)
              .then((r) => r.json())
              .then((data) => {
                setStatus(data.status);
                if (data.scam) setScam(data.scam);
              })
              .catch(console.error);
          }
        }
      }
    };

    navigator.serviceWorker.addEventListener("message", handleSWMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleSWMessage);
    };
  }, []);

  const enableNotifications = useCallback(async () => {
    if (!sessionId) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPushState("unsupported");
      return;
    }
    setPushState("requesting");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setPushState("denied"); return; }
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) throw new Error("VAPID key missing");
      const subscription = await reg.pushManager.getSubscription() ?? await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      const response = await fetch("/api/session/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, subscription: subscription.toJSON() }),
      });
      if (!response.ok) throw new Error("Unable to save push subscription");
      setPushState("subscribed");
    } catch (err) {
      console.error("[Push] error:", err);
      setPushState("idle");
    }
  }, [sessionId]);

  const pollStatus = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/session/status?session_id=${sessionId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "closed") {
        await startWaitingSession();
        return;
      }
      setStatus(data.status);
      if (data.scam) setScam(data.scam);
    } catch { /* ignore */ }
  }, [sessionId, startWaitingSession]);

  useEffect(() => {
    if (!sessionId) return;
    pollingRef.current = setInterval(pollStatus, 2000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [sessionId, pollStatus]);

  useEffect(() => {
    if ((status === "passed" || status === "failed") && pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  }, [status]);

  const handleDelete = async () => {
    if (!sessionId) return;
    await fetch("/api/session/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, result: "passed" }),
    });
    setShowSuccess(true);
    setStatus("passed");
  };

  const handleTapLink = async () => {
    if (!sessionId) return;
    await fetch("/api/session/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, result: "failed" }),
    });
    setShowWarning(true);
    setStatus("failed");
  };

  const extractLink = (text: string) => {
    const match = text.match(/(?:https?:\/\/)?[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/\S*)?/);
    return match ? match[0] : null;
  };

  const renderMessageContent = (text: string) => {
    const link = extractLink(text);
    if (!link) return <span style={{ lineHeight: 1.6 }}>{text}</span>;
    const parts = text.split(link);
    return (
      <span style={{ lineHeight: 1.6 }}>
        {parts[0]}
        <button
          type="button"
          aria-label={locale === "en" ? `Open ${link}` : `Mở ${link}`}
          onClick={handleTapLink}
          style={{ color: "var(--primary-dark)", textDecoration: "underline", cursor: "pointer", fontWeight: 600, border: 0, padding: 0, background: "none", font: "inherit" }}
        >
          {link}
        </button>
        {parts[1]}
      </span>
    );
  };

  const reviewHighlights = scam ? findRiskHighlights(scam.content) : [];
  const riskReasonByCategory: Record<RiskCategory, string> = {
    urgency: text.riskUrgency,
    money: text.riskMoney,
    link: text.riskLink,
    impersonation: text.riskImpersonation,
    reward: text.riskReward,
  };
  const reviewCategories = Array.from(new Set(reviewHighlights.map((highlight) => highlight.category)));

  function renderReviewedMessage(content: string) {
    if (reviewHighlights.length === 0) return content;
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    reviewHighlights.forEach((highlight, index) => {
      if (highlight.start > cursor) parts.push(<span key={`text-${index}`}>{content.slice(cursor, highlight.start)}</span>);
      parts.push(
        <mark
          key={`risk-${index}`}
          className={styles.riskHighlight}
          title={riskReasonByCategory[highlight.category]}
        >
          {highlight.phrase}
        </mark>
      );
      cursor = highlight.end;
    });
    if (cursor < content.length) parts.push(<span key="text-end">{content.slice(cursor)}</span>);
    return parts;
  }

  return (
    <div className={styles.page}>
      {(showWarning || showSuccess) && (
        <div className={styles.resultOverlay} role="alertdialog" aria-modal="true" aria-labelledby="result-title">
          <div className={`${styles.resultCard} ${showWarning ? styles.resultFailure : styles.resultSuccess}`}>
            <div className={styles.resultIcon} aria-hidden="true">
              {showWarning ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
            </div>
            <p className={styles.resultKicker}>{text.training}</p>
            <h1 id="result-title">{showWarning ? text.failedTitle : text.passedTitle}</h1>
            <p>{showWarning ? text.failedBody : text.passedBody}</p>
            <button className={styles.reviewButton} type="button" onClick={() => {
              setShowWarning(false);
              setShowSuccess(false);
              setShowReview(true);
            }}>
              <MagnifyingGlass size={18} aria-hidden="true" />
              {text.reviewMessage}
            </button>
          </div>
        </div>
      )}

      {showReview && scam && (
          <div
          className={styles.reviewOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeReview();
          }}
        >
          <div className={styles.reviewPanel}>
            <div className={styles.reviewHeader}>
              <div>
                <p className={styles.resultKicker}>{text.training}</p>
                <h1 id="review-title">{text.reviewTitle}</h1>
              </div>
              <button className={styles.reviewClose} type="button" onClick={closeReview} aria-label={text.closeReview}>{text.closeReview}</button>
            </div>
            <p className={styles.reviewBody}>{text.reviewBody}</p>
            <div className={styles.reviewMessageCard}>{renderReviewedMessage(scam.content)}</div>
            <div className={styles.reviewCues}>
              <p className={styles.reviewCuesTitle}>{text.reviewCuesTitle}</p>
              {reviewCategories.length > 0 ? reviewCategories.map((category) => (
                <p className={styles.reviewCue} key={category}>
                  <span className={styles.reviewCueDot} aria-hidden="true" />
                  {riskReasonByCategory[category]}
                </p>
              )) : <p className={styles.reviewBody}>{text.reviewNoCues}</p>}
            </div>
            <button className={styles.reviewDone} type="button" onClick={closeReview}>{text.closeReview}</button>
          </div>
        </div>
      )}

      {/* ── PHONE FRAME ── */}
      <div className={styles.phone}>
        <div className={styles.chatHeader}>
          <button aria-label={locale === "en" ? "Go back" : "Quay lại"} style={{ padding: 8, background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <ChevronLeft size={32} color="white" />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "white", fontWeight: 650, fontSize: "1.1rem", lineHeight: 1.2 }}>
              {scam ? scam.sender : status === "waiting" ? text.waiting : text.connected}
            </div>
            {scam && (
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.72rem" }}>
                {text.activeNow}
              </div>
            )}
          </div>

          <LanguageSwitcher embedded showOnLearner className={styles.learnerLanguageSwitcher} />

          <button aria-label={locale === "en" ? "Call" : "Gọi điện"} style={{ padding: 8, background: "none", border: "none", cursor: "pointer" }}>
            <Phone size={27} color="white" />
          </button>
          <button aria-label={locale === "en" ? "Video call" : "Gọi video"} style={{ padding: 8, background: "none", border: "none", cursor: "pointer" }}>
            <Video size={28} color="white" />
          </button>
          <button aria-label={locale === "en" ? "More options" : "Tùy chọn khác"} style={{ padding: 8, background: "none", border: "none", cursor: "pointer" }}>
            <MoreHorizontal size={29} color="white" />
          </button>
        </div>

        {/* Chat Body */}
        <div className={styles.chatBody} aria-live="polite">

          {/* ── WAITING STATE ── */}
          {status === "waiting" && (
            <div className="animate-fade-in" style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              flex: 1, gap: 20, paddingTop: 40, paddingBottom: 40,
            }}>
              <div className={styles.waitingMark} aria-label="Second Thought">
                <span /><span /><span /><span />
              </div>

              <div style={{ textAlign: "center" }}>
                 {sessionId ? (
                   <>
                     <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 6 }}>
                       {text.deviceCode}
                     </p>
                     <div style={{
                       fontSize: "3.5rem", fontWeight: 900,
                       letterSpacing: "16px", color: "var(--primary)",
                       fontVariantNumeric: "tabular-nums",
                       textShadow: "0 2px 8px rgba(0,104,255,0.2)",
                     }}>
                       {sessionId}
                     </div>
                   </>
                 ) : (
                   <p style={{ color: "#64748b", fontSize: "0.85rem" }}>{text.creatingSession}</p>
                 )}
              </div>

              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "white", borderRadius: 24, padding: "10px 20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                <div className="dot-pulse">
                  <span /><span /><span />
                </div>
                <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 500 }}>
                  {text.waitingGuide}
                </span>
              </div>

              {/* Push Notification Banner */}
               {sessionId && pushState === "idle" && (
                <div className="animate-fade-in" style={{
                  background: "white", borderRadius: 16, padding: "16px",
                  width: "100%", maxWidth: 340,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  border: "1.5px solid #b7d7dd",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Bell size={18} color="var(--primary)" />
                    </div>
                    <div>
                       <p style={{ fontWeight: 700, color: "var(--primary-dark)", fontSize: "0.85rem", margin: 0 }}>
                         {text.enablePush}
                      </p>
                      <p style={{ color: "#64748b", fontSize: "0.75rem", margin: 0 }}>
                         {text.pushHint}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={enableNotifications}
                    style={{
                      width: "100%", padding: "10px",
                      borderRadius: 10, border: "none",
                        background: "var(--primary)",
                      color: "white", fontWeight: 700, fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                     {text.allowPush}
                  </button>
                </div>
              )}
               {sessionId && pushState === "subscribed" && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#f0fdf4", border: "1.5px solid #bbf7d0",
                  borderRadius: 12, padding: "10px 16px",
                  color: "#16a34a", fontSize: "0.82rem", fontWeight: 600,
                }}>
                  <Bell size={14} color="#16a34a" />
                   {text.pushEnabled}
                </div>
              )}
               {sessionId && pushState === "denied" && (
                <div style={{
                  background: "#fef2f2", border: "1.5px solid #fecaca",
                  borderRadius: 12, padding: "10px 16px",
                  color: "#dc2626", fontSize: "0.78rem",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <BellOff size={14} />
                   {text.pushDenied}
                </div>
              )}
            </div>
          )}

          {/* ── PAIRED STATE ── */}
          {status === "paired" && (
            <div className="animate-fade-in" style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              flex: 1, gap: 16, paddingTop: 60,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "#f0fdf4", border: "2px solid #bbf7d0",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <CheckCircle2 size={32} color="#16a34a" />
              </div>
              <p style={{ color: "#1e293b", fontWeight: 700, fontSize: "1.05rem", margin: 0 }}>{text.pairedTitle}</p>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", textAlign: "center", lineHeight: 1.6 }}>
                  {text.sessionCode}: <strong style={{ color: "var(--primary)" }}>{sessionId}</strong>
                <br />{text.waitingScenario}
              </p>
              <div className="dot-pulse"><span /><span /><span /></div>
            </div>
          )}

          {/* ── TRIGGERED STATE — Zalo Message ── */}
          {status === "triggered" && scam && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Date divider */}
              <div style={{ textAlign: "center" }}>
                <span style={{
                  background: "rgba(0,0,0,0.15)", color: "white",
                  fontSize: "0.7rem", borderRadius: 999, padding: "3px 10px",
                  fontWeight: 500,
                }}>
                  {text.today}
                </span>
              </div>

              {/* Incoming message bubble */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, maxWidth: "85%" }}>
                {/* Avatar */}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "#fdf4f4",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: "0.8rem",
                }}>
                  <Shield size={16} aria-hidden="true" />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 600, paddingLeft: 4 }}>
                    {scam.sender}
                  </div>

                  {/* Bubble */}
                  <div
                    className="animate-notification"
                    style={{
                       background: "white", borderRadius: "18px 18px 18px 4px",
                      padding: "10px 14px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                       fontSize: "1.05rem", lineHeight: 1.5, color: "#111827",
                    }}
                  >
                    {renderMessageContent(scam.content)}

                    {/* Link Preview Card */}
                    {extractLink(scam.content) && (
                      <div
                        onClick={handleTapLink}
                        style={{
                          marginTop: 10, borderRadius: 10, overflow: "hidden",
                          border: "1px solid #e2e8f0", cursor: "pointer",
                           background: "#f7f4ee",
                        }}
                      >
                        <div style={{
                           height: 6, background: "#e1f3fe",
                        }} />
                        <div style={{ padding: "10px 12px" }}>
                            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary-dark)", margin: "0 0 4px" }}>
                            {extractLink(scam.content)}
                          </p>
                          <p style={{ fontSize: "0.72rem", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                             {text.visitWebsite}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: "0.65rem", color: "#94a3b8", paddingLeft: 4 }}>
                    {msgTime}
                  </div>
                </div>
              </div>

              {/* Action Hint */}
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <p style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: 1.5 }}>
                   {text.whatDo}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={handleDelete}
                  style={{
                    flex: 1, padding: "12px 8px",
                    borderRadius: 12, border: "2px solid #e2e8f0",
                    background: "white", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 8, fontWeight: 700, color: "#dc2626", fontSize: "0.9rem",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fca5a5"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                >
                  <Trash2 size={18} />
                   {text.delete}
                </button>
              </div>

              <p style={{ fontSize: "0.7rem", color: "#94a3b8", textAlign: "center", lineHeight: 1.5 }}>
                 {text.linkHint}
              </p>
            </div>
          )}
        </div>

        <div className={styles.footerBar}>
          <button aria-label={locale === "en" ? "Stickers" : "Nhãn dán"} style={{ padding: 6, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
             <Smile size={28} color="var(--primary-dark)" />
          </button>

          {/* Input */}
          <div style={{
            flex: 1, background: "#f1f5f9", borderRadius: 24,
            padding: "9px 16px",
            fontSize: "0.9rem", color: "#94a3b8",
            userSelect: "none",
          }}>
             {text.message}
          </div>

          <button aria-label={locale === "en" ? "Record voice" : "Ghi âm"} style={{ padding: 6, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
             <Mic size={27} color="var(--primary-dark)" />
          </button>
          <button aria-label={locale === "en" ? "Send image" : "Gửi hình ảnh"} style={{ padding: 6, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
             <ImageIcon size={27} color="var(--primary-dark)" />
          </button>
          <button aria-label={locale === "en" ? "More message options" : "Tùy chọn tin nhắn khác"} style={{ padding: 6, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
             <MoreHorizontal size={28} color="var(--primary-dark)" />
          </button>
        </div>
      </div>
    </div>
  );
}
