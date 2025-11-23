import type { ReactNode } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard • Quant Test Latency Intelligence",
};

type DashboardLayoutProps = {
  children: ReactNode;
};

const navItems = [
  {
    href: "/dashboard/latency",
    label: "Latency Globe",
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950/95 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40">
              QT
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                Quant Test
              </p>
              <p className="text-lg font-semibold text-slate-100">
                Latency Intelligence
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-1.5 transition hover:bg-slate-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full border border-slate-700 px-4 py-1.5 text-slate-300 transition hover:border-slate-500 hover:text-white md:inline-flex"
            >
              View Docs
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className={cn("mx-auto min-h-[calc(100vh-88px)] max-w-6xl px-6 py-10")}>
          {children}
        </div>
      </main>
      <footer className="border-t border-slate-800/60 bg-slate-950/90 py-6 text-center text-xs text-slate-500">
        <p>
          Latency telemetry simulated for development. Replace data providers via
          <code className="ml-1 rounded bg-slate-900 px-1 py-0.5 text-[10px] text-slate-300">
            lib/latency/source.ts
          </code>
        </p>
      </footer>
    </div>
  );
}

