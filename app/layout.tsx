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
          <Toaster
            position="top-right"
            closeButton
            duration={4000}
            toastOptions={{
              unstyled: false,
              classNames: {
                toast: 'group font-sans rounded-xl shadow-lg border backdrop-blur-sm !bg-background !text-foreground',
                title: 'text-sm font-semibold',
                description: 'text-xs text-muted-foreground',
                actionButton: 'bg-primary text-primary-foreground text-xs font-medium rounded-lg px-3 py-1.5',
                cancelButton: 'bg-muted text-muted-foreground text-xs font-medium rounded-lg px-3 py-1.5',
                closeButton: 'bg-background border-border hover:bg-muted',
                success: '!border-emerald-200 !bg-emerald-50 !text-emerald-900 dark:!bg-emerald-950/80 dark:!border-emerald-800 dark:!text-emerald-100',
                error: '!border-red-200 !bg-red-50 !text-red-900 dark:!bg-red-950/80 dark:!border-red-800 dark:!text-red-100',
                warning: '!border-amber-200 !bg-amber-50 !text-amber-900 dark:!bg-amber-950/80 dark:!border-amber-800 dark:!text-amber-100',
                info: '!border-blue-200 !bg-blue-50 !text-blue-900 dark:!bg-blue-950/80 dark:!border-blue-800 dark:!text-blue-100',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
