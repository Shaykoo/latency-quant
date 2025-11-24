import type { ReactNode } from "react";
import { Metadata } from "next";
import { cn } from "@/lib/utils";
import { DashboardHeaderClient } from "./header-client";
import { DashboardFooterClient } from "./footer-client";
import { DashboardLayoutClient } from "./layout-client";

export const metadata: Metadata = {
  title: "Dashboard • Quant Test Latency Intelligence",
};

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardLayoutClient>
      <DashboardHeaderClient />
      <main className="flex-1">
        <div className={cn("mx-auto min-h-[calc(100vh-88px)] max-w-6xl px-4 py-6")}>
          {children}
        </div>
      </main>
      <DashboardFooterClient />
    </DashboardLayoutClient>
  );
}

