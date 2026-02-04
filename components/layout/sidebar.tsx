'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    LayoutGrid,
    Users,
    FileText,
    FilePenLine,
    Banknote,
    Box,
    Wallet,
    UserCheck,
    PieChart,
    Settings,
    ChevronLeft,
    ChevronRight,
    Files
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { title: 'Khách hàng', href: '/customers', icon: Users },
    { title: 'Báo giá', href: '/quotations', icon: FileText },
    { title: 'Hợp đồng', href: '/contracts', icon: FilePenLine },
    { title: 'Hóa đơn', href: '/invoices', icon: Banknote },
    { title: 'Sản phẩm', href: '/products', icon: Box },
    { title: 'Mẫu giấy tờ', href: '/templates', icon: Files },
    { title: 'Tài chính', href: '/finance', icon: Wallet },
    { title: 'Nhân sự', href: '/team', icon: UserCheck },
    { title: 'Báo cáo', href: '/reports', icon: PieChart },
    { title: 'Cài đặt', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <aside
            className={cn(
                'relative flex flex-col border-r bg-card transition-all duration-300 ease-in-out',
                isCollapsed ? 'w-20' : 'w-72'
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-4">
                <Link href="/" className={cn(
                    "flex items-center gap-3 transition-all duration-300 ease-in-out overflow-hidden w-full",
                    isCollapsed ? "justify-center" : "justify-start"
                )}>
                    <img
                        src={isCollapsed ? "/logo-icon.png" : "/logo.png"}
                        alt="Tulie"
                        className={cn(
                            "h-10 w-auto object-contain transition-all duration-300 ease-in-out shrink-0",
                            isCollapsed ? "h-8" : "h-10"
                        )}
                    />
                    {!isCollapsed && (
                        <span className="text-2xl font-bold tracking-tight whitespace-nowrap opacity-100 transition-opacity duration-300">
                            Tulie CRM
                        </span>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4">
                <nav className="flex flex-col gap-1 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname.startsWith(item.href))

                        return (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={isActive ? 'secondary' : 'ghost'}
                                    className={cn(
                                        'w-full justify-start gap-3 h-11 text-base transition-all duration-200',
                                        isCollapsed && 'justify-center px-0'
                                    )}
                                >
                                    <Icon className="h-6 w-6 shrink-0" />
                                    {!isCollapsed && (
                                        <span className="truncate opacity-100 transition-opacity duration-300">
                                            {item.title}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        )
                    })}
                </nav>
            </ScrollArea>

            {/* Collapse Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                ) : (
                    <ChevronLeft className="h-4 w-4" />
                )}
            </Button>
        </aside>
    )
}
