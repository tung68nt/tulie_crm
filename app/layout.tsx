import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { getBrandConfig } from "@/lib/supabase/services/settings-service";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
});

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandConfig()
  return {
    title: `${brand.brand_name || 'Tulie'} CRM - Quản trị Khách hàng`,
    description: "Hệ thống CRM toàn diện cho Tulie Agency - Quản lý khách hàng, báo giá, hợp đồng và tài chính",
    keywords: ["CRM", "Tulie Agency", "quản lý khách hàng", "báo giá", "hợp đồng"],
    icons: {
      icon: brand.favicon_url || "/logo-icon.png",
      shortcut: brand.favicon_url || "/logo-icon.png",
      apple: brand.favicon_url || "/logo-icon.png",
    },
  }
}

import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
