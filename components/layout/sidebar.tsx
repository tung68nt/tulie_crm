'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
    Layout,
    Contact,
    Headphones,
    Briefcase
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
            { title: 'Leads & Cơ hội', href: '/deals', icon: TrendingUp },
            { title: 'Khách hàng', href: '/customers', icon: Users },
            { title: 'Báo giá', href: '/quotations', icon: FileText },
            { title: 'Hợp đồng & Đơn hàng', href: '/contracts', icon: FilePenLine },
            { title: 'Dự án', href: '/projects', icon: Rocket },
            { title: 'Theo dõi hoá đơn', href: '/invoices', icon: Banknote },
            { title: 'Helpdesk', href: '/helpdesk', icon: Headphones },
        ]
    },
    {
        title: 'Tulie Studio',
        items: [
            { title: 'Đơn hàng Studio', href: '/studio', icon: Camera },
            { title: 'Khách Studio', href: '/studio/customers', icon: Users },
        ]
    },
    {
        title: 'Hệ thống',
        items: [
            { title: 'Tài chính', href: '/finance', icon: Wallet },
            { title: 'Nhân sự', href: '/team', icon: UserCheck },
            { title: 'Sản phẩm & Dịch vụ', href: '/products', icon: Box },
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
                'relative flex flex-col h-full transition-all duration-300 ease-in-out',
                isMobile ? 'w-full border-none' : (isCollapsed ? 'w-20 border-r' : 'w-72 border-r'),
                'bg-background',
                className
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-4 transition-all duration-300">
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
            <div className="flex-1 overflow-y-auto pb-6">
                <nav className="flex flex-col gap-0.5 pt-2 px-2">
                    {/* Dashboard always at top */}
                    <div className="space-y-1">
                        <Link href="/dashboard">
                            <Button
                                variant="ghost"
                                className={cn(
                                    'w-full justify-start gap-3 h-10 transition-all duration-200 group rounded-xl',
                                    pathname === '/dashboard' ? 'bg-zinc-100 text-zinc-950 shadow-sm border border-border/50' : 'text-muted-foreground hover:text-zinc-950 hover:bg-zinc-100/50',
                                    isCollapsed && 'justify-center px-0'
                                )}
                            >
                                <LayoutGrid className={cn(
                                    "h-4 w-4 shrink-0 transition-colors",
                                    pathname === '/dashboard' ? "text-zinc-950" : "opacity-70 group-hover:opacity-100"
                                )} />
                                {!isCollapsed && <span className={cn("truncate font-medium", pathname === '/dashboard' ? "text-zinc-950" : "text-muted-foreground group-hover:text-zinc-950")}>Dashboard</span>}
                            </Button>
                        </Link>
                        <Link href="/workspace">
                            <Button
                                variant="ghost"
                                className={cn(
                                    'w-full justify-start gap-3 h-10 transition-all duration-200 group rounded-xl',
                                    pathname === '/workspace' || pathname.startsWith('/workspace/') ? 'bg-zinc-100 text-zinc-950 shadow-sm border border-border/50' : 'text-muted-foreground hover:text-zinc-950 hover:bg-zinc-100/50',
                                    isCollapsed && 'justify-center px-0'
                                )}
                            >
                                <Briefcase className={cn(
                                    "h-4 w-4 shrink-0 transition-colors",
                                    pathname === '/workspace' || pathname.startsWith('/workspace/') ? "text-zinc-950" : "opacity-70 group-hover:opacity-100"
                                )} />
                                {!isCollapsed && <span className={cn("truncate font-medium", pathname === '/workspace' || pathname.startsWith('/workspace/') ? "text-zinc-950" : "text-muted-foreground group-hover:text-zinc-950")}>Workspace</span>}
                            </Button>
                        </Link>
                    </div>

                    {navGroups.map((group, idx) => (
                        <div key={idx} className="flex flex-col">
                            {!isCollapsed && (
                                <h4 className="px-3 py-1.5 mt-5 mb-1 text-xs font-bold text-foreground/50 uppercase tracking-wider">
                                    {group.title}
                                </h4>
                            )}
                            {isCollapsed && (
                                <div className="h-px bg-border/50 mx-2 mt-2 mb-4" />
                            )}
                            <div className="flex flex-col gap-0.5">
                                {group.items.map((item) => {
                                    const Icon = item.icon
                                    // More precise isActive logic:
                                    // - Exact match always takes precedence.
                                    // - For sub-path matching, ensure it's not the root path '/'
                                    //   and that the pathname starts with the item's href followed by a slash,
                                    //   or if the item's href is '/studio', it only matches exactly '/studio'.
                                    const isActive = pathname === item.href ||
                                        (item.href !== '/' && item.href !== '/studio' && pathname.startsWith(item.href + '/'))

                                    return (
                                        <Link key={item.href} href={item.href}>
                                            <Button
                                                variant="ghost"
                                                className={cn(
                                                    'w-full justify-start gap-3 h-10 transition-all duration-200 group rounded-xl',
                                                    isActive ? 'bg-zinc-100 text-zinc-950 shadow-sm border border-border/50' : 'text-muted-foreground hover:text-zinc-950 hover:bg-zinc-100/50',
                                                    isCollapsed && 'justify-center px-0'
                                                )}
                                            >
                                                <Icon className={cn(
                                                    "h-4 w-4 shrink-0 transition-colors",
                                                    isActive ? "text-zinc-950" : "opacity-70 group-hover:opacity-100"
                                                )} />
                                                {!isCollapsed && (
                                                    <span className={cn(
                                                        "truncate font-medium",
                                                        isActive ? "text-zinc-950" : "text-muted-foreground group-hover:text-zinc-950"
                                                    )}>
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
                    {/* Thêm padding dưới cùng để khi cuộn không bị dính đáy */}
                    <div className="h-20" />
                </nav>
            </div>

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
