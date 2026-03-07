import { ThemeProvider } from 'next-themes'
import '@/app/globals.css'

export const metadata = {
    title: 'Customer Portal - Tulie Agency',
    description: 'Theo dõi tiến độ dự án và giấy tờ của bạn',
    icons: {
        icon: "/logo-icon.png",
    },
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
