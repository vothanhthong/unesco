"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BookOpen, List as Menu, Megaphone, Trophy, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/i18n/LanguageSwitcher";
import styles from "./toolkit.module.css";

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function ToolkitNavigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [identity, setIdentity] = useState<{ email: string | null; display_name: string | null } | null>(null);
  const { copy } = useLocale();
  const links = [
    { href: "/toolkit/train", label: copy.toolkit.trainNote, icon: BookOpen },
    { href: "/toolkit/contribute", label: copy.toolkit.contributeNote, icon: Megaphone },
    { href: "/leaderboard", label: "Top Contributors", icon: Trophy },
  ];

  useEffect(() => {
    let cancelled = false;
    async function loadIdentity() {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok || cancelled) return;
      const data = (await response.json()) as { user: { email: string | null; display_name: string | null } };
      if (!cancelled) setIdentity(data.user);
    }
    void loadIdentity();
    return () => { cancelled = true; };
  }, []);

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarInner}>
        <Link className={styles.brand} href="/" onClick={() => setMobileOpen(false)}>
          <span className={styles.brandRule} aria-hidden="true" />
          <span>
            <span className={styles.brandMeta}>{copy.toolkit.brandMeta}</span>
            <span className={styles.brandTitle}>Second Thought</span>
          </span>
        </Link>

        <nav className={styles.desktopNav} aria-label={copy.toolkit.modules}>
           {links.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                href={href}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={16} aria-hidden="true" />
                <span className={styles.navLabel}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.utility} aria-label={copy.toolkit.workspaceStatus}>
          <span className={styles.utilityMark} aria-hidden="true">ST</span>
          <span className={styles.utilityValue} title={identity?.email ?? undefined}>
            {identity?.display_name || identity?.email || copy.toolkit.facilitator}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className={styles.mobileMenuButton}
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="toolkit-mobile-navigation"
          aria-label={mobileOpen ? copy.toolkit.closeMenu : copy.toolkit.openMenu}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={17} aria-hidden="true" /> : <Menu size={17} aria-hidden="true" />}
          {copy.toolkit.menu}
        </Button>
      </div>

      <nav
        id="toolkit-mobile-navigation"
        className={`${styles.mobileNav} ${mobileOpen ? styles.mobileNavOpen : ""}`}
        aria-label={copy.toolkit.modules}
      >
        <LanguageSwitcher embedded className="language-switcher--mobile" />
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <Link
              key={href}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              href={href}
              aria-current={active ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={16} aria-hidden="true" />
              <span>
                <span className={styles.navLabel}>{label}</span>
              </span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
