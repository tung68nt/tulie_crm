import { DemoSidebar } from '@/components/demo/demo-sidebar'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-zinc-50/30 dark:bg-zinc-950">
            <DemoSidebar />
            <main className="flex-1 overflow-auto">
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
