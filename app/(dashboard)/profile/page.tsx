import { createClient } from '@/lib/supabase/server'
import { getUserById } from '@/lib/supabase/services/user-service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    const dbUser = await getUserById(user.id)

    const email = user.email || ''
    const fullName = dbUser?.full_name || user.user_metadata?.full_name || 'Người dùng'
    const role = dbUser?.role || 'staff'
    const avatarUrl = dbUser?.avatar_url || user.user_metadata?.avatar_url || ''

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center shadow-sm border border-border/50">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="text-[11px] bg-zinc-950 text-white font-bold">
                            {fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-zinc-950 tracking-tight italic">Hồ sơ cá nhân</h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                        Quản lý thông tin tài khoản và cấu hình cá nhân của bạn
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                {/* Profile Card */}
                <Card className="rounded-xl border-border/50 shadow-sm overflow-hidden h-fit">
                    <CardHeader className="text-center bg-muted/30 pb-8">
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
                                    <AvatarImage src={avatarUrl} />
                                    <AvatarFallback className="text-3xl bg-zinc-950 text-white font-bold">
                                        {fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                        <CardTitle className="text-xl font-bold text-zinc-950 tracking-tight uppercase italic">{fullName}</CardTitle>
                        <CardDescription className="capitalize font-medium text-muted-foreground mt-1">{role}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Button className="w-full rounded-xl font-bold shadow-sm" variant="outline">Đổi ảnh đại diện</Button>
                    </CardContent>
                </Card>

                {/* Details */}
                <Card className="rounded-xl border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border/50">
                        <CardTitle className="text-lg font-bold text-zinc-950 tracking-tight italic">Thông tin chi tiết</CardTitle>
                        <CardDescription className="font-medium">Cập nhật thông tin cá nhân của bạn</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="fullname" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Họ và tên</Label>
                            <Input id="fullname" defaultValue={fullName} className="h-11 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all font-medium" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
                            <Input id="email" type="email" defaultValue={email} disabled className="h-11 rounded-xl bg-muted/40 font-medium cursor-not-allowed opacity-70" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Số điện thoại</Label>
                            <Input id="phone" type="tel" placeholder="+84 90..." className="h-11 rounded-xl bg-muted/20 border-transparent focus:bg-background transition-all font-medium" />
                        </div>

                        <Separator className="my-2 opacity-50" />

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="ghost" className="rounded-xl font-bold h-11 px-6">Hủy</Button>
                            <Button className="rounded-xl font-bold h-11 px-8 shadow-md shadow-zinc-200">Lưu thay đổi</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
