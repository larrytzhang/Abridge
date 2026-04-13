/**
 * RootLayout — Top-level layout for NoteCheck.
 *
 * Responsibilities:
 *   1. Loads DM Sans from Google Fonts, applies to <html>.
 *   2. Sets page metadata for SEO.
 *   3. Renders a minimal sticky header with logo + nav.
 *   4. Renders page content via {children}.
 *
 * Props:
 *   children — routed page content from Next.js App Router
 * Renders: full <html> document with header and content
 */

import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NoteCheck — Clinical Note Hallucination Detector",
  description:
    "Verify AI-generated medical notes against source transcripts. Detect hallucinations, unsupported claims, and inaccuracies in clinical documentation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-dm-sans)] text-slate-800">
        <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-[15px] font-bold tracking-tight text-slate-900">
              notecheck
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/analyze"
                className="text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Analyze
              </Link>
              <Link
                href="/analyze?demo=true"
                className="rounded-md bg-teal-600 px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-teal-700 transition-colors"
              >
                Try Demo
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
