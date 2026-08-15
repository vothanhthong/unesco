"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Car,
  CreditCard,
  Gift,
  Package,
  Users,
  VideoCamera as Video,
  Ambulance,
  Briefcase,
  TrendUp as TrendingUp,
  Heart,
  PaperPlaneTilt as Send,
  Radio,
  Pencil,
  X,
  CheckCircle as CheckCircle2,
  Warning as AlertTriangle,
  Shield,
  CaretRight as ChevronRight,
  WifiHigh as Wifi,
} from "@phosphor-icons/react";
import { localizeScenario, SCENARIO_DEFINITIONS, type ScenarioDefinition, type ScenarioGroup } from "@/lib/scenarios";
import { useLocale } from "@/i18n/LocaleProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import styles from "./trigger.module.css";

type SessionStatus = "waiting" | "paired" | "triggered" | "passed" | "failed" | "closed";

type Scenario = ScenarioDefinition & { icon: React.ReactNode };

const SCENARIO_ICONS: Record<number, React.ReactNode> = {
  1: <Car size={22} />,
  2: <CreditCard size={22} />,
  3: <Gift size={22} />,
  4: <Package size={22} />,
  5: <Users size={22} />,
  6: <Video size={22} />,
  7: <Ambulance size={22} />,
  8: <Briefcase size={22} />,
  9: <TrendingUp size={22} />,
  10: <Heart size={22} />,
};

const SCENARIOS: Scenario[] = SCENARIO_DEFINITIONS.map((scenario) => ({
  ...scenario,
  icon: SCENARIO_ICONS[scenario.id],
}));

function getInitialTriggerContext(initialSessionId = "", initialScenarioSlug?: string): { sessionId: string; scenario: Scenario | null } {
  if (initialSessionId) {
    return {
      sessionId: initialSessionId,
      scenario: SCENARIOS.find((item) => item.slug === initialScenarioSlug) ?? null,
    };
  }
  if (typeof window === "undefined") return { sessionId: "", scenario: null };

  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id")?.replace(/\D/g, "").slice(0, 4) ?? "";
  const scenario = SCENARIOS.find((item) => item.slug === params.get("scenario_slug")) ?? null;
  return { sessionId, scenario };
}

const GROUP_ORDER: ScenarioGroup[] = ["message", "call", "investment"];
interface TriggerPageProps {
  embedded?: boolean;
  initialSessionId?: string;
  initialScenarioSlug?: string;
  initialFamilyMemberId?: string;
}

export default function TriggerPage({ embedded = false, initialSessionId, initialScenarioSlug, initialFamilyMemberId }: TriggerPageProps = {}) {
  const { locale, copy } = useLocale();
  const text = copy.trigger;
  const [initialContext] = useState(() => getInitialTriggerContext(initialSessionId, initialScenarioSlug));
  const initialScenario = initialContext.scenario ? localizeScenario(initialContext.scenario, locale) : null;
  const [step, setStep] = useState<"pairing" | "dashboard" | "sent">("pairing");
  const [code, setCode] = useState(initialContext.sessionId);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(initialScenario);
  const [activeGroup, setActiveGroup] = useState<ScenarioGroup>("message");
  const [editedSender, setEditedSender] = useState(initialScenario?.sender ?? "");
  const [editedContent, setEditedContent] = useState(initialScenario?.content ?? "");
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleConnect = async () => {
    if (code.length !== 4) { setError(locale === "en" ? "Enter the four-digit code" : "Vui lòng nhập đúng mã 4 chữ số"); return; }
    setError(""); setConnecting(true);
    try {
      const res = await fetch("/api/session/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: code,
          ...(initialScenarioSlug ? { scenario_slug: initialScenarioSlug } : {}),
          ...(initialFamilyMemberId && initialScenarioSlug ? { family_member_id: initialFamilyMemberId } : {}),
        }),
      });
      if (!res.ok) { setError(locale === "en" ? "Session not found. Check the code and try again." : "Không tìm thấy phiên. Kiểm tra lại mã và thử lại."); setConnecting(false); return; }
      setSessionId(code);
      setSessionStatus("paired");
      setStep("dashboard");
    } catch { setError(locale === "en" ? "Connection failed. Try again." : "Kết nối thất bại. Vui lòng thử lại."); }
    setConnecting(false);
  };

  const handleSelectScenario = (s: Scenario) => {
    setSelectedScenario(s);
    setEditedSender(s.sender);
    setEditedContent(s.content);
  };

  const handleSend = async () => {
    if (!sessionId || !selectedScenario) return;
    setSending(true);
    try {
      await fetch("/api/scam/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          type: "sms",
          sender: editedSender,
          content: editedContent,
        }),
      });
      setSessionStatus("triggered");
      setStep("sent");
    } catch { setError(locale === "en" ? "Sending failed. Try again." : "Gửi thất bại. Vui lòng thử lại."); }
    setSending(false);
  };

  const pollStatus = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/session/status?session_id=${sessionId}`);
      if (!res.ok) return;
      const data = await res.json();
      setSessionStatus(data.status);
    } catch { /* ignore */ }
  }, [sessionId]);

  useEffect(() => {
    if (step === "sent" && sessionId) {
      pollingRef.current = setInterval(pollStatus, 2000);
      return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }
  }, [step, sessionId, pollStatus]);

  useEffect(() => {
    if ((sessionStatus === "passed" || sessionStatus === "failed") && pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  }, [sessionStatus]);

  const localizedScenarios = SCENARIOS.map((scenario) => localizeScenario(scenario, locale));
  const visibleScenarios = localizedScenarios.filter((scenario) => scenario.group === activeGroup);
  const groupMeta = text.groups;
  const statusLabels = {
    waiting: locale === "en" ? "Waiting" : "Đang chờ",
    paired: locale === "en" ? "Paired" : "Đã kết nối",
    triggered: locale === "en" ? "Awaiting response" : "Đang chờ phản hồi",
    passed: locale === "en" ? "Safe" : "An toàn",
    failed: locale === "en" ? "Needs guidance" : "Cần hướng dẫn thêm",
    closed: locale === "en" ? "Closed" : "Đã đóng",
  } satisfies Record<SessionStatus, string>;

  const resetScenario = () => {
    setStep("dashboard");
    setSessionStatus("paired");
    setSelectedScenario(null);
    setError("");
  };

  const closeActiveSession = async () => {
    if (!sessionId || closing) return;
    setClosing(true);
    setError("");
    try {
      const response = await fetch("/api/session/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!response.ok) {
        setError(text.closeError);
        return;
      }
      if (pollingRef.current) clearInterval(pollingRef.current);
      setStep("pairing");
      setCode("");
      setSessionId(null);
      setSessionStatus(null);
      setSelectedScenario(null);
      setEditedSender("");
      setEditedContent("");
    } catch {
      setError(text.closeError);
    } finally {
      setClosing(false);
    }
  };

  return (
    <main className={styles.workspace}>
      {!embedded && (
        <header className={styles.topbar}>
          <div className={styles.brandLockup}>
            <div className={styles.unescoMark} aria-hidden="true" />
            <div>
              <p className={styles.brandName}>{text.brandMeta}</p>
              <p className={styles.projectName}>{text.projectName}</p>
            </div>
          </div>

          {sessionId && sessionStatus && (
            <div className={styles.sessionSummary}>
              <span className={`${styles.status} ${styles[sessionStatus]}`}>
                {statusLabels[sessionStatus]}
              </span>
              <span className={styles.sessionCode}>Thiết bị {sessionId}</span>
            </div>
          )}
        </header>
      )}

      {step === "pairing" && (
        <section className={styles.pairingShell} aria-labelledby="pairing-title">
          <div className={styles.pairingIntro}>
            <p className={styles.kicker}>{text.pairingKicker}</p>
            <h1 id="pairing-title">{text.pairingTitle}</h1>
            <p>{text.pairingBody}</p>
          </div>

          <div className={styles.pairingPanel}>
            <div className={styles.pairingIcon}><Wifi size={26} aria-hidden="true" /></div>
            <label htmlFor="device-code">{text.deviceCode}</label>
            <p className={styles.helper}>{text.codeHelper}</p>
            <Input
              id="device-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className={styles.codeInput}
              placeholder="1234"
              maxLength={4}
              value={code}
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, "").slice(0, 4));
                setError("");
              }}
              onKeyDown={(event) => event.key === "Enter" && handleConnect()}
              aria-describedby={error ? "pairing-error" : undefined}
            />
            {error && <p id="pairing-error" className={styles.errorText}>{error}</p>}
            <Button
              className={styles.shadcnButton}
              onClick={handleConnect}
              disabled={connecting || code.length !== 4}
            >
              {connecting ? text.connecting : text.connect}
            </Button>
          </div>
        </section>
      )}

      {step === "dashboard" && (
        <section className={styles.dashboard} aria-labelledby="dashboard-title">
          <div className={styles.dashboardHeading}>
            <div>
              <p className={styles.kicker}>{text.guideTools}</p>
              <h1 id="dashboard-title">{text.dashboardTitle}</h1>
              <p>{text.dashboardBody}</p>
            </div>
            <div className={styles.sessionMetric}>
              <span>{text.activeSession}</span>
              <strong>{sessionId}</strong>
              <button className={styles.closeSessionButton} type="button" onClick={() => void closeActiveSession()} disabled={closing}>
                <X size={14} aria-hidden="true" />
                {text.closeSession}
              </button>
            </div>
          </div>

          <div className={styles.dashboardGrid}>
            <nav className={styles.categoryNav} aria-label={text.scenarioGroups}>
              {GROUP_ORDER.map((group) => {
                const count = SCENARIOS.filter((scenario) => scenario.group === group).length;
                return (
                  <button
                    key={group}
                    className={activeGroup === group ? styles.activeCategory : styles.categoryButton}
                    onClick={() => {
                      setActiveGroup(group);
                      setSelectedScenario(null);
                      setError("");
                    }}
                    aria-pressed={activeGroup === group}
                  >
                    <span>{groupMeta[group].shortLabel}</span>
                    <span>{count.toString().padStart(2, "0")}</span>
                  </button>
                );
              })}
              <p className={styles.categoryDescription}>{groupMeta[activeGroup].description}</p>
            </nav>

            <div className={styles.scenarioColumn}>
              <div className={styles.columnHeading}>
                 <h2>{groupMeta[activeGroup].label}</h2>
                 <span>{visibleScenarios.length} {locale === "en" ? "scenarios" : "tình huống"}</span>
              </div>
              <div className={styles.scenarioList}>
                {visibleScenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    className={`${styles.scenarioButton} ${selectedScenario?.id === scenario.id ? styles.selectedScenario : ""}`}
                    onClick={() => {
                      if (selectedScenario?.id === scenario.id) {
                        setSelectedScenario(null);
                        return;
                      }
                      handleSelectScenario(scenario);
                    }}
                    aria-pressed={selectedScenario?.id === scenario.id}
                  >
                    <span className={styles.scenarioIcon}>{scenario.icon}</span>
                    <span className={styles.scenarioCopy}>
                      <strong>{scenario.title}</strong>
                      <small>{scenario.sender}</small>
                    </span>
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            <aside className={styles.editorPanel} aria-live="polite">
              {selectedScenario ? (
                <>
                  <div className={styles.editorHeading}>
                    <div>
                       <span>{text.selectedScenario}</span>
                      <h2>{selectedScenario.title}</h2>
                    </div>
                    <button
                      className={styles.iconButton}
                      onClick={() => setSelectedScenario(null)}
                       aria-label={text.closeEditor}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className={styles.formGroup}>
                     <label htmlFor="sender"><Pencil size={14} /> {text.sender}</label>
                   <Input
                      id="sender"
                      type="text"
                      value={editedSender}
                      onChange={(event) => setEditedSender(event.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                     <label htmlFor="message"><Pencil size={14} /> {text.message}</label>
                     <Textarea
                      id="message"
                      rows={7}
                      value={editedContent}
                      onChange={(event) => setEditedContent(event.target.value)}
                    />
                     <p className={styles.helper}>{text.editHelper}</p>
                  </div>

                  {error && <p className={styles.errorText}>{error}</p>}
                  <Button
                    className={styles.shadcnButton}
                    onClick={handleSend}
                    disabled={sending || !editedSender || !editedContent}
                  >
                    <Send data-icon="inline-start" aria-hidden="true" />
                     {sending ? text.sending : text.send}
                  </Button>
                </>
              ) : (
                <div className={styles.editorEmpty}>
                    <h2>{text.chooseScenario}</h2>
                   <p>{text.chooseScenarioBody}</p>
                </div>
              )}
            </aside>
          </div>
        </section>
      )}

      {step === "sent" && (
        <section className={styles.resultShell} aria-live="polite">
          {sessionStatus === "triggered" && (
            <div className={styles.resultPanel}>
              <div className={styles.resultIcon}><Radio size={30} /></div>
               <p className={styles.kicker}>{text.waitingSimulation}</p>
               <h1>{text.sentTitle} {sessionId}.</h1>
                <p>{text.waitingResponse}</p>
                <div className={styles.waitingBar} aria-label={text.waitingAria}><span /></div>
                <button className={styles.closeSessionButton} type="button" onClick={() => void closeActiveSession()} disabled={closing}><X size={14} aria-hidden="true" /> {text.closeSession}</button>
             </div>
          )}

          {sessionStatus === "passed" && (
            <div className={`${styles.resultPanel} ${styles.successPanel}`}>
              <div className={styles.resultIcon}><CheckCircle2 size={32} /></div>
               <p className={styles.kicker}>{text.result} {sessionId}</p>
               <h1>{text.passedTitle}</h1>
               <p>{text.passedBody}</p>
                <div className={styles.resultNote}><Shield size={17} /> {text.passedNote}</div>
                 <Button variant="outline" className={styles.secondaryButton} onClick={resetScenario}>{text.anotherScenario}</Button>
                 <Link className={styles.resultLink} href="/toolkit/train">{text.historyDebrief}</Link>
            </div>
          )}

          {sessionStatus === "failed" && (
            <div className={`${styles.resultPanel} ${styles.failurePanel}`}>
              <div className={styles.resultIcon}><AlertTriangle size={32} /></div>
               <p className={styles.kicker}>{text.result} {sessionId}</p>
               <h1>{text.failedTitle}</h1>
               <p>{text.failedBody}</p>
                <div className={styles.resultNote}><AlertTriangle size={17} /> {text.failedNote}</div>
                 <button className={styles.secondaryButton} onClick={resetScenario}>{text.anotherScenario}</button>
                 <Link className={styles.resultLink} href="/toolkit/train">{text.retryGuidance}</Link>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
