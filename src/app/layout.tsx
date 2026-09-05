import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { LanguageProvider } from "@/i18n/language-context";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Planora — Daily Work Organizer",
  description:
    "Organize your work, focus on one thing at a time, and see what you actually accomplished.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans`}
      >
        <LanguageProvider>
          {children}

          <Toaster
            theme="dark"
            position="top-right"
            richColors
            closeButton
          />
        </LanguageProvider>
      </body>
    </html>
  );
}