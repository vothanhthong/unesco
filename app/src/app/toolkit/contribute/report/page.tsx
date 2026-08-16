"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle, LockKey as LockKeyhole } from "@phosphor-icons/react";
import ToolkitPageHeader from "@/components/toolkit/ToolkitPageHeader";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/LocaleProvider";
import styles from "@/components/toolkit/toolkit.module.css";

const SOURCE_TYPES = ["message", "email", "screenshot", "audio", "story"] as const;
type SourceType = (typeof SOURCE_TYPES)[number];

interface ReportRecord {
  id: string;
  source_type: SourceType;
  description: string;
  locale: string;
  status: string;
  pii_status: string;
  created_at: string;
  report_attachments?: Array<{ id: string; file_name: string }>;
}

function formatReportDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function ContributeReportPage() {
  const { locale, copy } = useLocale();
  const text = copy.contribute.report;
  const [sourceType, setSourceType] = useState<SourceType>("message");
  const [description, setDescription] = useState("");
  const [context, setContext] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [redactionConfirmed, setRedactionConfirmed] = useState(false);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [authRequired, setAuthRequired] = useState(false);
  const [loadingReports, setLoadingReports] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadReports() {
      try {
        const response = await fetch("/api/contribute/reports", { cache: "no-store" });
        if (response.status === 401) {
          if (!cancelled) setAuthRequired(true);
          return;
        }
        if (!response.ok) throw new Error("reports request failed");
        const data = (await response.json()) as { reports: ReportRecord[] };
        if (!cancelled) setReports(data.reports);
      } catch {
        if (!cancelled) setFormError(text.error);
      } finally {
        if (!cancelled) setLoadingReports(false);
      }
    }
    void loadReports();
    return () => { cancelled = true; };
  }, [text.error]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!description.trim() || description.trim().length < 20 || !privacyConsent || !redactionConfirmed) {
      setFormError(text.validation);
      return;
    }

    setSubmitting(true);
    const form = new FormData();
    form.set("source_type", sourceType);
    form.set("description", description);
    form.set("context", context);
    form.set("locale", locale === "vi" ? "vi-VN" : "en-US");
    form.set("privacy_consent", String(privacyConsent));
    form.set("redaction_confirmed", String(redactionConfirmed));
    files.forEach((file) => form.append("attachments", file));

    try {
      const response = await fetch("/api/contribute/reports", { method: "POST", body: form });
      if (response.status === 401) {
        setAuthRequired(true);
        return;
      }
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || text.error);
      }
      const data = (await response.json()) as { report: ReportRecord };
      setReports((current) => [data.report, ...current]);
      setDescription("");
      setContext("");
      setFiles([]);
      setPrivacyConsent(false);
      setRedactionConfirmed(false);
      setSubmitted(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : text.error);
    } finally {
      setSubmitting(false);
    }
  }

  if (authRequired) {
    return (
      <>
        <ToolkitPageHeader eyebrow={text.eyebrow} title={text.authTitle} description={text.authBody}>
          <Link className={styles.textLink} href="/toolkit/login">
            {text.signIn} <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </ToolkitPageHeader>
      </>
    );
  }

  return (
    <>
      <ToolkitPageHeader eyebrow={text.eyebrow} title={text.title} description={text.description}>
        <Link className={styles.textLink} href="/toolkit/contribute">
          <ArrowLeft size={15} aria-hidden="true" /> {text.back}
        </Link>
      </ToolkitPageHeader>

      <div className={styles.reportLayout}>
        <section className={styles.reportPanel} aria-labelledby="report-form-title">
          {submitted ? (
            <div className={styles.reportSuccess} role="status">
              <CheckCircle size={28} aria-hidden="true" />
              <h2 id="report-form-title">{text.successTitle}</h2>
              <p>{text.successBody}</p>
              <Button type="button" onClick={() => setSubmitted(false)}>{text.reportAnother}</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.reportFormHeader}>
                <p className={styles.eyebrow}>{text.sourceType}</p>
                <h2 id="report-form-title">{text.descriptionLabel}</h2>
              </div>

              <label className={styles.reportField}>
                <span>{text.sourceType}</span>
                <select value={sourceType} onChange={(event) => setSourceType(event.target.value as SourceType)}>
                  {SOURCE_TYPES.map((type) => <option key={type} value={type}>{text.sourceOptions[type]}</option>)}
                </select>
              </label>

              <label className={styles.reportField}>
                <span>{text.descriptionLabel}</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={text.descriptionPlaceholder}
                  rows={7}
                  required
                />
              </label>

              <label className={styles.reportField}>
                <span>{text.contextLabel}</span>
                <textarea
                  value={context}
                  onChange={(event) => setContext(event.target.value)}
                  placeholder={text.contextPlaceholder}
                  rows={4}
                />
              </label>

              <fieldset className={styles.reportFieldset}>
                <legend>{text.localeLabel}</legend>
                <label><input type="radio" name="report-locale" checked={locale === "vi"} readOnly /> {text.localeVi}</label>
                <label><input type="radio" name="report-locale" checked={locale === "en"} readOnly /> {text.localeEn}</label>
              </fieldset>

              <label className={styles.reportField}>
                <span>{text.attachmentsLabel}</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,application/pdf,text/plain,audio/mpeg,audio/mp4,audio/wav,audio/webm"
                  onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 5))}
                />
                <small>{text.attachmentsHint}</small>
                {files.length > 0 && <small>{files.map((file) => file.name).join(", ")}</small>}
              </label>

              <div className={styles.reportPrivacy}>
                <LockKeyhole size={20} aria-hidden="true" />
                <div>
                  <strong>{text.privacyTitle}</strong>
                  <p>{text.privacyBody}</p>
                </div>
              </div>

              <label className={styles.reportCheck}><input type="checkbox" checked={privacyConsent} onChange={(event) => setPrivacyConsent(event.target.checked)} /> {text.consent}</label>
              <label className={styles.reportCheck}><input type="checkbox" checked={redactionConfirmed} onChange={(event) => setRedactionConfirmed(event.target.checked)} /> {text.redaction}</label>

              {formError && <p className={styles.actionError} role="alert">{formError}</p>}
              <Button type="submit" disabled={submitting}>{submitting ? text.submitting : text.submit}</Button>
            </form>
          )}
        </section>

        <aside className={styles.reportHistory} aria-labelledby="report-history-title">
          <p className={styles.eyebrow}>{text.historyTitle}</p>
          <h2 id="report-history-title">{text.historyTitle}</h2>
          {loadingReports ? <p className={styles.emptyCopy}>{copy.train.loading}</p> : reports.length === 0 ? <p className={styles.emptyCopy}>{text.noReports}</p> : (
            <div className={styles.reportHistoryList}>
              {reports.map((report) => (
                <article key={report.id} className={styles.reportHistoryItem}>
                  <div>
                    <strong>{text.sourceOptions[report.source_type]}</strong>
                    <small>{formatReportDate(report.created_at, locale)}</small>
                  </div>
                  <span className={report.pii_status === "needs_redaction" ? styles.reportNeedsRedaction : styles.reportSubmitted}>
                    {report.pii_status === "needs_redaction" ? text.needsRedaction : report.status === "processing" ? text.processing : text.submitted}
                  </span>
                  {report.report_attachments?.length ? <small>{report.report_attachments.length} · {text.privateEvidence}</small> : null}
                </article>
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
