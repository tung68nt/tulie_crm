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
    ShoppingCart,
    Wallet,
    UserCheck,
    PieChart,
    Settings,
    ChevronLeft,
    ChevronRight,
    Files,
    TrendingUp,
    Rocket,
    Camera,
    GraduationCap,
    Layout
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
    title: string
    href: string
    icon: any
}

interface NavGroup {
    title: string
    items: NavItem[]
}

const navGroups: NavGroup[] = [
    {
        title: 'Tulie Agency',
        items: [
            { title: 'Cơ hội (Deals)', href: '/deals', icon: TrendingUp },
            { title: 'Khách hàng', href: '/customers', icon: Users },
            { title: 'Báo giá', href: '/quotations', icon: FileText },
            { title: 'Hợp đồng', href: '/contracts', icon: FilePenLine },
            { title: 'Đơn hàng (B2B)', href: '/orders', icon: ShoppingCart },
            { title: 'Dự án', href: '/projects', icon: Rocket },
            { title: 'Hóa đơn', href: '/invoices', icon: Banknote },
        ]
    },
    {
        title: 'Tulie Studio',
        items: [
            { title: 'Cơ hội (B2C)', href: '/studio/deals', icon: TrendingUp },
            { title: 'Đơn hàng Studio', href: '/studio', icon: Camera },
        ]
    },
    {
        title: 'Tulie Lab',
        items: [
            { title: 'Hệ thống Lab', href: '/academy', icon: Layout },
        ]
    },
    {
        title: 'Quản trị hệ thống',
        items: [
            { title: 'Tài chính', href: '/finance', icon: Wallet },
            { title: 'Nhân sự', href: '/team', icon: UserCheck },
            { title: 'Sản phẩm', href: '/products', icon: Box },
            { title: 'Mẫu giấy tờ', href: '/templates', icon: Files },
            { title: 'Báo cáo', href: '/reports', icon: PieChart },
            { title: 'Cài đặt', href: '/settings', icon: Settings },
        ]
    }
]

export function Sidebar({ className, isMobile }: { className?: string; isMobile?: boolean }) {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <aside
            className={cn(
                'relative flex flex-col transition-all duration-300 ease-in-out',
                isMobile ? 'w-full h-full border-none' : (isCollapsed ? 'w-20 border-r' : 'w-72 border-r'),
                'bg-background',
                className
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
                        <span className="text-xl font-bold whitespace-nowrap opacity-100 transition-opacity duration-300">
                            Tulie CRM
                        </span>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4">
                <nav className="flex flex-col gap-1 px-2">
                    {/* Dashboard always at top */}
                    <div className="space-y-1">
                        <Link href="/dashboard">
                            <Button
                                variant="ghost"
                                className={cn(
                                    'w-full justify-start gap-3 h-10 text-sm font-medium transition-all duration-200',
                                    pathname === '/dashboard' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground',
                                    isCollapsed && 'justify-center px-0'
                                )}
                            >
                                <LayoutGrid className={cn(
                                    "h-5 w-5 shrink-0 transition-colors",
                                    pathname === '/dashboard' ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                )} />
                                {!isCollapsed && <span className="truncate">Dashboard</span>}
                            </Button>
                        </Link>
                    </div>

                    {navGroups.map((group, idx) => (
                        <div key={idx} className="flex flex-col">
                            {!isCollapsed && (
                                <h4 className="px-3 py-2 mt-4 text-sm font-semibold text-foreground/70 mb-0.5">
                                    {group.title}
                                </h4>
                            )}
                            {isCollapsed && (
                                <div className="h-px bg-border/50 mx-2 mt-2 mb-4" />
                            )}
                            <div className="flex flex-col gap-0.5">
                                {group.items.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href ||
                                        (item.href !== '/' && pathname.startsWith(item.href))

                                    return (
                                        <Link key={item.href} href={item.href}>
                                            <Button
                                                variant="ghost"
                                                className={cn(
                                                    'w-full justify-start gap-3 h-8 text-sm font-medium transition-all duration-200',
                                                    isActive ? 'bg-secondary text-secondary-foreground font-semibold' : 'text-muted-foreground hover:text-foreground',
                                                    isCollapsed && 'justify-center px-0'
                                                )}
                                            >
                                                <Icon className={cn(
                                                    "h-4 w-4 shrink-0 transition-colors",
                                                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                                )} />
                                                {!isCollapsed && (
                                                    <span className="truncate">
                                                        {item.title}
                                                    </span>
                                                )}
                                            </Button>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </ScrollArea>

            {/* Collapse Toggle - Hidden on mobile */}
            {!isMobile && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-3 top-16 -translate-y-1/2 h-6 w-6 rounded-full border bg-background z-10"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            )}
        </aside>
    )
}
