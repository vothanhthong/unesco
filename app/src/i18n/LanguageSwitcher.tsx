"use client";

import { Translate } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/i18n/LocaleProvider";

export default function LanguageSwitcher({ embedded = false, className = "" }: { embedded?: boolean; className?: string }) {
  const pathname = usePathname();
  const { locale, setLocale, copy } = useLocale();

  if (pathname === "/" || pathname === "/learner") return null;
  if (embedded && !pathname.startsWith("/toolkit")) return null;

  return (
    <div className={`language-switcher${embedded ? " language-switcher--embedded" : ""}${className ? ` ${className}` : ""}`} aria-label={copy.language.label}>
      <Translate size={15} weight="bold" aria-hidden="true" />
      <button type="button" className={locale === "vi" ? "active" : ""} onClick={() => setLocale("vi")} aria-pressed={locale === "vi"}>{copy.language.vi}</button>
      <button type="button" className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")} aria-pressed={locale === "en"}>{copy.language.en}</button>
    </div>
  );
}
