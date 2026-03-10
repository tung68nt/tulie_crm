'use client'

import { Bell, Search, Moon, Sun, LogOut, User, Settings, Menu, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Sidebar } from './sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getNotifications, getUnreadCount, markNotificationAsRead } from '@/lib/supabase/services/notification-service'
import { Notification } from '@/types'
import { getUserById } from '@/lib/supabase/services/user-service'

export function Header() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [user, setUser] = useState<{ name: string; role: string; avatar?: string } | null>(null)
    const router = useRouter()

    // Get current user and initial notifications
    useEffect(() => {
        setMounted(true)

        const fetchData = async () => {
            const supabase = createClient()
            const { data: { user: authUser } } = await supabase.auth.getUser()

            if (authUser) {
                const [notifs, count, dbUser] = await Promise.all([
                    getNotifications(authUser.id),
                    getUnreadCount(authUser.id),
                    getUserById(authUser.id)
                ])

                setNotifications(notifs)
                setUnreadCount(count)

                setUser({
                    name: dbUser?.full_name || authUser.user_metadata?.full_name || 'Người dùng',
                    role: dbUser?.role || 'Staff',
                    avatar: dbUser?.avatar_url || authUser.user_metadata?.avatar_url
                })
            }
        }

        fetchData()

        // Refresh notifications every 60 seconds
        const interval = setInterval(fetchData, 60000)
        return () => clearInterval(interval)
    }, [])

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read in DB if it's not a mock notification
        if (notification.id !== 'system') {
            await markNotificationAsRead(notification.id)
        }

        // Mark as read (update local state)
        setNotifications(prev =>
            prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))

        // Navigate to target page
        if (notification.link) {
            router.push(notification.link)
        }
    }

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'new_customer': return 'bg-zinc-800 dark:bg-zinc-200'
            case 'quotation_accepted': return 'bg-zinc-950 dark:bg-zinc-50'
            case 'invoice_overdue': return 'bg-zinc-600'
            case 'contract_signed': return 'bg-zinc-900 mx-1'
            case 'payment_received': return 'bg-zinc-700'
            default: return 'bg-zinc-400'
        }
    }

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins} phút trước`
        if (diffHours < 24) return `${diffHours} giờ trước`
        return `${diffDays} ngày trước`
    }

    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72">
                        <Sidebar isMobile />
                    </SheetContent>
                </Sheet>

                {/* Search - Responsive */}
                <div className="relative group hidden sm:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-zinc-950 transition-colors" />
                    <Input
                        placeholder="Tìm kiếm thông tin..."
                        className="w-[200px] md:w-[320px] pl-10 h-10 bg-zinc-100/50 border-transparent rounded-xl focus-visible:bg-white focus-visible:border-border focus-visible:ring-0 transition-all text-sm font-medium"
                    />
                </div>
                <Button variant="ghost" size="icon" className="sm:hidden">
                    <Search className="h-5 w-5" />
                </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                {mounted && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="rounded-xl h-10 w-10 hover:bg-zinc-100 transition-colors"
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-5 w-5 text-zinc-400 group-hover:text-zinc-950" />
                        ) : (
                            <Moon className="h-5 w-5 text-zinc-500 group-hover:text-zinc-950" />
                        )}
                    </Button>
                )}

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative rounded-xl h-10 w-10 hover:bg-zinc-100 transition-colors">
                            <Bell className="h-5 w-5 text-zinc-500" />
                            {unreadCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center font-bold border-2 border-background"
                                >
                                    {unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-4 text-center text-sm text-muted-foreground">
                                    Không có thông báo mới
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        className={`flex flex-col items-start gap-1 py-3 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`h-2 w-2 rounded-full ${getNotificationColor(notification.type)}`} />
                                            <span className="font-medium">{notification.title}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {notification.message}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                            {formatTimeAgo(notification.created_at)}
                                        </span>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="justify-center text-center cursor-pointer">
                            <Link href="/notifications" className="text-sm font-medium w-full">
                                Xem tất cả thông báo
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-3 px-2 h-11 rounded-xl hover:bg-zinc-100 transition-all border border-transparent hover:border-border/50">
                            <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="bg-zinc-950 text-white text-[10px] font-bold">
                                    {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'TL'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden xs:flex flex-col items-start text-left">
                                <span className="text-sm font-bold text-zinc-950 tracking-tight leading-none">{user?.name || 'Đang tải...'}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 leading-none">{user?.role || 'Admin'}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-zinc-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href="/profile" className="flex items-center w-full">
                                <User className="mr-2 h-4 w-4" />
                                Hồ sơ
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href="/settings" className="flex items-center w-full">
                                <Settings className="mr-2 h-4 w-4" />
                                Cài đặt
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={async () => {
                            const { signout } = await import('@/app/(auth)/actions')
                            await signout()
                        }}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Đăng xuất
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
