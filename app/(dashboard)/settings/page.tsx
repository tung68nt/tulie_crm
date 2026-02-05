"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Building2, Bell, Palette, Shield, Database as DatabaseIcon, Tag, ListFilter, Plus, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getProductCategories, createProductCategory, deleteProductCategory, getSystemSetting, updateSystemSetting } from '@/lib/supabase/services/settings-service'
import { toast } from 'sonner'

export default function SettingsPage() {
    const [companySettings, setCompanySettings] = useState({
        name: "Tulie Agency",
        tax_code: "",
        address: "",
        email: "",
        phone: "",
        website: ""
    })

    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
    const [newCategory, setNewCategory] = useState('')
    const [isAddingCategory, setIsAddingCategory] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('company_settings')
        if (saved) {
            setCompanySettings(JSON.parse(saved))
        }
        loadCategories()
    }, [])

    async function loadCategories() {
        try {
            const data = await getProductCategories()
            setCategories(data)
        } catch (error) {
            console.error('Failed to load categories:', error)
        }
    }

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return
        setIsAddingCategory(true)
        try {
            await createProductCategory(newCategory.trim())
            setNewCategory('')
            await loadCategories()
            toast.success('Đã thêm danh mục mới')
        } catch (error) {
            toast.error('Lỗi khi thêm danh mục')
        } finally {
            setIsAddingCategory(false)
        }
    }

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return
        try {
            await deleteProductCategory(id)
            await loadCategories()
            toast.success('Đã xóa danh mục')
        } catch (error) {
            toast.error('Lỗi khi xóa danh mục')
        }
    }

    const handleSaveCompanySettings = () => {
        localStorage.setItem('company_settings', JSON.stringify(companySettings))
        // Here you would also save to DB in a real scenario
        // toast.success("Đã lưu thông tin công ty")
        alert("Đã lưu thông tin công ty thành công!")
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-semibold">Cài đặt</h1>
                <p className="text-muted-foreground">
                    Quản lý cài đặt hệ thống và tài khoản
                </p>
            </div>

            <Tabs defaultValue="company" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-7 lg:flex">
                    <TabsTrigger value="company">
                        <Building2 className="mr-2 h-4 w-4" />
                        Công ty
                    </TabsTrigger>
                    <TabsTrigger value="categories">
                        <Tag className="mr-2 h-4 w-4" />
                        Danh mục
                    </TabsTrigger>
                    <TabsTrigger value="statuses">
                        <ListFilter className="mr-2 h-4 w-4" />
                        Trạng thái
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
                                    <Input
                                        id="company_name"
                                        value={companySettings.name}
                                        onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tax_code">Mã số thuế</Label>
                                    <Input
                                        id="tax_code"
                                        value={companySettings.tax_code}
                                        onChange={(e) => setCompanySettings({ ...companySettings, tax_code: e.target.value })}
                                        placeholder="0123456789"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Địa chỉ</Label>
                                <Input
                                    id="address"
                                    value={companySettings.address}
                                    onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                                    placeholder="Địa chỉ công ty"
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={companySettings.email}
                                        onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                                        placeholder="contact@tulie.agency"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input
                                        id="phone"
                                        value={companySettings.phone}
                                        onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                                        placeholder="0901234567"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        value={companySettings.website}
                                        onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                                        placeholder="tulie.agency"
                                    />
                                </div>
                            </div>
                            <Separator />
                            <div className="flex justify-end">
                                <Button onClick={handleSaveCompanySettings}>Lưu thay đổi</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Categories Settings */}
                <TabsContent value="categories">
                    <Card>
                        <CardHeader>
                            <CardTitle>Danh mục sản phẩm</CardTitle>
                            <CardDescription>
                                Quản lý các nhóm sản phẩm và dịch vụ của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="new_category">Tên danh mục mới</Label>
                                    <Input
                                        id="new_category"
                                        placeholder="Ví dụ: Digital Marketing"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={handleAddCategory} disabled={isAddingCategory}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Thêm
                                    </Button>
                                </div>
                            </div>

                            <div className="border rounded-lg divide-y">
                                {categories.map((category) => (
                                    <div key={category.id} className="flex items-center justify-between p-4">
                                        <span className="font-medium">{category.name}</span>
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                {categories.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground italic">
                                        Chưa có danh mục nào được tạo
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Statuses Settings */}
                <TabsContent value="statuses">
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Trạng thái Khách hàng</CardTitle>
                                <CardDescription>Các giai đoạn trong phễu bán hàng</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Mới (Lead)', color: 'bg-blue-500' },
                                        { label: 'Tiềm năng (Prospect)', color: 'bg-yellow-500' },
                                        { label: 'Khách hàng (Customer)', color: 'bg-green-500' },
                                        { label: 'VIP', color: 'bg-purple-500' },
                                        { label: 'Đã mất (Churned)', color: 'bg-red-500' },
                                    ].map((status, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${status.color}`} />
                                                <span className="font-medium">{status.label}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" disabled>Sửa</Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Trạng thái Báo giá</CardTitle>
                                <CardDescription>Quy trình xử lý báo giá</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Nháp (Draft)', color: 'bg-gray-500' },
                                        { label: 'Đã gửi (Sent)', color: 'bg-blue-500' },
                                        { label: 'Đã xem (Viewed)', color: 'bg-indigo-500' },
                                        { label: 'Chấp nhận (Accepted)', color: 'bg-green-500' },
                                        { label: 'Từ chối (Rejected)', color: 'bg-red-500' },
                                    ].map((status, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${status.color}`} />
                                                <span className="font-medium">{status.label}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" disabled>Sửa</Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
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
