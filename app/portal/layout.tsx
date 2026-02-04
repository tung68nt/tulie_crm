import { ThemeProvider } from 'next-themes'
import '@/app/globals.css'

export const metadata = {
    title: 'Customer Portal - Tulie CRM',
    description: 'Theo dõi tiến độ dự án và giấy tờ của bạn',
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
