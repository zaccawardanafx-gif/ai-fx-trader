import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { I18nProvider } from "@/lib/i18n-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ZacFX Trader - Professional FX Trading Platform",
  description: "Advanced AI-powered FX trading platform with real-time analysis and automated trade ideas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

