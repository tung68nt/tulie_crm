'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    Home,
    ListTodo,
    Kanban,
    Calendar,
    GanttChart,
    Users,
    BarChart3,
} from 'lucide-react'

const workspaceTabs = [
    { title: 'Home', href: '/workspace', icon: Home, exact: true },
    { title: 'Tasks', href: '/workspace/tasks', icon: ListTodo },
    { title: 'Board', href: '/workspace/board', icon: Kanban },
    { title: 'Calendar', href: '/workspace/calendar', icon: Calendar },
    { title: 'Timeline', href: '/workspace/timeline', icon: GanttChart },
    { title: 'Team', href: '/workspace/team', icon: Users },
    { title: 'Analytics', href: '/workspace/analytics', icon: BarChart3 },
]

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    return (
        <div className="space-y-0">
            {/* Tab Navigation */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                <div className="flex items-center gap-1 px-1 overflow-x-auto scrollbar-hide">
                    {workspaceTabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = tab.exact
                            ? pathname === tab.href
                            : pathname === tab.href || pathname.startsWith(tab.href + '/')

                        return (
                            <Link key={tab.href} href={tab.href}>
                                <button
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap',
                                        'hover:text-foreground',
                                        isActive
                                            ? 'text-foreground'
                                            : 'text-muted-foreground'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.title}</span>
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t-full" />
                                    )}
                                </button>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Page Content */}
            <div className="pt-6">
                {children}
            </div>
        </div>
    )
}
