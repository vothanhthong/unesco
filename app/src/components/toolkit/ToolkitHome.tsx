"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Megaphone, ShieldCheck } from "@phosphor-icons/react";
import ToolkitPageHeader from "@/components/toolkit/ToolkitPageHeader";
import styles from "@/components/toolkit/toolkit.module.css";
import { useLocale } from "@/i18n/LocaleProvider";
import { Card } from "@/components/ui/card";

export default function ToolkitHome() {
  const { copy } = useLocale();
  const text = copy.home;

  return (
    <>
      <ToolkitPageHeader
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
      />

      <div className={styles.sectionRule} />
      <p className={styles.sectionLabel}>{text.choose}</p>

      <section className={styles.moduleGrid} aria-label={text.modules}>
        <Card className={styles.moduleCard}>
          <Link className={styles.moduleLink} href="/toolkit/train">
            <div>
              <span className={`${styles.moduleNumber} ${styles.moduleNumberOrange}`}>TRAIN</span>
              <h2>{text.trainTitle}</h2>
              <p>{text.trainBody}</p>
            </div>
            <span className={styles.moduleFooter}>
              <span><BookOpen size={15} aria-hidden="true" /> {text.openTrain}</span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </span>
          </Link>
        </Card>

        <Card className={styles.moduleCard}>
          <Link className={styles.moduleLink} href="/toolkit/contribute">
            <div>
              <span className={`${styles.moduleNumber} ${styles.moduleNumberPink}`}>CONTRIBUTE</span>
              <h2>{text.contributeTitle}</h2>
              <p>{text.contributeBody}</p>
            </div>
            <span className={styles.moduleFooter}>
              <span><Megaphone size={15} aria-hidden="true" /> {text.openContribute}</span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </span>
          </Link>
        </Card>
      </section>

      <section className={styles.contentGrid} aria-labelledby="trust-title">
        <div className={styles.contentPanel}>
          <p className={styles.eyebrow}>{text.sharedRule}</p>
          <h2 id="trust-title">{text.ruleTitle}</h2>
          <p>{text.ruleBody}</p>
        </div>
        <div className={styles.statusPanel}>
          <span className={styles.statusTag}><ShieldCheck size={14} aria-hidden="true" /> {text.reviewFirst}</span>
          <h2>{text.trustTitle}</h2>
          <p>{text.trustBody}</p>
        </div>
      </section>
    </>
  );
}
