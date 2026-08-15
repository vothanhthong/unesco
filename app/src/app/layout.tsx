import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import LanguageSwitcher from "@/i18n/LanguageSwitcher";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Second Thought | UNESCO Youth Hackathon 2026",
  description:
    "A youth-led UNESCO practice space for media and information literacy.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Second Thought",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={geist.variable}>
      <body className={geist.className} suppressHydrationWarning>
        <LocaleProvider>
          <LanguageSwitcher className="language-switcher--global" />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
