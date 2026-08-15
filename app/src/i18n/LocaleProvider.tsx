"use client";

import { createContext, startTransition, useContext, useEffect, useState, type ReactNode } from "react";
import { COPY, type Locale } from "@/i18n/copy";

const STORAGE_KEY = "second-thought-locale";

interface LocaleContextValue {
  locale: Locale;
  copy: (typeof COPY)[Locale];
  setLocale: (locale: Locale) => void;
  formatDate: (value: string | Date) => string;
  formatTime: (value: string | Date) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "vi" || saved === "en") startTransition(() => setLocaleState(saved));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(nextLocale: Locale) {
    setLocaleState(nextLocale);
    window.localStorage.setItem(STORAGE_KEY, nextLocale);
    document.cookie = `second-thought-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
  }

  const intlLocale = locale === "vi" ? "vi-VN" : "en-US";

  return (
    <LocaleContext.Provider value={{
      locale,
      copy: COPY[locale],
      setLocale,
      formatDate: (value) => new Intl.DateTimeFormat(intlLocale).format(new Date(value)),
      formatTime: (value) => new Intl.DateTimeFormat(intlLocale, { hour: "2-digit", minute: "2-digit" }).format(new Date(value)),
    }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}
