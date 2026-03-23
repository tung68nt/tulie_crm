'use client'

import { Bell, Search, Moon, Sun, LogOut, User, Settings, Menu, ChevronDown, CheckCircle, UserPlus, FileText, CheckCircle2, CreditCard, BellRing } from 'lucide-react'
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

    const handleMarkAllAsRead = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)

        // API call
        try {
            const supabase = createClient()
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                await supabase.from('notifications')
                    .update({ read: true })
                    .eq('user_id', authUser.id)
                    .eq('read', false)
            }
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'new_customer': return <UserPlus className="h-4 w-4" />
            case 'quotation_accepted': return <CheckCircle2 className="h-4 w-4" />
            case 'invoice_overdue': return <BellRing className="h-4 w-4" />
            case 'contract_signed': return <FileText className="h-4 w-4" />
            case 'payment_received': return <CreditCard className="h-4 w-4" />
            default: return <Bell className="h-4 w-4" />
        }
    }

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins || 1} phút trước`
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
                        className="relative rounded-full h-9 w-9 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        aria-label="Toggle theme"
                    >
                        <Sun className={`h-[18px] w-[18px] text-amber-500 transition-all duration-300 ${theme === 'dark' ? 'opacity-0 rotate-90 scale-0 absolute' : 'opacity-100 rotate-0 scale-100'}`} />
                        <Moon className={`h-[18px] w-[18px] text-blue-400 transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0 absolute'}`} />
                    </Button>
                )}

                {/* Notifications — Modern Bell */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group">
                            <Bell className={`h-[18px] w-[18px] text-zinc-500 transition-colors group-hover:text-zinc-900 dark:group-hover:text-zinc-100 ${unreadCount > 0 ? 'group-hover:animate-[wiggle_0.3s_ease-in-out]' : ''}`} />
                            {unreadCount > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-background shadow-sm">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-[380px] rounded-xl shadow-xl border-zinc-200/80 dark:border-zinc-700 p-0 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b">
                            <div className="flex items-center gap-2">
                                <span className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100">Thông báo</span>
                                {unreadCount > 0 && (
                                    <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">{unreadCount} mới</span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-auto p-0 text-[12px] font-medium text-blue-600 hover:text-blue-700 hover:bg-transparent -mr-2 pr-2"
                                    onClick={handleMarkAllAsRead}
                                >
                                    Đánh dấu tất cả đã đọc
                                </Button>
                            )}
                        </div>
                        <div className="max-h-[380px] overflow-y-auto no-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center">
                                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                                        <Bell className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <p className="text-[14px] text-zinc-900 dark:text-zinc-100 font-semibold mb-1">Tất cả đã xong!</p>
                                    <p className="text-[13px] text-muted-foreground text-center">Bạn không còn thông báo nào chưa đọc.</p>
                                </div>
                            ) : (
                                <div className="p-1.5 flex flex-col gap-0.5">
                                    {notifications.map((notification) => (
                                        <DropdownMenuItem
                                            key={notification.id}
                                            className={`flex items-start gap-3 py-3 px-3 cursor-pointer rounded-lg transition-colors border border-transparent ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-500/5 hover:bg-blue-50 dark:hover:bg-blue-500/10' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className={`mt-0.5 shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${!notification.read ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex flex-col flex-1 w-full relative">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`font-semibold text-[13.5px] line-clamp-1 ${!notification.read ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                        {notification.title}
                                                    </span>
                                                    {!notification.read && (
                                                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_0_2px_#ebf5ff] dark:shadow-[0_0_0_2px_#1e3a8a]" />
                                                    )}
                                                </div>
                                                <p className={`text-[13px] leading-[1.4] mt-0.5 line-clamp-2 ${!notification.read ? 'text-zinc-800 dark:text-zinc-200' : 'text-muted-foreground'}`}>
                                                    {notification.message}
                                                </p>
                                                <span className={`text-[11.5px] font-medium mt-1.5 ${!notification.read ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground/80'}`}>
                                                    {formatTimeAgo(notification.created_at)}
                                                </span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-2 border-t bg-zinc-50/50 dark:bg-zinc-900/50">
                            <DropdownMenuItem asChild className="justify-center text-center cursor-pointer py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 shadow-sm transition-all text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 h-9">
                                <Link href="/notifications" className="w-full">
                                    Xem tất cả thông báo
                                </Link>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 sm:gap-3 px-1.5 sm:px-2 h-11 rounded-xl hover:bg-zinc-100 transition-all border border-transparent hover:border-border/50">
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
                            <ChevronDown className="h-4 w-4 text-zinc-400 hidden sm:block" />
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
