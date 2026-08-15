"use client";

import { ArrowClockwise as RefreshCcw } from "@phosphor-icons/react";
import styles from "./toolkit.module.css";
import { useLocale } from "@/i18n/LocaleProvider";

interface ToolkitFeedbackProps {
  reset: () => void;
}

export default function ToolkitFeedback({ reset }: ToolkitFeedbackProps) {
  const { copy } = useLocale();
  return (
    <div className={styles.errorState}>
      <section className={styles.errorPanel} aria-labelledby="toolkit-error-title">
        <p className={styles.eyebrow}>{copy.toolkit.errorEyebrow}</p>
        <h2 id="toolkit-error-title">{copy.toolkit.errorTitle}</h2>
        <p>{copy.toolkit.errorBody}</p>
        <button className={styles.errorAction} type="button" onClick={reset}>
          <RefreshCcw size={15} aria-hidden="true" /> {copy.toolkit.retry}
        </button>
      </section>
    </div>
  );
}
