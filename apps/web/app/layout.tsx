import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PrimaryNav } from "../components/PrimaryNav.js";
import "./globals.css";

export const metadata: Metadata = {
  title: "OneWorld",
  description: "Persistent aviation career and life-simulation platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PrimaryNav />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
