"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import styles from "./toolkit.module.css";

export default function ToolkitFooter() {
  const { copy } = useLocale();
  return <footer className={styles.shellFooter}><p>Second Thought / TRAIN + CONTRIBUTE</p><p>{copy.toolkit.footer}</p></footer>;
}
