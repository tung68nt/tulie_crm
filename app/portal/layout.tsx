import { ThemeProvider } from 'next-themes'
import '@/app/globals.css'

import { getBrandConfig } from '@/lib/supabase/services/settings-service'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
    const brand = await getBrandConfig()
    return {
        title: `Portal - ${brand.brand_name || 'Tulie'}`,
        description: 'Theo dõi tiến độ dự án và giấy tờ của bạn',
        icons: {
            icon: brand.favicon_url || "/logo-icon.png",
        },
    }
}

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
    )
}
