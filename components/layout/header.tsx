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

export function Header() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

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
                            <Badge
                                variant="destructive"
                                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                            >
                                3
                            </Badge>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-[300px] overflow-y-auto">
                            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                    <span className="font-medium">Khách hàng mới</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    ABC Corp vừa được thêm vào hệ thống
                                </p>
                                <span className="text-xs text-muted-foreground">5 phút trước</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                    <span className="font-medium">Báo giá được chấp nhận</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    XYZ Ltd đã chấp nhận báo giá QT-2026-0142
                                </p>
                                <span className="text-xs text-muted-foreground">1 giờ trước</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                    <span className="font-medium">Hóa đơn quá hạn</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Hóa đơn HDB-2026-0089 đã quá hạn 3 ngày
                                </p>
                                <span className="text-xs text-muted-foreground">3 giờ trước</span>
                            </DropdownMenuItem>
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
