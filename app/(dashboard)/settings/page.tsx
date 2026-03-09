"use client"
import * as React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Building2, Bell, Palette, Shield, Database as DatabaseIcon, Tag, ListFilter, Plus, Trash2, Box, Send, Loader2, Mail, CheckCircle2, Globe, Settings, BookOpen, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import {
    getProductCategories,
    createProductCategory,
    deleteProductCategory,
    getProductUnits,
    updateProductUnits,
    getTelegramConfig,
    updateTelegramConfig,
    getBrandConfig,
    updateBrandConfig,
    getAppearanceConfig,
    updateAppearanceConfig,
    updateSystemSetting,
    getSystemSetting,
    getBrands, // Added
    updateBrands // Added
} from '@/lib/supabase/services/settings-service'
import { testTelegramConnection } from '@/lib/supabase/services/telegram-service'
import { testSmtpConnection, sendEmail } from '@/lib/supabase/services/email-service'
import {
    getDocumentBundles,
    deleteDocumentBundle,
    createDocumentBundle,
    getDocumentTemplates
} from '@/lib/supabase/services/document-template-service'
import { DocumentBundle, DocumentTemplate } from '@/types'

export default function SettingsPage() {
    const [companySettings, setCompanySettings] = useState({
        name: "Tulie Agency",
        tax_code: "",
        address: "",
        email: "info@tulie.vn",
        phone: "",
        website: "tulie.vn",
        logo_url: "/file/tulie-agency-logo.png",
        favicon_url: "/logo-icon.png",
        bank_name: "",
        bank_account_no: "",
        bank_account_name: "",
        bank_branch: "",
        studio_bank_name: "",
        studio_bank_account_no: "",
        studio_bank_account_name: "",
        studio_bank_branch: "",
        default_notes: "",
        default_payment_terms: ""
    })

    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
    const [newCategory, setNewCategory] = useState('')
    const [isAddingCategory, setIsAddingCategory] = useState(false)

    const [units, setUnits] = useState<string[]>([])
    const [newUnit, setNewUnit] = useState('')
    const [isSavingUnits, setIsSavingUnits] = useState(false)

    // New states for Brands
    const [brands, setBrands] = useState<string[]>([])
    const [newBrand, setNewBrand] = useState('')
    const [isSavingBrands, setIsSavingBrands] = useState(false)

    const [telegramConfig, setTelegramConfig] = useState({
        bot_token: '',
        chat_id: '',
        is_enabled: false,
        sepay_api_key: '',
        sepay_secret_key: '',
        academy_webhook_key: ''
    })
    const [isSavingTelegram, setIsSavingTelegram] = useState(false)
    const [isTestingTelegram, setIsTestingTelegram] = useState(false)
    const [smtpConfig, setSmtpConfig] = useState({
        host: '',
        port: 587,
        secure: false,
        user: '',
        pass: '',
        from_name: 'Tulie CRM',
        from_email: ''
    })
    const [isSavingSmtp, setIsSavingSmtp] = useState(false)
    const [isTestingSmtp, setIsTestingSmtp] = useState(false)
    const { theme, setTheme } = useTheme()
    const [appearance, setAppearance] = useState({
        sidebarCollapsed: false
    })
    const [brandConfig, setBrandConfig] = useState({
        brand_name: 'Tulie Agency',
        email: 'info@tulie.vn',
        bank_name: '',
        bank_account_no: '',
        bank_account_name: '',
        bank_branch: '',
        studio_bank_name: '',
        studio_bank_account_no: '',
        studio_bank_account_name: '',
        studio_bank_branch: '',
        default_notes: '',
        default_payment_terms: ''
    })
    const [isSavingBrand, setIsSavingBrand] = useState(false)

    useEffect(() => {
        loadCompanySettings()
        loadCategories()
        loadUnits()
        loadBrands() // Added
        loadTelegram()
        loadAppearance()
        loadSmtp()
        loadBrand()
        loadBundles()
    }, [])

    const [bundles, setBundles] = useState<DocumentBundle[]>([])
    const [templates, setTemplates] = useState<DocumentTemplate[]>([])
    const [isSavingBundle, setIsSavingBundle] = useState(false)
    const [newBundle, setNewBundle] = useState({ name: '', description: '', templates: [] as string[] })

    async function loadBundles() {
        const [bData, tData] = await Promise.all([
            getDocumentBundles(),
            getDocumentTemplates()
        ])
        setBundles(bData)
        setTemplates(tData)
    }

    const handleCreateBundle = async () => {
        if (!newBundle.name || newBundle.templates.length === 0) {
            toast.error('Vui lòng nhập tên và chọn ít nhất 1 mẫu giấy tờ')
            return
        }
        setIsSavingBundle(true)
        try {
            await createDocumentBundle(newBundle)
            setNewBundle({ name: '', description: '', templates: [] })
            await loadBundles()
            toast.success('Đã tạo bộ chứng từ mới')
        } catch {
            toast.error('Lỗi khi tạo bộ chứng từ')
        } finally {
            setIsSavingBundle(false)
        }
    }

    const handleDeleteBundle = async (id: string) => {
        if (!confirm('Xoá bộ chứng từ này?')) return
        try {
            await deleteDocumentBundle(id)
            await loadBundles()
            toast.success('Đã xoá')
        } catch {
            toast.error('Lỗi khi xoá')
        }
    }

    async function loadBrand() {
        const config = await getBrandConfig()
        if (config) setBrandConfig(config)
    }

    async function loadSmtp() {
        const config = await getSystemSetting('smtp_config')
        if (config) setSmtpConfig(config)
    }

    async function loadAppearance() {
        const config = await getAppearanceConfig()
        setAppearance({ sidebarCollapsed: !!config.sidebarCollapsed })
    }

    async function loadCompanySettings() {
        const config = await getBrandConfig()
        setCompanySettings({
            name: config.brand_name || "Tulie Agency",
            tax_code: config.tax_code || "",
            address: config.address || "",
            email: config.email || "info@tulie.vn",
            phone: config.phone || "",
            website: config.website || "tulie.vn",
            logo_url: config.logo_url || "/file/tulie-agency-logo.png",
            favicon_url: config.favicon_url || "/logo-icon.png",
            bank_name: config.bank_name || "",
            bank_account_no: config.bank_account_no || "",
            bank_account_name: config.bank_account_name || "",
            bank_branch: config.bank_branch || "",
            studio_bank_name: config.studio_bank_name || "",
            studio_bank_account_no: config.studio_bank_account_no || "",
            studio_bank_account_name: config.studio_bank_account_name || "",
            studio_bank_branch: config.studio_bank_branch || "",
            default_notes: config.default_notes || "",
            default_payment_terms: config.default_payment_terms || ""
        })
    }

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

    async function loadBrands() { // Added
        try {
            const data = await getBrands()
            setBrands(data)
        } catch (error) {
            console.error('Failed to load brands:', error)
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

    const [isSavingCompany, setIsSavingCompany] = useState(false)
    const handleSaveCompanySettings = async () => {
        setIsSavingCompany(true)
        try {
            await updateBrandConfig({
                brand_name: companySettings.name,
                tax_code: companySettings.tax_code,
                address: companySettings.address,
                email: companySettings.email,
                phone: companySettings.phone,
                website: companySettings.website,
                logo_url: companySettings.logo_url,
                favicon_url: companySettings.favicon_url,
                bank_name: companySettings.bank_name,
                bank_account_no: companySettings.bank_account_no,
                bank_account_name: companySettings.bank_account_name,
                bank_branch: companySettings.bank_branch,
                studio_bank_name: companySettings.studio_bank_name,
                studio_bank_account_no: companySettings.studio_bank_account_no,
                studio_bank_account_name: companySettings.studio_bank_account_name,
                studio_bank_branch: companySettings.studio_bank_branch,
                default_notes: companySettings.default_notes,
                default_payment_terms: companySettings.default_payment_terms
            })
            toast.success("Đã lưu thông tin thương hiệu thành công!")
        } catch (error: any) {
            console.error('Brand config save error:', error)
            toast.error(`Lỗi khi lưu: ${error?.message || 'Không xác định'}`)
        } finally {
            setIsSavingCompany(false)
        }
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

    const handleUpdateAppearance = async (field: string, value: any) => {
        const newAppearance = { ...appearance, [field]: value }
        setAppearance(newAppearance)
        try {
            await updateAppearanceConfig({
                darkMode: theme === 'dark',
                ...newAppearance,
                [field]: value
            })
        } catch (error) {
            console.error('Error saving appearance config:', error)
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

    const handleTestTelegram = async () => {
        setIsTestingTelegram(true)
        try {
            const success = await testTelegramConnection()
            if (success) {
                toast.success('Đã gửi tin nhắn thử nghiệm! Vui lòng kiểm tra Telegram.')
            } else {
                toast.error('Gửi tin nhắn thử nghiệm thất bại. Vui lòng kiểm tra lại Token và Chat ID.')
            }
        } catch (error) {
            toast.error('Lỗi khi kết nối tới Telegram')
        } finally {
            setIsTestingTelegram(false)
        }
    }

    const handleSaveSmtp = async () => {
        setIsSavingSmtp(true)
        try {
            await updateSystemSetting('smtp_config', smtpConfig)
            toast.success('Đã lưu cấu hình email SMTP')
        } catch (error) {
            toast.error('Lỗi khi lưu cấu hình SMTP')
        } finally {
            setIsSavingSmtp(false)
        }
    }

    const handleAddBrand = async () => { // Added
        if (!newBrand.trim()) return
        if (brands.includes(newBrand.trim())) {
            toast.error('Thương hiệu này đã tồn tại')
            return
        }

        const updatedBrands = [...brands, newBrand.trim()]
        setIsSavingBrands(true)
        try {
            await updateBrands(updatedBrands)
            setBrands(updatedBrands)
            setNewBrand('')
            toast.success('Đã thêm thương hiệu mới')
        } catch (error) {
            toast.error('Lỗi khi lưu thương hiệu')
        } finally {
            setIsSavingBrands(false)
        }
    }

    const handleDeleteBrand = async (brandToDelete: string) => { // Added
        if (!confirm(`Bạn có chắc chắn muốn xóa thương hiệu "${brandToDelete}"?`)) return

        const updatedBrands = brands.filter(b => b !== brandToDelete)
        try {
            await updateBrands(updatedBrands)
            setBrands(updatedBrands)
            toast.success('Đã xóa thương hiệu')
        } catch (error) {
            toast.error('Lỗi khi xóa thương hiệu')
        }
    }

    const handleTestSmtp = async () => {
        if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
            toast.error('Vui lòng nhập đầy đủ thông tin SMTP')
            return
        }
        setIsTestingSmtp(true)
        try {
            const result = await testSmtpConnection(smtpConfig)
            if (result.success) {
                toast.success('Kết nối SMTP thành công! Email thử nghiệm đã được gửi.')
            } else {
                toast.error(`Lỗi kết nối: ${result.error}`)
            }
        } catch (error: any) {
            toast.error(`Lỗi hệ thống: ${error.message}`)
        } finally {
            setIsTestingSmtp(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Cài đặt</h1>
                    <p className="text-muted-foreground font-normal">
                        Quản lý cài đặt hệ thống và tài khoản
                    </p>
                </div>
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
                            value="brands" // Changed value from "brand" to "brands"
                            className="justify-start gap-3 px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted/50 transition-all font-medium border-none data-[state=active]:shadow-none"
                        >
                            <Globe className="h-4 w-4" />
                            Thương hiệu
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
                            Cài đặt Telegram
                        </TabsTrigger>
                        <TabsTrigger
                            value="mail"
                            className="justify-start gap-3 px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted/50 transition-all font-medium border-none data-[state=active]:shadow-none"
                        >
                            <Mail className="h-4 w-4" />
                            Email SMTP
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
                        <TabsTrigger
                            value="bundles"
                            className="justify-start gap-3 px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground hover:bg-muted/50 transition-all font-medium border-none data-[state=active]:shadow-none"
                        >
                            <BookOpen className="h-4 w-4" />
                            Bộ chứng từ (Bundle)
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
                                            placeholder="tulie.vn"
                                        />
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium">Cấu hình nhận diện thương hiệu</h4>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="logo_url">Đường dẫn Logo (Hệ thống & Portal)</Label>
                                            <Input
                                                id="logo_url"
                                                value={companySettings.logo_url}
                                                onChange={(e) => setCompanySettings({ ...companySettings, logo_url: e.target.value })}
                                                placeholder="/file/tulie-agency-logo.png"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="favicon_url">Đường dẫn Favicon (Biểu tượng trình duyệt)</Label>
                                            <Input
                                                id="favicon_url"
                                                value={companySettings.favicon_url}
                                                onChange={(e) => setCompanySettings({ ...companySettings, favicon_url: e.target.value })}
                                                placeholder="/logo-icon.png"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                                        <div className="space-y-1 flex-1">
                                            <p className="text-xs text-muted-foreground">Xem trước Logo:</p>
                                            <div className="h-12 flex items-center bg-white p-2 rounded border">
                                                <img src={companySettings.logo_url} alt="Logo Preview" className="h-full object-contain" />
                                            </div>
                                        </div>
                                        <div className="space-y-1 w-24">
                                            <p className="text-xs text-muted-foreground">Favicon:</p>
                                            <div className="h-12 w-12 flex items-center justify-center bg-white p-2 rounded border">
                                                <img src={companySettings.favicon_url} alt="Favicon Preview" className="h-8 w-8 object-contain" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-medium">Tài khoản ngân hàng Tulie Agency</h4>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="bank_name">Ngân hàng (Agency)</Label>
                                                <Input
                                                    id="bank_name"
                                                    value={companySettings.bank_name}
                                                    onChange={(e) => setCompanySettings({ ...companySettings, bank_name: e.target.value })}
                                                    placeholder="Ví dụ: MB Bank"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="bank_account_no">Số tài khoản</Label>
                                                <Input
                                                    id="bank_account_no"
                                                    value={companySettings.bank_account_no}
                                                    onChange={(e) => setCompanySettings({ ...companySettings, bank_account_no: e.target.value })}
                                                    placeholder="Ví dụ: 0123456789"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="bank_account_name">Chủ tài khoản</Label>
                                                <Input
                                                    id="bank_account_name"
                                                    value={companySettings.bank_account_name}
                                                    onChange={(e) => setCompanySettings({ ...companySettings, bank_account_name: e.target.value })}
                                                    placeholder="Ví dụ: CONG TY TNHH ABC"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="bank_branch">Chi nhánh</Label>
                                                <Input
                                                    id="bank_branch"
                                                    value={companySettings.bank_branch}
                                                    onChange={(e) => setCompanySettings({ ...companySettings, bank_branch: e.target.value })}
                                                    placeholder="Ví dụ: Thanh Xuân - Hà Nội"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-dashed">
                                        <h4 className="text-sm font-medium">Tài khoản ngân hàng Tulie Studio (Cá nhân)</h4>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="studio_bank_name">Ngân hàng</Label>
                                                <Input
                                                    id="studio_bank_name"
                                                    value={companySettings.studio_bank_name}
                                                    onChange={(e) => setCompanySettings({ ...companySettings, studio_bank_name: e.target.value })}
                                                    placeholder="Ví dụ: TPBank"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="studio_bank_account_no">Số tài khoản</Label>
                                                <Input
                                                    id="studio_bank_account_no"
                                                    value={companySettings.studio_bank_account_no}
                                                    onChange={(e) => setCompanySettings({ ...companySettings, studio_bank_account_no: e.target.value })}
                                                    placeholder="Ví dụ: 0123456789"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="studio_bank_account_name">Chủ tài khoản</Label>
                                                <Input
                                                    id="studio_bank_account_name"
                                                    value={companySettings.studio_bank_account_name}
                                                    onChange={(e) => setCompanySettings({ ...companySettings, studio_bank_account_name: e.target.value })}
                                                    placeholder="Ví dụ: NGUYEN VAN A"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="studio_bank_branch">Chi nhánh</Label>
                                                <Input
                                                    id="studio_bank_branch"
                                                    value={companySettings.studio_bank_branch}
                                                    onChange={(e) => setCompanySettings({ ...companySettings, studio_bank_branch: e.target.value })}
                                                    placeholder="Ví dụ: Hà Nội"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="default_payment_terms">Điều khoản thanh toán mặc định</Label>
                                        <Textarea
                                            id="default_payment_terms"
                                            value={companySettings.default_payment_terms}
                                            onChange={(e) => setCompanySettings({ ...companySettings, default_payment_terms: e.target.value })}
                                            placeholder="Ví dụ: Thanh toán trong vòng 7 ngày kể từ ngày nhận được hóa đơn..."
                                            rows={2}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="default_notes">Ghi chú mặc định</Label>
                                        <Textarea
                                            id="default_notes"
                                            value={companySettings.default_notes}
                                            onChange={(e) => setCompanySettings({ ...companySettings, default_notes: e.target.value })}
                                            placeholder="Ghi chú xuất hiện ở cuối báo giá/hóa đơn"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex justify-end">
                                    <Button onClick={handleSaveCompanySettings} disabled={isSavingCompany}>
                                        {isSavingCompany && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Lưu thay đổi
                                    </Button>
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

                    {/* Brands Settings (New) */}
                    <TabsContent value="brands">
                        <Card>
                            <CardHeader>
                                <CardTitle>Danh mục Thương hiệu</CardTitle>
                                <CardDescription>
                                    Quản lý các thương hiệu con của hệ thống (Tulie Agency, Tulie Studio...)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="new_brand">Tên thương hiệu mới</Label>
                                        <Input
                                            id="new_brand"
                                            placeholder="Ví dụ: Tulie Lab..."
                                            value={newBrand}
                                            onChange={(e) => setNewBrand(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={handleAddBrand} disabled={isSavingBrands}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Thêm
                                        </Button>
                                    </div>
                                </div>

                                <div className="border rounded-lg divide-y">
                                    {brands.map((brand) => (
                                        <div key={brand} className="flex items-center justify-between p-4">
                                            <span className="font-medium">{brand}</span>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteBrand(brand)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                    {brands.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground italic">
                                            Chưa có thương hiệu nào được cấu hình
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
                                            { label: 'Mới (Lead)', color: 'bg-zinc-400' },
                                            { label: 'Tiềm năng (Prospect)', color: 'bg-zinc-500' },
                                            { label: 'Khách hàng (Customer)', color: 'bg-zinc-700' },
                                            { label: 'VIP', color: 'bg-zinc-900' },
                                            { label: 'Đã mất (Churned)', color: 'bg-zinc-300' },
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
                                            { label: 'Nháp (Draft)', color: 'bg-zinc-400' },
                                            { label: 'Đã gửi (Sent)', color: 'bg-zinc-500' },
                                            { label: 'Đã xem (Viewed)', color: 'bg-zinc-600' },
                                            { label: 'Chấp nhận (Accepted)', color: 'bg-zinc-900' },
                                            { label: 'Từ chối (Rejected)', color: 'bg-zinc-300' },
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
                        <Card className="border-border/50 shadow-sm rounded-xl overflow-hidden">
                            <CardHeader className="border-b bg-muted/20">
                                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                    <Send className="h-5 w-5 text-primary" />
                                    Cấu hình Telegram Bot
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Tích hợp thông báo đơn hàng, thanh toán và hành động của khách hàng lên Telegram.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8 pt-6">
                                <div className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-bold text-zinc-900 dark:text-zinc-50">Kích hoạt thông báo</Label>
                                        <p className="text-xs text-muted-foreground uppercase tracking-tight font-medium">Bật/tắt toàn bộ thông báo gửi đến Telegram.</p>
                                    </div>
                                    <Switch
                                        checked={telegramConfig.is_enabled}
                                        onCheckedChange={(val) => setTelegramConfig({ ...telegramConfig, is_enabled: val })}
                                    />
                                </div>

                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="bot_token" className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Bot Token (Từ @BotFather)</Label>
                                        <Input
                                            id="bot_token"
                                            placeholder="1234567890:ABCDE..."
                                            type="password"
                                            value={telegramConfig.bot_token}
                                            onChange={(e) => setTelegramConfig({ ...telegramConfig, bot_token: e.target.value })}
                                            className="h-11 border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 rounded-xl font-mono text-xs"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="chat_id" className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Chat ID (Group hoặc Cá nhân)</Label>
                                        <Input
                                            id="chat_id"
                                            placeholder="-100123456789"
                                            value={telegramConfig.chat_id}
                                            onChange={(e) => setTelegramConfig({ ...telegramConfig, chat_id: e.target.value })}
                                            className="h-11 border-zinc-200 dark:border-zinc-800 focus:ring-zinc-900 rounded-xl font-mono text-xs"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sepay_api_key" className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">SePay API Key</Label>
                                            <Input
                                                id="sepay_api_key"
                                                type="password"
                                                placeholder="Để trống nếu không dùng"
                                                value={telegramConfig.sepay_api_key || ''}
                                                onChange={(e) => setTelegramConfig({ ...telegramConfig, sepay_api_key: e.target.value })}
                                                className="h-11 border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="sepay_secret_key" className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">SePay Webhook Secret</Label>
                                            <Input
                                                id="sepay_secret_key"
                                                type="password"
                                                placeholder="Mật khẩu Webhook"
                                                value={telegramConfig.sepay_secret_key || ''}
                                                onChange={(e) => setTelegramConfig({ ...telegramConfig, sepay_secret_key: e.target.value })}
                                                className="h-11 border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 bg-muted/20 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] uppercase font-black tracking-widest text-zinc-500">SePay Webhook URL</h4>
                                        <Badge variant="outline" className="text-[9px] font-bold bg-zinc-900 text-white border-none py-0.5 rounded-md">Realtime Sync</Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-[10px] font-mono break-all opacity-70">
                                            {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/sepay` : '...'}
                                        </div>
                                        <Button size="sm" variant="outline" className="h-10 px-4 rounded-xl text-xs font-bold border-zinc-300 shadow-sm" onClick={() => {
                                            const url = `${window.location.origin}/api/webhooks/sepay`
                                            navigator.clipboard.writeText(url)
                                            toast.success('Đã copy Webhook URL')
                                        }}>Copy</Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic leading-relaxed">Cấu hình URL này vào trang Dashboard SePay để tự động khớp tiền và gửi tin nhắn Telegram.</p>
                                </div>

                                <div className="p-5 bg-muted/20 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Academy Webhook URL</h4>
                                        <Badge variant="outline" className="text-[9px] font-bold bg-white text-zinc-900 border-zinc-900 py-0.5 rounded-md">Academy Integration</Badge>
                                    </div>
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1 space-y-3">
                                            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-[10px] font-mono break-all opacity-70">
                                                {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/academy` : '...'}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="academy_webhook_key" className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Webhook API Key</Label>
                                                <Input
                                                    id="academy_webhook_key"
                                                    placeholder="Nhập khóa để Academy xác thực"
                                                    value={telegramConfig.academy_webhook_key || ''}
                                                    onChange={(e) => setTelegramConfig({ ...telegramConfig, academy_webhook_key: e.target.value })}
                                                    className="h-10 text-xs border-zinc-200 dark:border-zinc-800 rounded-xl"
                                                />
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" className="h-10 px-4 rounded-xl text-xs font-bold border-zinc-300 shadow-sm mb-[0px]" onClick={() => {
                                            const url = `${window.location.origin}/api/webhooks/academy`
                                            navigator.clipboard.writeText(url)
                                            toast.success('Đã copy Academy Webhook URL')
                                        }}>Copy</Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic leading-relaxed">Dùng khóa này cấu hình vào Tulie Academy để đẩy dữ liệu doanh thu về CRM.</p>
                                </div>

                                <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-50 mb-4">Cấu hình loại thông báo:</h4>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {[
                                            { key: 'notify_new_retail_order', templateKey: 'template_new_retail_order', label: 'Đơn hàng B2C mới', placeholder: 'Dùng biến: {order_number}, {customer_name}, {customer_phone}, {total_amount}, {payment_status}, {order_status}' },
                                            { key: 'notify_retail_payment', templateKey: 'template_retail_payment', label: 'Thanh toán B2C', placeholder: 'Dùng biến: {amount}, {order_number}, {customer_name}' },
                                            { key: 'notify_b2b_payment', templateKey: 'template_b2b_payment', label: 'Thanh toán B2B', placeholder: 'Dùng biến: {amount}, {contract_number}, {company_name}' },
                                            { key: 'notify_new_quotation', templateKey: 'template_new_quotation', label: 'Báo giá mới đã tạo', placeholder: 'Dùng biến: {quotation_number}, {company_name}, {creator_name}, {total_amount}' },
                                            { key: 'notify_quotation_viewed', templateKey: 'template_quotation_viewed', label: 'Khách xem báo giá', placeholder: 'Dùng biến: {quotation_number}, {company_name}, {deal_title}, {view_count}' },
                                            { key: 'notify_quotation_accepted', templateKey: 'template_quotation_accepted', label: 'Khách duyệt báo giá', placeholder: 'Dùng biến: {quotation_number}, {company_name}, {total_amount}' },
                                            { key: 'notify_new_invoice', templateKey: 'template_new_invoice', label: 'Hóa đơn mới đã xuất', placeholder: 'Dùng biến: {invoice_number}, {company_name}, {total_amount}' },
                                            { key: 'notify_unmatched_payment', templateKey: 'template_unmatched_payment', label: 'Thanh toán không khớp', placeholder: 'Nội dung...' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex flex-col gap-3 p-4 border rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-100 dark:border-zinc-800">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor={item.key} className="text-xs font-bold">{item.label}</Label>
                                                    <Switch
                                                        id={item.key}
                                                        checked={(telegramConfig as any)[item.key] !== false}
                                                        onCheckedChange={(val) => setTelegramConfig({ ...telegramConfig, [item.key]: val })}
                                                    />
                                                </div>
                                                <div className="pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2 block">Nội dung mẫu (Telegram HTML)</Label>
                                                    <Textarea
                                                        value={(telegramConfig as any)[item.templateKey] || ''}
                                                        onChange={(e) => setTelegramConfig({ ...telegramConfig, [item.templateKey]: e.target.value })}
                                                        placeholder={item.placeholder}
                                                        className="min-h-[100px] text-xs font-mono whitespace-pre-wrap"
                                                    />
                                                    <p className="text-[10px] text-muted-foreground mt-1">{item.placeholder}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-50 mb-3">Hướng dẫn nhanh:</h4>
                                    <ol className="text-xs space-y-2 text-zinc-600 dark:text-zinc-400 list-decimal pl-4 font-medium">
                                        <li>Tạo bot qua <span className="text-zinc-900 dark:text-zinc-50 font-bold">@BotFather</span> để lấy Token.</li>
                                        <li>Thêm bot vào nhóm và lấy <span className="text-zinc-900 dark:text-zinc-50 font-bold">Chat ID</span> (Dùng bot @userinfobot hoặc @getidsbot).</li>
                                        <li>Nhấn <span className="text-zinc-900 dark:text-zinc-50 font-bold">Lưu cấu hình</span> để bắt đầu nhận thông báo.</li>
                                    </ol>
                                </div>

                                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-end items-stretch sm:items-center">
                                    <Button
                                        variant="outline"
                                        onClick={handleTestTelegram}
                                        disabled={isTestingTelegram || !telegramConfig.bot_token || !telegramConfig.chat_id}
                                        className="h-12 px-6 rounded-xl font-bold border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 transition-all"
                                    >
                                        {isTestingTelegram ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                        Gửi tin nhắn thử
                                    </Button>
                                    <Button onClick={handleSaveTelegram} disabled={isSavingTelegram} className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 h-12 px-8 rounded-xl font-bold shadow-lg shadow-zinc-200 dark:shadow-none transition-all active:scale-95">
                                        {isSavingTelegram ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Lưu cấu hình Telegram
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Email SMTP Settings */}
                    <TabsContent value="mail">
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-2xl">
                            <CardHeader className="bg-muted/30 border-b border-border/50 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold">Email SMTP</CardTitle>
                                        <CardDescription className="text-sm font-medium">Cấu hình server gửi email cho khách hàng</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider opacity-70">SMTP Host</Label>
                                        <Input
                                            placeholder="smtp.gmail.com"
                                            value={smtpConfig.host}
                                            onChange={e => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                                            className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-500/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider opacity-70">SMTP Port</Label>
                                        <Input
                                            placeholder="587"
                                            value={smtpConfig.port}
                                            onChange={e => setSmtpConfig({ ...smtpConfig, port: Number(e.target.value) || 587 })}
                                            className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-500/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider opacity-70">User / Email</Label>
                                        <Input
                                            placeholder="email@example.com"
                                            value={smtpConfig.user}
                                            onChange={e => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                                            className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-500/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider opacity-70">Password / App Password</Label>
                                        <Input
                                            type="password"
                                            placeholder="****************"
                                            value={smtpConfig.pass}
                                            onChange={e => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                                            className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-500/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider opacity-70">Tên người gửi (From Name)</Label>
                                        <Input
                                            placeholder="Tulie CRM"
                                            value={smtpConfig.from_name}
                                            onChange={e => setSmtpConfig({ ...smtpConfig, from_name: e.target.value })}
                                            className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-500/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider opacity-70">Email hiển thị (From Email)</Label>
                                        <Input
                                            placeholder="info@tulie.vn"
                                            value={smtpConfig.from_email}
                                            onChange={e => setSmtpConfig({ ...smtpConfig, from_email: e.target.value })}
                                            className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-500/20"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 p-4 border rounded-xl bg-zinc-50/30 border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800">
                                    <Switch
                                        id="smtp_secure"
                                        checked={smtpConfig.secure}
                                        onCheckedChange={val => setSmtpConfig({ ...smtpConfig, secure: val })}
                                    />
                                    <Label htmlFor="smtp_secure" className="text-sm font-bold">Sử dụng SSL/TLS (Tắt nếu dùng Port 587 STARTTLS)</Label>
                                </div>

                                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-end items-stretch sm:items-center border-t border-border/50">
                                    <Button
                                        variant="outline"
                                        onClick={handleTestSmtp}
                                        disabled={isTestingSmtp || !smtpConfig.host || !smtpConfig.user}
                                        className="h-12 px-6 rounded-xl font-bold border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 transition-all"
                                    >
                                        {isTestingSmtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                        Gửi email thử
                                    </Button>
                                    <Button onClick={handleSaveSmtp} disabled={isSavingSmtp} className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 h-12 px-8 rounded-xl font-bold shadow-lg shadow-zinc-200 dark:shadow-none transition-all active:scale-95">
                                        {isSavingSmtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Lưu cấu hình SMTP
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
                                    <Switch
                                        checked={theme === 'dark'}
                                        onCheckedChange={(val) => {
                                            const newTheme = val ? 'dark' : 'light'
                                            setTheme(newTheme)
                                            updateAppearanceConfig({ ...appearance, darkMode: val })
                                        }}
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Sidebar thu gọn</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Mặc định thu gọn sidebar
                                        </p>
                                    </div>
                                    <Switch
                                        checked={appearance.sidebarCollapsed}
                                        onCheckedChange={(val) => handleUpdateAppearance('sidebarCollapsed', val)}
                                    />
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

                    {/* Bundles Settings */}
                    <TabsContent value="bundles">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quản lý bộ chứng từ (Document Bundles)</CardTitle>
                                <CardDescription>
                                    Tạo các bộ mẫu giấy tờ (Hợp đồng, Báo giá, BBGN...) để áp dụng nhanh cho dự án
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4 p-4 border rounded-2xl bg-zinc-50/50">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Tạo bộ mới</h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Tên bộ chứng từ</Label>
                                            <Input
                                                placeholder="VD: In ấn - Trọng gói"
                                                value={newBundle.name}
                                                onChange={e => setNewBundle({ ...newBundle, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Mô tả ngắn</Label>
                                            <Input
                                                placeholder="Dùng cho các dự án in ấn..."
                                                value={newBundle.description}
                                                onChange={e => setNewBundle({ ...newBundle, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Chọn các mẫu giấy tờ đi kèm</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {templates.map(t => (
                                                <div
                                                    key={t.id}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                                        newBundle.templates.includes(t.id)
                                                            ? "bg-zinc-900 text-white border-zinc-900"
                                                            : "bg-white hover:border-zinc-400"
                                                    )}
                                                    onClick={() => {
                                                        const current = newBundle.templates
                                                        if (current.includes(t.id)) {
                                                            setNewBundle({ ...newBundle, templates: current.filter(id => id !== t.id) })
                                                        } else {
                                                            setNewBundle({ ...newBundle, templates: [...current, t.id] })
                                                        }
                                                    }}
                                                >
                                                    <FileText className={cn("w-4 h-4", newBundle.templates.includes(t.id) ? "text-zinc-400" : "text-zinc-500")} />
                                                    <span className="text-xs font-medium">{t.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <Button onClick={handleCreateBundle} disabled={isSavingBundle} className="w-full h-11 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-all font-bold">
                                        {isSavingBundle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                        Tạo bộ mẫu
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Danh sách hiện có</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {bundles.map(bundle => (
                                            <Card key={bundle.id} className="overflow-hidden border-zinc-200 shadow-sm rounded-2xl group hover:border-zinc-400 transition-all">
                                                <CardHeader className="p-4 bg-zinc-50/50 border-b border-zinc-100 flex flex-row items-center justify-between space-y-0">
                                                    <div>
                                                        <CardTitle className="text-sm font-bold">{bundle.name}</CardTitle>
                                                        {bundle.description && <CardDescription className="text-xs">{bundle.description}</CardDescription>}
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500 rounded-full" onClick={() => handleDeleteBundle(bundle.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </CardHeader>
                                                <CardContent className="p-4">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {bundle.templates.map(tid => {
                                                            const t = templates.find(temp => temp.id === tid)
                                                            return (
                                                                <Badge key={tid} variant="secondary" className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border-zinc-100 text-zinc-600">
                                                                    {t?.name || tid}
                                                                </Badge>
                                                            )
                                                        })}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        {bundles.length === 0 && (
                                            <div className="col-span-full py-12 text-center text-zinc-400 border-2 border-dashed border-zinc-100 rounded-2xl">
                                                <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-20" />
                                                <p className="text-sm">Chưa có bộ mẫu nào</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
