'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    LayoutGrid, Users, FileText, FilePenLine, Wallet,
    UserCheck, PieChart, Rocket, Receipt, Sun, Moon
} from 'lucide-react'
import { useEffect, useState } from 'react'

const navGroups = [
    {
        title: 'Kinh doanh',
        items: [
            { title: 'Khách hàng', href: '/demo/customers', icon: Users },
            { title: 'Báo giá', href: '/demo/quotations', icon: FileText },
            { title: 'Hợp đồng', href: '/demo/contracts', icon: FilePenLine },
            { title: 'Dự án', href: '/demo/projects', icon: Rocket },
            { title: 'Hóa đơn', href: '/demo/invoices', icon: Receipt },
        ]
    },
    {
        title: 'Quản trị',
        items: [
            { title: 'Tài chính', href: '/demo/finance', icon: Wallet },
            { title: 'Nhân sự', href: '/demo/team', icon: UserCheck },
            { title: 'Báo cáo', href: '/demo/reports', icon: PieChart },
        ]
    },
]

export function DemoSidebar() {
    const pathname = usePathname()
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem('demo-theme')
        if (stored === 'dark') {
            setIsDark(true)
            document.documentElement.classList.add('dark')
        }
    }, [])

    const toggleTheme = () => {
        const next = !isDark
        setIsDark(next)
        if (next) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('demo-theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('demo-theme', 'light')
        }
    }

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-border bg-background h-screen sticky top-0">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-border px-5 justify-between">
                <Link href="/demo/dashboard" className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-zinc-950 dark:bg-white flex items-center justify-center">
                        <span className="text-white dark:text-zinc-950 font-black text-sm">N</span>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-50">NovaDeco</span>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={toggleTheme}
                >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto pb-6">
                <nav className="flex flex-col gap-0.5 pt-2 px-2">
                    {/* Dashboard */}
                    <Link href="/demo/dashboard">
                        <Button
                            variant="ghost"
                            className={cn(
                                'w-full justify-start gap-3 h-10 rounded-xl',
                                pathname === '/demo/dashboard'
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm border border-border/50'
                                    : 'text-muted-foreground hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'
                            )}
                        >
                            <LayoutGrid className="h-4 w-4 shrink-0" />
                            <span className="font-bold tracking-tight">Dashboard</span>
                        </Button>
                    </Link>

                    {navGroups.map((group, idx) => (
                        <div key={idx} className="flex flex-col">
                            <h4 className="px-3 py-1.5 mt-4 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-tight">
                                {group.title}
                            </h4>
                            <div className="flex flex-col gap-0.5">
                                {group.items.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                                    return (
                                        <Link key={item.href} href={item.href}>
                                            <Button
                                                variant="ghost"
                                                className={cn(
                                                    'w-full justify-start gap-3 h-10 rounded-xl',
                                                    isActive
                                                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm border border-border/50'
                                                        : 'text-muted-foreground hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50'
                                                )}
                                            >
                                                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-zinc-950 dark:text-zinc-50" : "opacity-70")} />
                                                <span className={cn("font-bold tracking-tight", isActive ? "text-zinc-950 dark:text-zinc-50" : "text-muted-foreground")}>{item.title}</span>
                                            </Button>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <div className="text-[10px] font-semibold text-muted-foreground text-center">
                    Powered by <span className="text-zinc-950 dark:text-zinc-50">Tulie CRM</span>
                </div>
            </div>
        </aside>
    )
}
