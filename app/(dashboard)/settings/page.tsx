"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Building2, Bell, Palette, Shield, Database as DatabaseIcon, Tag, ListFilter, Plus, Trash2, Box, Send, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
    getProductCategories,
    createProductCategory,
    deleteProductCategory,
    getSystemSetting,
    updateSystemSetting,
    getProductUnits,
    updateProductUnits,
    getTelegramConfig,
    updateTelegramConfig
} from '@/lib/supabase/services/settings-service'
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

    const [units, setUnits] = useState<string[]>([])
    const [newUnit, setNewUnit] = useState('')
    const [isSavingUnits, setIsSavingUnits] = useState(false)
    const [telegramConfig, setTelegramConfig] = useState({
        bot_token: '',
        chat_id: '',
        is_enabled: false,
        sepay_api_key: '',
        sepay_secret_key: '',
        academy_webhook_key: ''
    })
    const [isSavingTelegram, setIsSavingTelegram] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('company_settings')
        if (saved) {
            setCompanySettings(JSON.parse(saved))
        }
        loadCategories()
        loadUnits()
        loadTelegram()
    }, [])

    async function loadTelegram() {
        const config = await getTelegramConfig()
        setTelegramConfig(config)
    }

    async function loadCategories() {
        try {
            const data = await getProductCategories()
            setCategories(data)
        } catch (error) {
            console.error('Failed to load categories:', error)
        }
    }

    async function loadUnits() {
        try {
            const data = await getProductUnits()
            setUnits(data)
        } catch (error) {
            console.error('Failed to load units:', error)
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

    const handleAddUnit = async () => {
        if (!newUnit.trim()) return
        if (units.includes(newUnit.trim())) {
            toast.error('Đơn vị tính này đã tồn tại')
            return
        }

        const updatedUnits = [...units, newUnit.trim()]
        setIsSavingUnits(true)
        try {
            await updateProductUnits(updatedUnits)
            setUnits(updatedUnits)
            setNewUnit('')
            toast.success('Đã thêm đơn vị tính mới')
        } catch (error) {
            toast.error('Lỗi khi lưu đơn vị tính')
        } finally {
            setIsSavingUnits(false)
        }
    }

    const handleDeleteUnit = async (unitToDelete: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa đơn vị tính "${unitToDelete}"?`)) return

        const updatedUnits = units.filter(u => u !== unitToDelete)
        try {
            await updateProductUnits(updatedUnits)
            setUnits(updatedUnits)
            toast.success('Đã xóa đơn vị tính')
        } catch (error) {
            toast.error('Lỗi khi xóa đơn vị tính')
        }
    }
    const handleSaveTelegram = async () => {
        setIsSavingTelegram(true)
        try {
            await updateTelegramConfig(telegramConfig)
            toast.success('Đã lưu cấu hình Telegram')
        } catch (error) {
            toast.error('Lỗi khi lưu cấu hình Telegram')
        } finally {
            setIsSavingTelegram(false)
        }
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

            <Tabs defaultValue="company" className="flex flex-col lg:flex-row gap-8">
                <aside className="lg:w-60 space-y-4">
                    <TabsList className="flex flex-col h-auto bg-transparent p-0 space-y-1 items-stretch border-none shadow-none">
                        <TabsTrigger
                            value="company"
                            className="justify-start gap-3 px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted/50 transition-all font-medium border-none data-[state=active]:shadow-none"
                        >
                            <Building2 className="h-4 w-4" />
                            Công ty
                        </TabsTrigger>
                        <TabsTrigger
                            value="categories"
                            className="justify-start gap-3 px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted/50 transition-all font-medium border-none data-[state=active]:shadow-none"
                        >
                            <Tag className="h-4 w-4" />
                            Danh mục
                        </TabsTrigger>
                        <TabsTrigger
                            value="units"
                            className="justify-start gap-3 px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted/50 transition-all font-medium border-none data-[state=active]:shadow-none"
                        >
                            <Box className="h-4 w-4" />
                            Đơn vị tính
                        </TabsTrigger>
                        <TabsTrigger
                            value="statuses"
                            className="justify-start gap-3 px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted/50 transition-all font-medium border-none data-[state=active]:shadow-none"
                        >
                            <ListFilter className="h-4 w-4" />
                            Trạng thái
                        </TabsTrigger>
                        <TabsTrigger
                            value="telegram"
                            className="justify-start gap-3 px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted/50 transition-all font-medium border-none data-[state=active]:shadow-none"
                        >
                            <Send className="h-4 w-4" />
                            Telegram Bot
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="justify-start gap-3 px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted/50 transition-all font-medium border-none data-[state=active]:shadow-none"
                        >
                            <Bell className="h-4 w-4" />
                            Thông báo
                        </TabsTrigger>
                        <TabsTrigger
                            value="appearance"
                            className="justify-start gap-3 px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted/50 transition-all font-medium border-none data-[state=active]:shadow-none"
                        >
                            <Palette className="h-4 w-4" />
                            Giao diện
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="justify-start gap-3 px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted/50 transition-all font-medium border-none data-[state=active]:shadow-none"
                        >
                            <Shield className="h-4 w-4" />
                            Bảo mật
                        </TabsTrigger>
                        <TabsTrigger
                            value="data"
                            className="justify-start gap-3 px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted/50 transition-all font-medium border-none data-[state=active]:shadow-none"
                        >
                            <DatabaseIcon className="h-4 w-4" />
                            Dữ liệu
                        </TabsTrigger>
                    </TabsList>
                </aside>

                <div className="flex-1 max-w-4xl">

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

                    {/* Units Settings */}
                    <TabsContent value="units">
                        <Card>
                            <CardHeader>
                                <CardTitle>Đơn vị tính (ĐVT)</CardTitle>
                                <CardDescription>
                                    Quản lý các đơn vị tính cho sản phẩm (Gói, Giờ, Dự án...)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="new_unit">Tên đơn vị mới</Label>
                                        <Input
                                            id="new_unit"
                                            placeholder="Ví dụ: Mét, Kg, Bộ..."
                                            value={newUnit}
                                            onChange={(e) => setNewUnit(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddUnit()}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={handleAddUnit} disabled={isSavingUnits}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Thêm
                                        </Button>
                                    </div>
                                </div>

                                <div className="border rounded-lg divide-y">
                                    {units.map((unit) => (
                                        <div key={unit} className="flex items-center justify-between p-4">
                                            <span className="font-medium">{unit}</span>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteUnit(unit)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                    {units.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground italic">
                                            Chưa có đơn vị tính nào được cấu hình
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

                    {/* Telegram Settings */}
                    <TabsContent value="telegram">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Send className="h-5 w-5 text-[#0088cc]" />
                                    Cấu hình Telegram Bot
                                </CardTitle>
                                <CardDescription>
                                    Tích hợp thông báo đơn hàng, thanh toán và hành động của khách hàng lên Telegram.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-bold text-primary">Kích hoạt thông báo</Label>
                                        <p className="text-sm text-muted-foreground">Bật/tắt toàn bộ thông báo gửi đến Telegram.</p>
                                    </div>
                                    <Switch
                                        checked={telegramConfig.is_enabled}
                                        onCheckedChange={(val) => setTelegramConfig({ ...telegramConfig, is_enabled: val })}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bot_token" className="font-semibold text-xs text-muted-foreground">Bot Token (Từ @BotFather)</Label>
                                        <Input
                                            id="bot_token"
                                            placeholder="1234567890:ABCDE..."
                                            type="password"
                                            value={telegramConfig.bot_token}
                                            onChange={(e) => setTelegramConfig({ ...telegramConfig, bot_token: e.target.value })}
                                            className="h-11 border-muted/50 focus:border-[#0088cc]/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="chat_id" className="font-semibold text-xs text-muted-foreground">Chat ID (Group hoặc Cá nhân)</Label>
                                        <Input
                                            id="chat_id"
                                            placeholder="-100123456789"
                                            value={telegramConfig.chat_id}
                                            onChange={(e) => setTelegramConfig({ ...telegramConfig, chat_id: e.target.value })}
                                            className="h-11 border-muted/50 focus:border-[#0088cc]/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sepay_api_key" className="font-semibold text-xs text-[#0088cc]">SePay API Key (Tuỳ chọn)</Label>
                                            <Input
                                                id="sepay_api_key"
                                                type="password"
                                                placeholder="Để trống nếu không dùng"
                                                value={telegramConfig.sepay_api_key || ''}
                                                onChange={(e) => setTelegramConfig({ ...telegramConfig, sepay_api_key: e.target.value })}
                                                className="h-11 border-muted/50 focus:border-[#0088cc]/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="sepay_secret_key" className="font-semibold text-xs text-[#0088cc]">SePay Webhook Secret</Label>
                                            <Input
                                                id="sepay_secret_key"
                                                type="password"
                                                placeholder="Mật khẩu Webhook"
                                                value={telegramConfig.sepay_secret_key || ''}
                                                onChange={(e) => setTelegramConfig({ ...telegramConfig, sepay_secret_key: e.target.value })}
                                                className="h-11 border-muted/50 focus:border-[#0088cc]/50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-bold text-muted-foreground">SePay Webhook URL</h4>
                                        <Badge variant="outline" className="text-[9px] font-bold bg-white">Automatic Matching</Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-white dark:bg-card border rounded p-2 text-[10px] font-mono break-all line-clamp-1 opacity-70">
                                            {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/sepay` : '...'}
                                        </div>
                                        <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold" onClick={() => {
                                            const url = `${window.location.origin}/api/webhooks/sepay`
                                            navigator.clipboard.writeText(url)
                                            toast.success('Đã copy Webhook URL')
                                        }}>Copy</Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-2 italic leading-tight">Cấu hình URL này vào trang Dashboard SePay để tự động khớp tiền và gửi tin nhắn Telegram.</p>
                                </div>

                                <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-bold text-muted-foreground">Academy Webhook URL</h4>
                                        <Badge variant="outline" className="text-[9px] font-bold bg-orange-500 text-white border-none">Academy Push</Badge>
                                    </div>
                                    <div className="flex gap-2 mb-4">
                                        <div className="flex-1 bg-white dark:bg-card border rounded p-2 text-[10px] font-mono break-all line-clamp-1 opacity-70">
                                            {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/academy` : '...'}
                                        </div>
                                        <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold" onClick={() => {
                                            const url = `${window.location.origin}/api/webhooks/academy`
                                            navigator.clipboard.writeText(url)
                                            toast.success('Đã copy Academy Webhook URL')
                                        }}>Copy</Button>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="academy_webhook_key" className="text-[10px] font-bold text-muted-foreground">Webhook API Key</Label>
                                        <Input
                                            id="academy_webhook_key"
                                            placeholder="Nhập khóa để Academy xác thực"
                                            value={telegramConfig.academy_webhook_key || ''}
                                            onChange={(e) => setTelegramConfig({ ...telegramConfig, academy_webhook_key: e.target.value })}
                                            className="h-9 text-xs border-muted/50"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-2 italic leading-tight">Dùng khóa này cấu hình vào Tulie Academy để đẩy dữ liệu doanh thu về CRM.</p>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                    <h4 className="text-xs font-black  text-blue-700 dark:text-blue-300 mb-2">Hướng dẫn nhanh:</h4>
                                    <ol className="text-xs space-y-1 text-blue-600 dark:text-blue-400 list-decimal pl-4">
                                        <li>Tạo bot qua <b>@BotFather</b> để lấy Token.</li>
                                        <li>Thêm bot vào nhóm và lấy <b>Chat ID</b> (Dùng bot @userinfobot hoặc @getidsbot).</li>
                                        <li>Nhấn <b>Lưu cấu hình</b> để bắt đầu nhận thông báo.</li>
                                    </ol>
                                </div>

                                <Separator />
                                <div className="flex justify-end">
                                    <Button onClick={handleSaveTelegram} disabled={isSavingTelegram} className="bg-[#0088cc] hover:bg-[#0077bb]">
                                        {isSavingTelegram ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Lưu cấu hình Telegram
                                    </Button>
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
                </div>
            </Tabs>
        </div>
    )
}
