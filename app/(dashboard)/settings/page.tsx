import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Building2, Bell, Palette, Shield, Database as DatabaseIcon } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold">Cài đặt</h1>
                <p className="text-muted-foreground">
                    Quản lý cài đặt hệ thống và tài khoản
                </p>
            </div>

            <Tabs defaultValue="company" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:flex">
                    <TabsTrigger value="company">
                        <Building2 className="mr-2 h-4 w-4" />
                        Công ty
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="mr-2 h-4 w-4" />
                        Thông báo
                    </TabsTrigger>
                    <TabsTrigger value="appearance">
                        <Palette className="mr-2 h-4 w-4" />
                        Giao diện
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Shield className="mr-2 h-4 w-4" />
                        Bảo mật
                    </TabsTrigger>
                    <TabsTrigger value="data">
                        <DatabaseIcon className="mr-2 h-4 w-4" />
                        Dữ liệu
                    </TabsTrigger>
                </TabsList>

                {/* Company Settings */}
                <TabsContent value="company">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin công ty</CardTitle>
                            <CardDescription>
                                Cập nhật thông tin hiển thị trên báo giá và hóa đơn
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="company_name">Tên công ty</Label>
                                    <Input id="company_name" defaultValue="Tulie Agency" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tax_code">Mã số thuế</Label>
                                    <Input id="tax_code" placeholder="0123456789" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Địa chỉ</Label>
                                <Input id="address" placeholder="Địa chỉ công ty" />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="contact@tulie.agency" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input id="phone" placeholder="0901234567" />
                                </div>
                            </div>
                            <Separator />
                            <div className="flex justify-end">
                                <Button>Lưu thay đổi</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt thông báo</CardTitle>
                            <CardDescription>
                                Quản lý cách bạn nhận thông báo từ hệ thống
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Thông báo trong app</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Nhận thông báo ngay trong ứng dụng
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email thông báo</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Nhận email khi có cập nhật quan trọng
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Cảnh báo hóa đơn quá hạn</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Nhận thông báo khi hóa đơn sắp hoặc đã quá hạn
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Báo giá được xem</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Thông báo khi khách hàng mở xem báo giá
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Giao diện</CardTitle>
                            <CardDescription>
                                Tùy chỉnh giao diện hiển thị của ứng dụng
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Chế độ tối</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Sử dụng giao diện tối để bảo vệ mắt
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Sidebar thu gọn</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Mặc định thu gọn sidebar
                                    </p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bảo mật</CardTitle>
                            <CardDescription>
                                Quản lý mật khẩu và bảo mật tài khoản
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">Mật khẩu hiện tại</Label>
                                    <Input id="current_password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new_password">Mật khẩu mới</Label>
                                    <Input id="new_password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm_password">Xác nhận mật khẩu</Label>
                                    <Input id="confirm_password" type="password" />
                                </div>
                            </div>
                            <Separator />
                            <div className="flex justify-end">
                                <Button>Đổi mật khẩu</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Data Settings */}
                <TabsContent value="data">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quản lý dữ liệu</CardTitle>
                            <CardDescription>
                                Xuất và nhập dữ liệu hệ thống
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Xuất dữ liệu</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Tải xuống toàn bộ dữ liệu dưới dạng Excel
                                    </p>
                                </div>
                                <Button variant="outline">Xuất Excel</Button>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Nhập dữ liệu</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Nhập dữ liệu khách hàng từ file Excel
                                    </p>
                                </div>
                                <Button variant="outline">Chọn file</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
