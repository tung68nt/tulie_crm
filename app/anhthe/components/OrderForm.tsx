'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { submitPhotoOrder } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Camera, CheckCircle2, ImagePlus, Link2, Loader2, MinusIcon, Package, PlusIcon, Printer, Sparkles, Star, Upload, User, X } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PrintLayoutPreview } from './PrintLayoutPreview'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'

const EXTRA_PRINT_PRICE = 40000

// Map product names to icons and metadata
const PACKAGE_META: Record<string, { icon: typeof Camera; freePrints: number; popular?: boolean; features: string[] }> = {
  '79': {
    icon: Camera,
    freePrints: 1,
    features: ['Thay nền', 'Chỉnh sáng cơ bản', 'Tăng nét nhẹ', 'Không ghép tóc', 'Không ghép áo', 'Tặng 1 vỉ in'],
  },
  '199': {
    icon: Star,
    freePrints: 2,
    popular: true,
    features: ['Thay nền', 'Chỉnh sáng', 'Chỉnh da', 'Ghép tóc, xoá tóc mái', 'Làm lộ tai', 'Ghép 01 trang phục', 'Chỉnh sửa 2 lần', 'Tặng 2 vỉ in'],
  },
  '339': {
    icon: Sparkles,
    freePrints: 4,
    features: ['Thay nền', 'Chỉnh sáng cao cấp', 'Chỉnh da cao cấp', 'Chỉnh màu ảnh cao cấp', 'Ghép tóc, xoá tóc mái', 'Làm lộ tai', 'Ghép 02 trang phục', 'Chỉnh sửa 5 lần', 'Tặng 4 vỉ in'],
  },
}

function getPackageMeta(product: Product) {
  // Match by price (in thousands)
  const priceKey = Math.floor(product.price / 1000).toString()
  return PACKAGE_META[priceKey] || { icon: Camera, freePrints: 0, features: [] }
}

const PRINT_SIZES = [
  { id: 'mix', name: 'Vỉ Mix (3×4x6 + 5×3x4 + 3×2x3)' },
  { id: '2x3', name: 'Cỡ 2×3 cm — 18 ảnh/vỉ' },
  { id: '3x4', name: 'Cỡ 3×4 cm — 10 ảnh/vỉ' },
  { id: '4x6', name: 'Cỡ 4×6 cm — 5 ảnh/vỉ' },
  { id: '3.5x4.5', name: 'Cỡ 3.5×4.5 cm — 8 ảnh/vỉ' },
  { id: '3.3x4.8', name: 'Cỡ 3.3×4.8 cm — 8 ảnh/vỉ' },
  { id: '4.5x4.5', name: 'Cỡ 4.5×4.5 cm — 6 ảnh/vỉ' },
  { id: '5x5', name: 'Cỡ 5.0×5.0 cm — 4 ảnh/vỉ' },
]

// Stepper component
function QtyStepper({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="flex items-center border border-zinc-200 rounded-lg bg-white select-none">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="px-2.5 py-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-l-lg transition-colors"
      >
        <MinusIcon className="size-3.5" />
      </button>
      <span className="w-8 text-center text-sm font-bold text-zinc-900 tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="px-2.5 py-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-r-lg transition-colors"
      >
        <PlusIcon className="size-3.5" />
      </button>
    </div>
  )
}

export default function OrderForm({ products }: { products: Product[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Build packages from DB products
  const PACKAGES = useMemo(() => products.map(p => {
    const meta = getPackageMeta(p)
    return {
      id: p.id,        // Real UUID from DB
      sku: p.sku || '',
      name: p.name,
      price: p.price,
      desc: p.description || '',
      freePrints: meta.freePrints,
      icon: meta.icon,
      popular: meta.popular || false,
      features: meta.features,
    }
  }), [products])

  // Multi-package state: {id: qty} — default 0 for all, 1 for popular
  const [pkgQuantities, setPkgQuantities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    products.forEach(p => {
      const meta = getPackageMeta(p)
      init[p.id] = meta.popular ? 1 : 0
    })
    return init
  })
  const [pkgNotes, setPkgNotes] = useState<Record<string, string>>({})

  // Print state
  const [wantPrint, setWantPrint] = useState(false)
  const [printSizeId, setPrintSizeId] = useState('mix')
  const [printQty, setPrintQty] = useState(1)

  // Shipping state
  const [wantShipping, setWantShipping] = useState(false)
  const [shippingName, setShippingName] = useState('')
  const [shippingPhone, setShippingPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')

  // Photo upload state
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; path: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const supabase = createClient()
    const newFiles: typeof uploadedFiles = []

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} quá lớn (tối đa 10MB)`)
        continue
      }
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)
      const filePath = `orders/${timestamp}_${randomId}.${ext}`

      const { error } = await supabase.storage.from('id-photos').upload(filePath, file)
      if (error) {
        toast.error(`Lỗi upload ${file.name}: ${error.message}`)
        continue
      }
      const { data: urlData } = supabase.storage.from('id-photos').getPublicUrl(filePath)
      newFiles.push({ name: file.name, url: urlData.publicUrl, path: filePath })
    }

    setUploadedFiles(prev => [...prev, ...newFiles])
    setIsUploading(false)
    if (newFiles.length > 0) toast.success(`Đã tải lên ${newFiles.length} ảnh`)
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const removeFile = useCallback((path: string) => {
    setUploadedFiles(prev => prev.filter(f => f.path !== path))
  }, [])

  // Derived calculations
  const totalFreePrints = useMemo(() => {
    return PACKAGES.reduce((sum, pkg) => sum + (pkgQuantities[pkg.id] || 0) * pkg.freePrints, 0)
  }, [pkgQuantities])

  const packageTotal = useMemo(() => {
    return PACKAGES.reduce((sum, pkg) => sum + (pkgQuantities[pkg.id] || 0) * pkg.price, 0)
  }, [pkgQuantities])

  const extraPrints = wantPrint ? Math.max(0, printQty - totalFreePrints) : 0
  const printExtraCost = extraPrints * EXTRA_PRINT_PRICE
  const totalPrice = packageTotal + printExtraCost
  const totalPkgCount = Object.values(pkgQuantities).reduce((a, b) => a + b, 0)

  const selectedPrintName = PRINT_SIZES.find(s => s.id === printSizeId)?.name || ''

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (totalPkgCount === 0) {
      toast.error('Vui lòng chọn ít nhất 1 gói dịch vụ')
      return
    }
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)

    // Build packages JSON
    const pkgArray = PACKAGES.filter(p => (pkgQuantities[p.id] || 0) > 0).map(p => ({
      id: p.id,
      qty: pkgQuantities[p.id],
      note: pkgNotes[p.id] || '',
    }))

    formData.set('packages', JSON.stringify(pkgArray))
    formData.set('printSizeName', wantPrint ? selectedPrintName : 'Không in')
    formData.set('printQuantity', wantPrint ? printQty.toString() : '0')
    formData.set('photoUrls', JSON.stringify(uploadedFiles.map(f => f.url)))

    // Shipping info
    if (wantShipping) {
      formData.set('shippingName', shippingName)
      formData.set('shippingPhone', shippingPhone)
      formData.set('shippingAddress', shippingAddress)
    }

    const res = await submitPhotoOrder(formData)
    setIsSubmitting(false)

    if (res.success) {
      toast.success('Đặt đơn thành công!', { description: 'Chúng tôi sẽ sớm liên hệ với bạn.' })
      if (res.token) {
        router.push(`/portal/order/${res.token}`)
      } else {
        router.push('/')
      }
    } else {
      toast.error('Lỗi đặt đơn', { description: res.error })
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 font-sans text-zinc-900 pb-20 selection:bg-black selection:text-white">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 pt-8 sm:pt-10 pb-6 sm:pb-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <img src="/file/tulie-agency-logo.png" alt="Logo" className="h-10 sm:h-14 w-auto object-contain grayscale" />
            <div className="w-px h-8 sm:h-10 bg-zinc-200" />
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">Ảnh thẻ Online</h1>
              <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 font-medium uppercase tracking-wider">ID Photo Service</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-zinc-100/50 rounded-full border border-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-zinc-600">Đang nhận đơn</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <main className="max-w-3xl mx-auto px-4 sm:px-6 mt-6 sm:mt-10 space-y-6 sm:space-y-8">

          {/* Section 1: Customer Info */}
          <section className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                  <User className="w-4.5 h-4.5 text-zinc-700" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight">Thông tin khách hàng</h2>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Nhập thông tin để chúng tôi trao trả kết quả</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="customerName" className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input id="customerName" name="customerName" placeholder="Nguyễn Văn A" required className="h-10 sm:h-11 rounded-lg border-zinc-200 focus:border-zinc-400 placeholder:text-zinc-300" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="customerPhone" className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input id="customerPhone" name="customerPhone" type="tel" placeholder="09xx xxx xxx" required className="h-10 sm:h-11 rounded-lg border-zinc-200 focus:border-zinc-400 placeholder:text-zinc-300" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                  Link ảnh gốc / Ghi chú
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-300">
                    <Link2 className="size-4" />
                  </div>
                  <Input
                    id="notes"
                    name="notes"
                    className="pl-9 h-10 sm:h-11 rounded-lg border-zinc-200 focus:border-zinc-400 placeholder:text-zinc-300"
                    placeholder="Dán link Google Drive hoặc nhập yêu cầu đặc biệt..."
                  />
                </div>
                <p className="text-[11px] text-zinc-400 font-medium">Hoặc mở quyền truy cập link Google Drive nếu có</p>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                  Tải ảnh gốc lên <span className="normal-case tracking-normal font-normal text-zinc-400">(tuỳ chọn)</span>
                </Label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  multiple
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {/* Upload zone */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={cn(
                    "w-full flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                    isUploading
                      ? "border-zinc-300 bg-zinc-50 cursor-wait"
                      : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50/50 active:bg-zinc-100",
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="size-6 text-zinc-400 animate-spin" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                      <ImagePlus className="size-5 text-zinc-500" />
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-xs font-semibold text-zinc-700">
                      {isUploading ? 'Đang tải lên...' : 'Chụp ảnh hoặc chọn từ thư viện'}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">JPG, PNG, HEIC — tối đa 10MB/ảnh</p>
                  </div>
                </button>

                {/* Uploaded files preview */}
                {uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.path} className="relative group rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 aspect-square">
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(file.path)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        >
                          <X className="size-3.5" />
                        </button>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-1.5 py-1">
                          <p className="text-[9px] text-white font-medium truncate">{file.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 2: Package Selection — Multi-quantity */}
          <section className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                <Camera className="w-4.5 h-4.5 text-zinc-700" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight">Chọn gói dịch vụ</h2>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Mỗi gói tương ứng 1 bộ ảnh cho 1 người chụp</p>
              </div>
            </div>

            <div className="grid gap-4">
              {PACKAGES.map(pkg => {
                const qty = pkgQuantities[pkg.id] || 0
                const isSelected = qty > 0
                const Icon = pkg.icon

                return (
                  <div
                    key={pkg.id}
                    className={cn(
                      "bg-white rounded-xl border overflow-hidden shadow-sm transition-all duration-200",
                      isSelected
                        ? "border-zinc-900 ring-1 ring-zinc-900/10"
                        : "border-zinc-200 hover:border-zinc-300",
                    )}
                  >
                    {/* Card header */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                            isSelected ? "bg-zinc-900 text-white shadow-lg shadow-black/10" : "bg-zinc-100 text-zinc-500",
                          )}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-[15px] font-bold text-zinc-950 tracking-tight">{pkg.name}</h3>
                              {pkg.popular && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-white px-2 py-0.5 rounded-full">
                                  Phổ biến
                                </span>
                              )}
                            </div>
                            {pkg.sku && (
                              <p className="text-[10px] text-zinc-400 font-mono tracking-wide mt-0.5">SKU: {pkg.sku} · ID: {pkg.id.slice(0, 8)}</p>
                            )}
                            <p className="text-xs text-zinc-500 mt-1 font-medium leading-relaxed">{pkg.desc}</p>

                            {/* Features — visible on desktop */}
                            <div className="hidden sm:flex flex-wrap gap-x-4 gap-y-1 mt-3">
                              {pkg.features.map((f, i) => (
                                <span key={i} className="flex items-center gap-1.5 text-[11px] text-zinc-600 font-medium">
                                  <CheckCircle2 className="size-3 text-zinc-400 shrink-0" />
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Price + Stepper — right side */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="text-right">
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-lg sm:text-xl font-bold text-zinc-950 tracking-tighter tabular-nums">{new Intl.NumberFormat('vi-VN').format(pkg.price)}</span>
                              <span className="text-xs font-semibold text-zinc-500">đ</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">/ người</p>
                          </div>
                          <QtyStepper
                            value={qty}
                            onChange={(v) => setPkgQuantities(prev => ({ ...prev, [pkg.id]: v }))}
                          />
                        </div>
                      </div>

                      {/* Features — mobile only */}
                      <div className="sm:hidden flex flex-wrap gap-x-4 gap-y-1 mt-3 ml-[52px]">
                        {pkg.features.map((f, i) => (
                          <span key={i} className="flex items-center gap-1.5 text-[11px] text-zinc-600 font-medium">
                            <CheckCircle2 className="size-3 text-zinc-400 shrink-0" />
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Note field — shown when qty > 0 */}
                    {isSelected && (
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                        <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 space-y-2">
                          <Label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                            Ghi chú gói này (size in, yêu cầu đặc biệt…)
                          </Label>
                          <Textarea
                            value={pkgNotes[pkg.id] || ''}
                            onChange={(e) => setPkgNotes(prev => ({ ...prev, [pkg.id]: e.target.value }))}
                            placeholder={`VD: In vỉ 3x4, ghép áo vest xanh đen...`}
                            className="min-h-[60px] text-xs bg-white border-zinc-200 rounded-lg resize-none placeholder:text-zinc-300"
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Section 3: Print Options */}
          <section className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                <Printer className="w-4.5 h-4.5 text-zinc-700" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight">Dịch vụ In ấn</h2>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Giấy in chính hãng Canon — độ bền lên tới 100 năm</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
              {/* Toggle */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5">
                <div className="space-y-0.5">
                  <Label className="text-[13px] font-bold text-zinc-950 cursor-pointer" htmlFor="toggle-print">
                    Muốn in ảnh cứng
                  </Label>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    {totalFreePrints > 0 ? `Bạn đang được tặng ${totalFreePrints} vỉ miễn phí từ các gói đã chọn` : 'Chọn gói dịch vụ để nhận vỉ in miễn phí'}
                  </p>
                </div>
                <Switch
                  id="toggle-print"
                  checked={wantPrint}
                  onCheckedChange={setWantPrint}
                />
              </div>

              {/* Print Options Panel */}
              {wantPrint && (
                <div className="border-t border-zinc-100 p-4 sm:p-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Size + Qty Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Kích thước in</Label>
                      <Select value={printSizeId} onValueChange={setPrintSizeId}>
                        <SelectTrigger className="h-10 sm:h-11 rounded-lg border-zinc-200 bg-zinc-50/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRINT_SIZES.map(size => (
                            <SelectItem key={size.id} value={size.id}>{size.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Số lượng vỉ</Label>
                      <div className="flex items-center border border-zinc-200 rounded-lg bg-white select-none h-10 sm:h-11">
                        <button type="button" onClick={() => setPrintQty(Math.max(1, printQty - 1))} className="px-3 py-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-l-lg transition-colors">
                          <MinusIcon className="size-3.5" />
                        </button>
                        <span className="w-12 text-center text-sm font-bold text-zinc-900 tabular-nums">{printQty} vỉ</span>
                        <button type="button" onClick={() => setPrintQty(printQty + 1)} className="px-3 py-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-r-lg transition-colors">
                          <PlusIcon className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Layout Preview */}
                  <div className="bg-zinc-50 rounded-xl border border-zinc-100 overflow-hidden">
                    <PrintLayoutPreview sizeId={printSizeId} />
                  </div>

                  {/* Cost breakdown */}
                  <div className="bg-zinc-50 rounded-lg p-3 sm:p-4 border border-zinc-100 text-[12px] sm:text-[13px] space-y-2">
                    <div className="flex justify-between items-center text-zinc-500 font-medium">
                      <span>Vỉ in miễn phí (theo gói)</span>
                      <span className="font-bold text-zinc-900">{totalFreePrints} vỉ</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-500 font-medium">
                      <span>Vỉ in thêm ({new Intl.NumberFormat('vi-VN').format(EXTRA_PRINT_PRICE)}đ/vỉ)</span>
                      <span className={cn("font-bold", extraPrints > 0 ? "text-zinc-900" : "text-zinc-400")}>{extraPrints} vỉ</span>
                    </div>
                    {extraPrints > 0 && (
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-200 text-zinc-900 font-bold">
                        <span>Phí in thêm</span>
                        <span>+{new Intl.NumberFormat('vi-VN').format(printExtraCost)}đ</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 4: Shipping */}
          {wantPrint && (
            <section className="space-y-4 sm:space-y-5">
              <div className="flex items-center gap-3 px-1">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                  <Package className="w-4.5 h-4.5 text-zinc-700" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight">Giao hàng</h2>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Ship ảnh in đến địa chỉ của bạn</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5">
                  <div className="space-y-0.5">
                    <Label className="text-[13px] font-bold text-zinc-950 cursor-pointer" htmlFor="toggle-ship">
                      Muốn ship ảnh về
                    </Label>
                    <p className="text-[11px] text-zinc-400 font-medium">
                      Phí ship tính theo địa chỉ giao hàng
                    </p>
                  </div>
                  <Switch
                    id="toggle-ship"
                    checked={wantShipping}
                    onCheckedChange={setWantShipping}
                  />
                </div>

                {wantShipping && (
                  <div className="border-t border-zinc-100 p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                          Tên người nhận <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={shippingName}
                          onChange={(e) => setShippingName(e.target.value)}
                          placeholder="Nguyễn Văn B"
                          required={wantShipping}
                          className="h-10 sm:h-11 rounded-lg border-zinc-200 focus:border-zinc-400 placeholder:text-zinc-300"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                          SĐT người nhận <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={shippingPhone}
                          onChange={(e) => setShippingPhone(e.target.value)}
                          type="tel"
                          placeholder="09xx xxx xxx"
                          required={wantShipping}
                          className="h-10 sm:h-11 rounded-lg border-zinc-200 focus:border-zinc-400 placeholder:text-zinc-300"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                        Địa chỉ giao hàng <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        required={wantShipping}
                        className="min-h-[70px] text-xs bg-white border-zinc-200 rounded-lg resize-none placeholder:text-zinc-300"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Order Summary + Submit */}
          <section className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm sticky bottom-4 z-10">
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-auto">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Tổng cộng (tạm tính)</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tighter tabular-nums">
                    {new Intl.NumberFormat('vi-VN').format(totalPrice)}
                  </span>
                  <span className="text-sm font-semibold text-zinc-500">đ</span>
                </div>
                {totalPkgCount > 0 && (
                  <p className="text-[11px] text-zinc-400 font-medium mt-1">
                    {totalPkgCount} gói
                    {wantPrint && printQty > 0 && ` · ${printQty} vỉ in`}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || totalPkgCount === 0}
                className="w-full sm:w-auto rounded-xl font-bold tracking-tight text-[13px] h-12 px-10 bg-zinc-900 hover:bg-zinc-800 shadow-lg shadow-black/10 transition-all disabled:opacity-40"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                {isSubmitting ? 'Đang gửi...' : 'Gửi đơn hàng'}
              </Button>
            </div>
          </section>

        </main>
      </form>
    </div>
  )
}
