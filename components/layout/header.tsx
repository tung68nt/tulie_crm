'use client'

import { Bell, Search, Moon, Sun, LogOut, User, Settings } from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getNotifications, getUnreadCount, markNotificationAsRead, type Notification } from '@/lib/supabase/services/notification-service'

export function Header() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [userId, setUserId] = useState<string | null>(null)
    const router = useRouter()

    // Get current user and initial notifications
    useEffect(() => {
        setMounted(true)

        const fetchData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setUserId(user.id)
                const [notifs, count] = await Promise.all([
                    getNotifications(user.id),
                    getUnreadCount(user.id)
                ])
                setNotifications(notifs)
                setUnreadCount(count)
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
            case 'new_customer': return 'bg-blue-500'
            case 'quotation_accepted': return 'bg-green-500'
            case 'invoice_overdue': return 'bg-red-500'
            case 'contract_signed': return 'bg-purple-500'
            case 'payment_received': return 'bg-emerald-500'
            default: return 'bg-gray-500'
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
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm..."
                        className="w-[300px] pl-9"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                {mounted && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </Button>
                )}

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
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
                        <Button variant="ghost" className="flex items-center gap-2 px-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/avatars/user.png" />
                                <AvatarFallback className="bg-foreground text-background text-xs">
                                    TL
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-left">
                                <span className="text-sm font-medium">Tulie Admin</span>
                                <span className="text-xs text-muted-foreground">Admin</span>
                            </div>
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
