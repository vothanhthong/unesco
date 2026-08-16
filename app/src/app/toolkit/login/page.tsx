"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Envelope as Mail, PaperPlaneTilt as Send } from "@phosphor-icons/react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import ToolkitPageHeader from "@/components/toolkit/ToolkitPageHeader";
import styles from "@/components/toolkit/toolkit.module.css";
import { useLocale } from "@/i18n/LocaleProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ToolkitLoginPage() {
  const { copy } = useLocale();
  const text = copy.login;
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    setMessage("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(text.missingConfig);
      setSending(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/toolkit/train` },
    });

    if (authError) setError(text.sendError);
    else setMessage(text.sent);
    setSending(false);
  }

  return (
    <>
      <ToolkitPageHeader
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
      />
      <section className={styles.authPanel} aria-labelledby="login-title">
        <div className={styles.authIcon}><Mail size={22} aria-hidden="true" /></div>
        <h2 id="login-title">{text.heading}</h2>
        <p className={styles.authHint}>{text.hint}</p>
        <form className={styles.authForm} onSubmit={handleSubmit}>
          <label htmlFor="facilitator-email">{text.email}</label>
          <Input
            id="facilitator-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-describedby={error ? "login-error" : message ? "login-message" : undefined}
            aria-invalid={Boolean(error)}
          />
          {error && <p id="login-error" className={styles.formError} role="alert">{error}</p>}
          {message && <p id="login-message" className={styles.formMessage} role="status">{message}</p>}
          <Button className={styles.shadcnAction} type="submit" disabled={sending}>
            <Send size={16} aria-hidden="true" />
            {sending ? text.sending : text.send}
          </Button>
        </form>
        <Link className={styles.textLink} href="/toolkit">
          <ArrowLeft size={16} aria-hidden="true" /> {text.back}
        </Link>
      </section>
    </>
  );
}
