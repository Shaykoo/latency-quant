import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quant Test • Latency Intelligence",
  description:
    "Observe global exchange latency in real time with a 3D globe, structured telemetry, and accessible controls.",
  metadataBase: new URL("https://quant-test.local"),
  openGraph: {
    title: "Quant Test • Latency Intelligence",
    description:
      "Realtime latency telemetry rendered on a cinematic, accessible 3D globe.",
    images: ["/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quant Test • Latency Intelligence",
    description:
      "Realtime latency telemetry rendered on a cinematic, accessible 3D globe.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-950 text-slate-50 antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
