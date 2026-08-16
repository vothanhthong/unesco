"use client";

import styles from "@/components/toolkit/toolkit.module.css";
import { useLocale } from "@/i18n/LocaleProvider";

export default function ToolkitLoading() {
  const { copy } = useLocale();
  return (
    <div className={styles.loadingState} role="status" aria-live="polite">
      <div className={styles.loadingPanel}>
        <div className={styles.loadingMark} aria-hidden="true" />
        <p className={styles.loadingLabel}>{copy.toolkit.loading}</p>
      </div>
    </div>
  );
}
