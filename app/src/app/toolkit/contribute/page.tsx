"use client";

import CommunityTrends from "@/components/contribute/CommunityTrends";
import CommunityImpact from "@/components/contribute/CommunityImpact";
import styles from "@/components/toolkit/toolkit.module.css";

export default function ContributeOverview() {
  return (
    <>
      <CommunityTrends />
      <CommunityImpact />
      <section id="checkmate-application" className={styles.checkmateCta} aria-labelledby="checkmate-title">
        <div>
          <h2 id="checkmate-title">Want to join our CheckMATE Program?</h2>
          <p>Turn your contribution into real-world impact. Join CheckMATE to help older adults build confidence navigating today&apos;s media and information landscape through community-based learning sessions.</p>
        </div>
        <a className={styles.checkmateAction} href="/toolkit/train">Apply now <span aria-hidden="true">→</span></a>
      </section>
    </>
  );
}
