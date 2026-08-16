"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "./homepage.module.css";

const ease = [0.22, 1, 0.36, 1] as const;

type CollageImage = {
  id: string;
  src: string;
  alt: string;
  aspect: "portrait" | "landscape" | "wide";
  desktop: { className: string; tabletHidden?: boolean };
  laptopVisible: boolean;
  objectPosition?: string;
  animation: { x: number; y: number; rotate: number; delay: number };
  priority?: boolean;
};

const photos: CollageImage[] = [
  { id: "learning-circle", src: "/hp2.webp", alt: "Older adults learning to use phones together", aspect: "landscape", desktop: { className: "topLeftGroup" }, laptopVisible: true, animation: { x: -24, y: -18, rotate: -2, delay: 0.12 }, priority: true },
  { id: "phone-at-home", src: "/hp9.jpeg", alt: "Older adult using a tablet at home", aspect: "landscape", desktop: { className: "topLeftPhone" }, laptopVisible: true, objectPosition: "center", animation: { x: -26, y: 18, rotate: 2, delay: 0.22 }, priority: true },
  { id: "guided-support", src: "/hp4.jpg", alt: "Facilitator helping an older adult use a phone", aspect: "landscape", desktop: { className: "topRightSupport" }, laptopVisible: true, animation: { x: 24, y: -18, rotate: 2, delay: 0.32 }, priority: true },
  { id: "digital-class", src: "/hp6.webp", alt: "Digital skills session with older adults and a young facilitator", aspect: "wide", desktop: { className: "topRightGroup" }, laptopVisible: true, animation: { x: 26, y: 14, rotate: -2, delay: 0.42 }, priority: true },
  { id: "elder-portrait", src: "/hp1.jpg", alt: "Older man standing outside", aspect: "portrait", desktop: { className: "lowerLeftPortrait" }, laptopVisible: false, animation: { x: -20, y: 24, rotate: -2, delay: 0.9 } },
  { id: "garden-portrait", src: "/hp5.webp", alt: "Older woman seated among plants", aspect: "portrait", desktop: { className: "lowerLeftSupport" }, laptopVisible: false, objectPosition: "center", animation: { x: -14, y: 24, rotate: 2, delay: 1.0 } },
  { id: "community-training", src: "/hp10.jpeg", alt: "Community worker assisting an older adult", aspect: "landscape", desktop: { className: "lowerRightSupport" }, laptopVisible: false, objectPosition: "center", animation: { x: 22, y: 22, rotate: -2, delay: 1.1 } },
  { id: "phone-guidance", src: "/hp3.jpg", alt: "Older woman receiving phone guidance", aspect: "landscape", desktop: { className: "lowerRightPortrait" }, laptopVisible: false, objectPosition: "center", animation: { x: 22, y: 24, rotate: 2, delay: 1.2 } },
  { id: "tablet-practice", src: "/hp8.jpg", alt: "Older man practising with a tablet", aspect: "landscape", desktop: { className: "lowerRightSmall" }, laptopVisible: false, objectPosition: "center", animation: { x: 24, y: 18, rotate: -2, delay: 1.3 } },
  { id: "digital-help", src: "/hp7.jpeg", alt: "Young volunteer helping older adults use smartphones", aspect: "wide", desktop: { className: "lowerCentre" }, laptopVisible: false, animation: { x: 0, y: 20, rotate: 1, delay: 1.4 } },
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
  const [collageMode, setCollageMode] = useState<"none" | "laptop" | "desktop">("none");
  const photoMotion = (photo: CollageImage) => ({
    initial: reducedMotion ? false : { opacity: 0, x: photo.animation.x, y: photo.animation.y, rotate: photo.animation.rotate },
    animate: { opacity: 1, x: 0, y: 0, rotate: 0 },
    transition: reducedMotion ? { duration: 0 } : { duration: 0.64, delay: photo.animation.delay, ease },
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateMode = () => setCollageMode(window.innerWidth >= 1440 ? "desktop" : mediaQuery.matches ? "laptop" : "none");
    updateMode();
    mediaQuery.addEventListener("change", updateMode);
    window.addEventListener("resize", updateMode);
    return () => { mediaQuery.removeEventListener("change", updateMode); window.removeEventListener("resize", updateMode); };
  }, []);

  const visiblePhotos = collageMode === "desktop" ? photos : photos.filter((photo) => photo.laptopVisible);

  return (
    <main className={styles.page}>
      <header className={styles.hero} aria-labelledby="homepage-title">
        {collageMode !== "none" && <div className={`${styles.desktopCollage} ${collageMode === "desktop" ? styles.fullCollage : styles.laptopCollage}`} aria-hidden="true">
          <div className={styles.unescoMark} aria-label="UNESCO">UNESCO</div>
          {visiblePhotos.map((photo) => (
            <motion.figure
              key={photo.id}
              className={`${styles.photo} ${styles[photo.desktop.className]}`}
              {...photoMotion(photo)}
            >
              <Image src={photo.src} alt={photo.alt} fill priority={photo.priority} sizes="(min-width: 1280px) 18vw, 22vw" style={{ objectFit: "cover", objectPosition: photo.objectPosition }} />
            </motion.figure>
          ))}
        </div>}

        <div className={styles.content}>
          <div className={styles.mobileUnescoMark} aria-label="UNESCO">UNESCO</div>
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
                <Link className={`${styles.roleLink} ${styles.facilitatorLink}`} href="/toolkit/train">Start as Trainer <span aria-hidden="true">→</span></Link>
              </motion.div>
            </nav>
          </motion.div>
        </div>
      </header>
    </main>
  );
}