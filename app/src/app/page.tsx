"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./homepage.module.css";

const ease = [0.22, 1, 0.36, 1] as const;

const photos = [
  { className: "unesco", label: "UNESCO identity mark", delay: 0.05, position: "7% 6%", size: "900%" },
  { className: "learningOne", label: "Older adults learning together", delay: 0.18, position: "28% 9%", size: "770%" },
  { className: "phone", label: "Older adult using a phone", delay: 0.26, position: "15% 19%", size: "670%" },
  { className: "helper", label: "Young facilitator supporting an older adult", delay: 0.34, position: "65% 9%", size: "710%" },
  { className: "group", label: "Community group learning together", delay: 0.42, position: "82% 17%", size: "590%" },
  { className: "portraitLeft", label: "Older community member", delay: 0.9, position: "18% 53%", size: "1000%" },
  { className: "portraitLower", label: "Older adult at home", delay: 0.98, position: "10% 78%", size: "900%" },
  { className: "portraitRight", label: "Older community member seated outdoors", delay: 1.06, position: "80% 52%", size: "1400%" },
  { className: "portraitFarRight", label: "Older community member", delay: 1.14, position: "89% 67%", size: "900%" },
  { className: "phoneLearning", label: "Older adults practising with a phone", delay: 1.22, position: "36% 82%", size: "590%" },
  { className: "learningTwo", label: "Facilitator assisting older adults", delay: 1.3, position: "64% 80%", size: "670%" },
  { className: "learningThree", label: "Community workshop", delay: 1.38, position: "85% 79%", size: "625%" },
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
          {photos.map((photo, index) => (
            <motion.div
              key={photo.className}
              className={`${styles.photo} ${styles[photo.className]}`}
              role="img"
              aria-label={photo.label}
              style={{ backgroundPosition: photo.position, backgroundSize: photo.size }}
              initial={reducedMotion ? false : { opacity: 0, x: index % 2 === 0 ? -28 : 28, y: index % 3 === 0 ? -24 : 28, rotate: index % 2 === 0 ? -2 : 2 }}
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