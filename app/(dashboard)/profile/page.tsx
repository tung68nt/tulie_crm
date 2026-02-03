'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

export default function ProfilePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
                <p className="text-muted-foreground">
                    Quản lý thông tin tài khoản của bạn
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                {/* Profile Card */}
                <Card>
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src="/avatars/user.png" />
                                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">TL</AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle>Tulie Admin</CardTitle>
                        <CardDescription>Administrator</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Button className="w-full" variant="outline">Đổi ảnh đại diện</Button>
                    </CardContent>
                </Card>

                {/* Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin chi tiết</CardTitle>
                        <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fullname">Họ và tên</Label>
                            <Input id="fullname" defaultValue="Tulie Admin" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue="admin@tulie.vn" disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <Input id="phone" type="tel" placeholder="+84 90..." />
                        </div>

                        <Separator className="my-4" />

                        <div className="flex justify-end gap-4">
                            <Button variant="ghost">Hủy</Button>
                            <Button>Lưu thay đổi</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
