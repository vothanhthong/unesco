"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import styles from "./homepage.module.css";

const ease = [0.22, 1, 0.36, 1] as const;

type CollagePhoto = {
  id: string;
  alt: string;
  desktop: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    width: string;
    height: string;
    zIndex: number;
  };
  mobileOrder: number;
  mobileShape: "portrait" | "landscape";
  delay: number;
  crop: { backgroundPosition: string; backgroundSize: string };
  enterFrom: { x: number; y: number; rotate: number };
};

const photos: CollagePhoto[] = [
  { id: "unesco", alt: "UNESCO identity mark", desktop: { top: "7%", left: "7%", width: "144px", height: "42px", zIndex: 1 }, mobileOrder: 1, mobileShape: "landscape", delay: 0.05, crop: { backgroundPosition: "7% 6%", backgroundSize: "900%" }, enterFrom: { x: -18, y: -12, rotate: -1 } },
  { id: "learning-group", alt: "Older adults learning together in a workshop", desktop: { top: "8%", left: "18%", width: "240px", height: "145px", zIndex: 1 }, mobileOrder: 2, mobileShape: "landscape", delay: 0.18, crop: { backgroundPosition: "28% 9%", backgroundSize: "640%" }, enterFrom: { x: -28, y: -22, rotate: -2 } },
  { id: "phone-practice", alt: "Older adult practising safely on a phone", desktop: { top: "24%", left: "8%", width: "260px", height: "166px", zIndex: 1 }, mobileOrder: 3, mobileShape: "landscape", delay: 0.26, crop: { backgroundPosition: "15% 19%", backgroundSize: "650%" }, enterFrom: { x: -30, y: 18, rotate: 2 } },
  { id: "intergenerational-help", alt: "Young facilitator supporting an older adult", desktop: { top: "8%", right: "19%", width: "218px", height: "156px", zIndex: 1 }, mobileOrder: 4, mobileShape: "landscape", delay: 0.34, crop: { backgroundPosition: "65% 9%", backgroundSize: "690%" }, enterFrom: { x: 28, y: -22, rotate: 2 } },
  { id: "community-session", alt: "Community group learning together", desktop: { top: "18%", right: "7%", width: "258px", height: "156px", zIndex: 1 }, mobileOrder: 5, mobileShape: "landscape", delay: 0.42, crop: { backgroundPosition: "82% 17%", backgroundSize: "590%" }, enterFrom: { x: 30, y: 14, rotate: -2 } },
  { id: "elder-portrait", alt: "Older community member taking part in the programme", desktop: { bottom: "10%", left: "8%", width: "170px", height: "290px", zIndex: 1 }, mobileOrder: 6, mobileShape: "portrait", delay: 0.9, crop: { backgroundPosition: "18% 53%", backgroundSize: "930%" }, enterFrom: { x: -24, y: 26, rotate: -2 } },
  { id: "home-portrait", alt: "Older adult at home", desktop: { bottom: "7%", left: "22%", width: "138px", height: "190px", zIndex: 2 }, mobileOrder: 7, mobileShape: "portrait", delay: 0.98, crop: { backgroundPosition: "10% 78%", backgroundSize: "820%" }, enterFrom: { x: -14, y: 30, rotate: 2 } },
  { id: "outdoor-portrait", alt: "Older community member seated outdoors", desktop: { bottom: "10%", right: "8%", width: "170px", height: "270px", zIndex: 2 }, mobileOrder: 8, mobileShape: "portrait", delay: 1.06, crop: { backgroundPosition: "80% 52%", backgroundSize: "1150%" }, enterFrom: { x: 26, y: 28, rotate: 2 } },
  { id: "assisted-learning", alt: "Facilitator helping older adults use a phone", desktop: { bottom: "7%", right: "22%", width: "250px", height: "144px", zIndex: 1 }, mobileOrder: 9, mobileShape: "landscape", delay: 1.18, crop: { backgroundPosition: "64% 80%", backgroundSize: "640%" }, enterFrom: { x: 24, y: 24, rotate: -2 } },
];

function entrance(delay: number, reducedMotion: boolean | null, y = 42) {
  return {
    initial: reducedMotion ? false : { opacity: 0, y, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: reducedMotion ? { duration: 0 } : { duration: 0.72, delay, ease },
  };
}

export default function HomePage() {
  const reducedMotion = useReducedMotion();

  return (
    <main className={styles.page}>
      <header className={styles.hero} aria-labelledby="homepage-title">
        <div className={styles.collage} aria-label="Documentary photos from intergenerational digital-learning sessions">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              className={`${styles.photo} ${photo.mobileShape === "portrait" ? styles.photoPortrait : styles.photoLandscape}`}
              role="img"
              aria-label={photo.alt}
              style={{ ...photo.desktop, order: photo.mobileOrder, backgroundPosition: photo.crop.backgroundPosition, backgroundSize: photo.crop.backgroundSize } as CSSProperties}
              initial={reducedMotion ? false : { opacity: 0, ...photo.enterFrom }}
              animate={reducedMotion ? undefined : { opacity: 1, x: 0, y: 0, rotate: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.72, delay: photo.delay, ease }}
            />
          ))}
        </div>

        <div className={styles.content}>
          <motion.p className={styles.tagline} {...entrance(0.48, reducedMotion, 24)}>Think twice. Stay safe. Together.</motion.p>
          <h1 id="homepage-title" className={styles.title}>
            <motion.span className={styles.second} {...entrance(0.62, reducedMotion, 38)}>SECOND</motion.span>
            <motion.span className={styles.thought} {...entrance(0.76, reducedMotion, 42)}>THOUGHT</motion.span>
          </h1>
          <motion.p className={styles.statement} {...entrance(0.92, reducedMotion, 24)}>
            A YOUTH-LED <strong>SCAM SIMULATION ECOSYSTEM</strong> WHERE <span className={styles.realWorld}>REAL-WORLD</span> SCAM CASES ARE CONTINUOUSLY TRANSFORMED INTO SAFE, EXPERIENTIAL MIL LEARNING.
          </motion.p>
          <motion.div className={styles.actions} {...entrance(1.44, reducedMotion, 24)}>
            <p>Choose how you would like to take part</p>
            <nav className={styles.roleLinks} aria-label="Choose a role">
              <motion.div whileHover={reducedMotion ? undefined : { y: -2 }} whileTap={reducedMotion ? undefined : { scale: 0.98 }}>
                <Link className={`${styles.roleLink} ${styles.learnerLink}`} href="/learner">Start as a Learner <span aria-hidden="true">→</span></Link>
              </motion.div>
              <motion.div whileHover={reducedMotion ? undefined : { y: -2 }} whileTap={reducedMotion ? undefined : { scale: 0.98 }}>
                <Link className={`${styles.roleLink} ${styles.facilitatorLink}`} href="/toolkit">Explore the Facilitator Toolkit <span aria-hidden="true">→</span></Link>
              </motion.div>
            </nav>
          </motion.div>
          <motion.a className={styles.scrollLink} href="#simulator" {...entrance(1.78, reducedMotion, 18)}>Explore the simulator <span aria-hidden="true">↓</span></motion.a>
        </div>
      </header>
      <section id="simulator" className={styles.simulator} aria-labelledby="simulator-title">
        <div className={styles.simulatorInner}>
          <p className={styles.sectionEyebrow}>A safe place to rehearse</p>
          <h2 id="simulator-title">Practise. Pause. Protect.</h2>
          <p>Step into a safe scam simulation, make a choice, see what could happen, and learn how to respond with confidence.</p>
          <div className={styles.futureSurface} aria-label="Future simulator content area"><span>SIMULATOR COMING NEXT</span></div>
        </div>
      </section>
    </main>
  );
}