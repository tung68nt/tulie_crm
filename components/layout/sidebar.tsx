'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    LayoutDashboard,
    Users,
    FileText,
    FileSignature,
    Receipt,
    Package,
    Wallet,
    UsersRound,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    FileStack
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Khách hàng', href: '/customers', icon: Users },
    { title: 'Báo giá', href: '/quotations', icon: FileText },
    { title: 'Hợp đồng', href: '/contracts', icon: FileSignature },
    { title: 'Hóa đơn', href: '/invoices', icon: Receipt },
    { title: 'Sản phẩm', href: '/products', icon: Package },
    { title: 'Mẫu giấy tờ', href: '/templates', icon: FileStack },
    { title: 'Tài chính', href: '/finance', icon: Wallet },
    { title: 'Nhân sự', href: '/team', icon: UsersRound },
    { title: 'Báo cáo', href: '/reports', icon: BarChart3 },
    { title: 'Cài đặt', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <aside
            className={cn(
                'relative flex flex-col border-r bg-card transition-all duration-300',
                isCollapsed ? 'w-[72px]' : 'w-[280px]'
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b px-4">
                {!isCollapsed && (
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
                            <span className="text-sm font-bold text-background">T</span>
                        </div>
                        <span className="text-lg font-bold">Tulie CRM</span>
                    </Link>
                )}
                {isCollapsed && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground mx-auto">
                        <span className="text-sm font-bold text-background">T</span>
                    </div>
                )}
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
                                        'w-full justify-start gap-3',
                                        isCollapsed && 'justify-center px-2'
                                    )}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    {!isCollapsed && <span>{item.title}</span>}
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
