/**
 * RootLayout — The top-level layout for the NoteCheck application.
 *
 * Responsibilities:
 *   1. Loads the Inter font from Google Fonts and applies it to the <html> element.
 *   2. Sets page-level metadata (title, description) for SEO and browser tabs.
 *   3. Renders a sticky top header bar containing:
 *        - Left: "NoteCheck" text logo in bold blue-600.
 *        - Right: A "Try Demo" link pointing to /analyze?demo=true.
 *   4. Renders the page-specific content via {children}.
 *   5. Imports globals.css which contains the Tailwind directives.
 *
 * Props:
 *   children — The page content rendered by Next.js App Router for the
 *              current route.
 *
 * Renders: a full <html> document with the sticky header and routed content.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        {/* Sticky header */}
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <Link href="/" className="text-lg font-bold text-blue-600">
              NoteCheck
            </Link>

            {/* Navigation */}
            <Link
              href="/analyze?demo=true"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Try Demo
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
