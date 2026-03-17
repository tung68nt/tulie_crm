'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Camera, Crop, Download, ImagePlus, Palette, RotateCcw, SlidersHorizontal, Upload, X, ZoomIn, ZoomOut, Grid3x3, Printer, Eye, ChevronDown, ChevronUp, Scan } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════

// Paper: 10×15cm = 4×6 inch. Borderless overscan trims ~3mm each side
// Actual printable area: ~9.32×13.97cm ≈ 3.67×5.5in
// Scale factor: W=93.17%, H=91.67%
const PAPER_W_CM = 15
const PAPER_H_CM = 10
const DPI = 300
const EXPORT_W = Math.round((PAPER_W_CM / 2.54) * DPI) // 1772
const EXPORT_H = Math.round((PAPER_H_CM / 2.54) * DPI) // 1181
const PREVIEW_W = 450
const PREVIEW_H = Math.round(PREVIEW_W * (PAPER_H_CM / PAPER_W_CM)) // 300
const PX_PER_CM = PREVIEW_W / PAPER_W_CM // 30

// Canon Selphy CP1300 optimized defaults
const DEFAULT_FILTERS = {
  brightness: 108,   // +8%
  contrast: 112,     // +12%
  saturation: 120,   // +20%
  warmth: 5,         // warm shift (applied via hue-rotate)
  sharpness: 0,      // unsharp mask (applied on export)
}

const PHOTO_SIZES = [
  { id: '2x3', name: '2×3 cm', w: 2, h: 3, desc: 'Ảnh thẻ nhỏ' },
  { id: '3x4', name: '3×4 cm', w: 3, h: 4, desc: 'Ảnh thẻ phổ biến' },
  { id: '3.5x4.5', name: '3.5×4.5 cm', w: 3.5, h: 4.5, desc: 'Passport / Visa' },
  { id: '3.3x4.8', name: '3.3×4.8 cm', w: 3.3, h: 4.8, desc: 'Hộ chiếu Nhật' },
  { id: '4x6', name: '4×6 cm', w: 4, h: 6, desc: 'Ảnh thẻ lớn' },
  { id: '4.5x4.5', name: '4.5×4.5 cm', w: 4.5, h: 4.5, desc: 'Vuông lớn' },
  { id: '5x5', name: '5×5 cm', w: 5, h: 5, desc: 'Vuông XL' },
]

type Slot = { x: number; y: number; w: number; h: number }

const PRINT_LAYOUTS: Record<string, { id: string; name: string; desc: string; count: number; slots: Slot[] }> = {
  'mix': {
    id: 'mix', name: 'Vỉ Mix', desc: '3×4x6 + 5×3x4 + 3×2x3', count: 11,
    slots: [
      // 3× 4x6 portrait top
      { x: 0, y: 0, w: 4, h: 6 }, { x: 4, y: 0, w: 4, h: 6 }, { x: 8, y: 0, w: 4, h: 6 },
      // 3× 2x3 landscape right column
      { x: 12, y: 0, w: 3, h: 2 }, { x: 12, y: 2, w: 3, h: 2 }, { x: 12, y: 4, w: 3, h: 2 },
      // 5× 3x4 portrait bottom
      { x: 0, y: 6, w: 3, h: 4 }, { x: 3, y: 6, w: 3, h: 4 }, { x: 6, y: 6, w: 3, h: 4 },
      { x: 9, y: 6, w: 3, h: 4 }, { x: 12, y: 6, w: 3, h: 4 },
    ],
  },
  '2x3': {
    id: '2x3', name: '2×3 cm', desc: '18 ảnh/vỉ', count: 18,
    slots: Array.from({ length: 18 }, (_, i) => ({
      x: 1.5 + (i % 6) * 2, y: 0.5 + Math.floor(i / 6) * 3, w: 2, h: 3,
    })),
  },
  '3x4': {
    id: '3x4', name: '3×4 cm', desc: '10 ảnh/vỉ', count: 10,
    slots: Array.from({ length: 10 }, (_, i) => ({
      x: (i % 5) * 3, y: 1 + Math.floor(i / 5) * 4, w: 3, h: 4,
    })),
  },
  '4x6': {
    id: '4x6', name: '4×6 cm', desc: '5 ảnh/vỉ', count: 5,
    slots: [
      { x: 1.5, y: 0, w: 4, h: 6 }, { x: 5.5, y: 0, w: 4, h: 6 }, { x: 9.5, y: 0, w: 4, h: 6 },
      { x: 1.5, y: 6, w: 6, h: 4 }, { x: 7.5, y: 6, w: 6, h: 4 },
    ],
  },
  '3.5x4.5': {
    id: '3.5x4.5', name: '3.5×4.5 cm', desc: '8 ảnh/vỉ', count: 8,
    slots: Array.from({ length: 8 }, (_, i) => ({
      x: 0.5 + (i % 4) * 3.5, y: 0.5 + Math.floor(i / 4) * 4.5, w: 3.5, h: 4.5,
    })),
  },
  '3.3x4.8': {
    id: '3.3x4.8', name: '3.3×4.8 cm', desc: '8 ảnh/vỉ', count: 8,
    slots: Array.from({ length: 8 }, (_, i) => ({
      x: 0.9 + (i % 4) * 3.3, y: 0.2 + Math.floor(i / 4) * 4.8, w: 3.3, h: 4.8,
    })),
  },
  '4.5x4.5': {
    id: '4.5x4.5', name: '4.5×4.5 cm', desc: '6 ảnh/vỉ', count: 6,
    slots: Array.from({ length: 6 }, (_, i) => ({
      x: 0.75 + (i % 3) * 4.5, y: 0.5 + Math.floor(i / 3) * 4.5, w: 4.5, h: 4.5,
    })),
  },
  '5x5': {
    id: '5x5', name: '5×5 cm', desc: '4 ảnh/vỉ', count: 4,
    slots: Array.from({ length: 4 }, (_, i) => ({
      x: 2.5 + (i % 2) * 5, y: (Math.floor(i / 2)) * 5, w: 5, h: 5,
    })),
  },
}

// Layout color classes for visual preview
const LAYOUT_COLORS: Record<string, string> = {
  '4x6': 'bg-amber-100 border-amber-300',
  '3x4': 'bg-sky-100 border-sky-300',
  '2x3': 'bg-emerald-100 border-emerald-300',
  '3.5x4.5': 'bg-violet-100 border-violet-300',
  '3.3x4.8': 'bg-rose-100 border-rose-300',
  '4.5x4.5': 'bg-teal-100 border-teal-300',
  '5x5': 'bg-orange-100 border-orange-300',
  'mix': 'bg-zinc-100 border-zinc-300',
}

// ═══════════════════════════════════════════════════
// FILTERS HELPER
// ═══════════════════════════════════════════════════

function buildFilterString(f: typeof DEFAULT_FILTERS) {
  return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) hue-rotate(${f.warmth}deg)`
}

// ═══════════════════════════════════════════════════
// CROP HELPER — Auto visa/passport crop
// Face area ~70% of output → crop tighter from original
// ═══════════════════════════════════════════════════

function computeAutoCrop(
  imgW: number, imgH: number,
  targetW: number, targetH: number,
): { x: number; y: number; w: number; h: number } {
  const targetRatio = targetW / targetH
  const imgRatio = imgW / imgH

  let cropW: number, cropH: number
  if (imgRatio > targetRatio) {
    // Image wider → constrain by height
    cropH = imgH
    cropW = cropH * targetRatio
  } else {
    // Image taller → constrain by width
    cropW = imgW
    cropH = cropW / targetRatio
  }

  // For passport/visa: face should be ~70% of photo area
  // Scale down crop region to zoom in slightly (85% of available)
  const scaleFactor = 0.85
  cropW = Math.min(cropW * scaleFactor, imgW)
  cropH = Math.min(cropH * scaleFactor, imgH)

  // Center the crop — slightly above center for face positioning (top 40%)
  const x = Math.max(0, (imgW - cropW) / 2)
  const y = Math.max(0, (imgH - cropH) * 0.35) // Bias upward

  return {
    x: Math.round(x),
    y: Math.round(y),
    w: Math.round(cropW),
    h: Math.round(cropH),
  }
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════

export default function PrintTool() {
  // ---- State ----
  const [image, setImage] = useState<{ src: string; name: string; width: number; height: number } | null>(null)
  const [photoSize, setPhotoSize] = useState('3x4')
  const [layoutId, setLayoutId] = useState('3x4')
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS })

  // Crop state
  const [cropMode, setCropMode] = useState<'auto' | 'custom'>('auto')
  const [cropRegion, setCropRegion] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [croppedDataUrl, setCroppedDataUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [tempCrop, setTempCrop] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  // Export state
  const [isExporting, setIsExporting] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cropCanvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const cropContainerRef = useRef<HTMLDivElement>(null)

  const currentPhotoSize = PHOTO_SIZES.find(s => s.id === photoSize) || PHOTO_SIZES[1]
  const currentLayout = PRINT_LAYOUTS[layoutId]

  // ---- Image Upload ----
  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 30 * 1024 * 1024) {
      alert('File quá lớn (tối đa 30MB)')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      const img = new Image()
      img.onload = () => {
        imgRef.current = img
        setImage({ src: dataUrl, name: file.name, width: img.width, height: img.height })
        setCropRegion(null)
        setCroppedDataUrl(null)
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const clearImage = useCallback(() => {
    setImage(null)
    setCropRegion(null)
    setCroppedDataUrl(null)
    imgRef.current = null
  }, [])

  // ---- Auto Crop ----
  useEffect(() => {
    if (!image || !imgRef.current || cropMode !== 'auto') return
    const crop = computeAutoCrop(image.width, image.height, currentPhotoSize.w, currentPhotoSize.h)
    setCropRegion(crop)
  }, [image, cropMode, photoSize])

  // ---- Apply Crop → Generate cropped data URL ----
  useEffect(() => {
    if (!cropRegion || !imgRef.current) {
      setCroppedDataUrl(null)
      return
    }

    const canvas = document.createElement('canvas')
    const targetW = currentPhotoSize.w
    const targetH = currentPhotoSize.h
    // Output resolution based on photo size at 300 DPI
    const outW = Math.round((targetW / 2.54) * DPI)
    const outH = Math.round((targetH / 2.54) * DPI)
    canvas.width = outW
    canvas.height = outH

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(
      imgRef.current,
      cropRegion.x, cropRegion.y, cropRegion.w, cropRegion.h,
      0, 0, outW, outH,
    )

    setCroppedDataUrl(canvas.toDataURL('image/jpeg', 0.95))
  }, [cropRegion, photoSize])

  // ---- Custom Crop Mouse Handlers ----
  const getCropCoords = useCallback((e: React.MouseEvent) => {
    if (!cropContainerRef.current || !image) return null
    const rect = cropContainerRef.current.getBoundingClientRect()
    const scaleX = image.width / rect.width
    const scaleY = image.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [image])

  const handleCropMouseDown = useCallback((e: React.MouseEvent) => {
    if (cropMode !== 'custom') return
    const coords = getCropCoords(e)
    if (!coords) return
    setIsDragging(true)
    setDragStart(coords)
    setTempCrop(null)
  }, [cropMode, getCropCoords])

  const handleCropMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !image) return
    const coords = getCropCoords(e)
    if (!coords) return

    const ratio = currentPhotoSize.w / currentPhotoSize.h
    let w = Math.abs(coords.x - dragStart.x)
    let h = w / ratio
    if (Math.abs(coords.y - dragStart.y) > h) {
      h = Math.abs(coords.y - dragStart.y)
      w = h * ratio
    }

    const x = Math.min(dragStart.x, coords.x)
    const y = Math.min(dragStart.y, coords.y)

    setTempCrop({
      x: Math.max(0, x),
      y: Math.max(0, y),
      w: Math.min(w, image.width - Math.max(0, x)),
      h: Math.min(h, image.height - Math.max(0, y)),
    })
  }, [isDragging, dragStart, image, currentPhotoSize, getCropCoords])

  const handleCropMouseUp = useCallback(() => {
    if (tempCrop && tempCrop.w > 10 && tempCrop.h > 10) {
      setCropRegion({
        x: Math.round(tempCrop.x),
        y: Math.round(tempCrop.y),
        w: Math.round(tempCrop.w),
        h: Math.round(tempCrop.h),
      })
    }
    setIsDragging(false)
    setDragStart(null)
    setTempCrop(null)
  }, [tempCrop])

  // ---- Render Print Preview Canvas ----
  useEffect(() => {
    const canvas = previewCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, PREVIEW_W, PREVIEW_H)

    if (!currentLayout) return

    // Draw slots
    currentLayout.slots.forEach((slot) => {
      const sx = slot.x * PX_PER_CM
      const sy = slot.y * PX_PER_CM
      const sw = slot.w * PX_PER_CM
      const sh = slot.h * PX_PER_CM

      // Draw slot border
      ctx.strokeStyle = '#d4d4d8'
      ctx.lineWidth = 1
      ctx.strokeRect(sx, sy, sw, sh)

      // Draw cropped+filtered image if available
      if (croppedDataUrl) {
        const img = new Image()
        img.onload = () => {
          ctx.save()
          ctx.beginPath()
          ctx.rect(sx, sy, sw, sh)
          ctx.clip()

          // Apply filters
          ctx.filter = buildFilterString(filters)
          ctx.drawImage(img, sx, sy, sw, sh)
          ctx.restore()
        }
        img.src = croppedDataUrl
      } else {
        // Empty slot placeholder
        ctx.fillStyle = '#f4f4f5'
        ctx.fillRect(sx + 1, sy + 1, sw - 2, sh - 2)
        ctx.fillStyle = '#a1a1aa'
        ctx.font = '10px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${slot.w}×${slot.h}`, sx + sw / 2, sy + sh / 2)
      }
    })
  }, [croppedDataUrl, layoutId, filters, currentLayout])

  // ---- Export ----
  const handleExport = useCallback(async () => {
    if (!croppedDataUrl || !currentLayout) return
    setIsExporting(true)

    try {
      const canvas = document.createElement('canvas')
      canvas.width = EXPORT_W
      canvas.height = EXPORT_H
      const ctx = canvas.getContext('2d')!

      // White background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, EXPORT_W, EXPORT_H)

      const pxPerCmExport = EXPORT_W / PAPER_W_CM

      // Load cropped image
      const img = await new Promise<HTMLImageElement>((resolve) => {
        const i = new Image()
        i.onload = () => resolve(i)
        i.src = croppedDataUrl
      })

      // Apply filter and draw each slot
      ctx.filter = buildFilterString(filters)
      for (const slot of currentLayout.slots) {
        const sx = slot.x * pxPerCmExport
        const sy = slot.y * pxPerCmExport
        const sw = slot.w * pxPerCmExport
        const sh = slot.h * pxPerCmExport
        ctx.drawImage(img, sx, sy, sw, sh)
      }

      // Download
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
      const link = document.createElement('a')
      const ts = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
      link.download = `vi_in_${layoutId}_${ts}.jpg`
      link.href = dataUrl
      link.click()
    } finally {
      setIsExporting(false)
    }
  }, [croppedDataUrl, currentLayout, filters, layoutId])

  // ---- Filter update helpers ----
  const updateFilter = useCallback((key: keyof typeof DEFAULT_FILTERS, value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS })
  }, [])

  // ---- Crop preview overlay dimensions ----
  const cropOverlay = useMemo(() => {
    if (!image || !cropContainerRef.current) return null
    const region = tempCrop || cropRegion
    if (!region) return null
    const containerW = cropContainerRef.current?.clientWidth || 400
    const containerH = cropContainerRef.current?.clientHeight || 300
    const scaleX = containerW / image.width
    const scaleY = containerH / image.height
    return {
      left: region.x * scaleX,
      top: region.y * scaleY,
      width: region.w * scaleX,
      height: region.h * scaleY,
    }
  }, [image, cropRegion, tempCrop])

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-zinc-50/50 font-sans text-zinc-900 pb-20 selection:bg-black selection:text-white">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 pt-8 sm:pt-10 pb-6 sm:pb-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 sm:gap-6">
            <img src="/file/tulie-agency-logo.png" alt="Logo" className="h-10 sm:h-14 w-auto object-contain grayscale" />
            <div className="w-px h-8 sm:h-10 bg-zinc-200" />
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">Công cụ in ảnh thẻ</h1>
              <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 font-medium uppercase tracking-wider">Canon Selphy CP1300 — Borderless 10×15 cm</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 sm:mt-10 space-y-6 sm:space-y-8">

        {/* ═══ SECTION 1: Upload ═══ */}
        <section className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                <Upload className="w-4.5 h-4.5 text-zinc-700" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight">Tải ảnh lên</h2>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Chọn ảnh gốc để crop và in</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <input
              ref={fileInputRef}
              id="photo-upload-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="absolute w-0 h-0 overflow-hidden opacity-0"
              style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0 }}
              onChange={handleUpload}
            />

            {!image ? (
              <label
                htmlFor="photo-upload-input"
                className="w-full flex flex-col items-center justify-center gap-3 py-12 px-4 rounded-xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50/50 active:bg-zinc-100 transition-all cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center">
                  <ImagePlus className="size-7 text-zinc-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-700">Chọn ảnh từ máy tính</p>
                  <p className="text-xs text-zinc-400 mt-1">JPG, PNG, WebP, HEIC — tối đa 30MB</p>
                </div>
              </label>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                      <Camera className="size-4 text-zinc-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 truncate">{image.name}</p>
                      <p className="text-xs text-zinc-400">{image.width}×{image.height}px</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="photo-upload-input"
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-100 h-8 px-3 cursor-pointer"
                    >
                      Đổi ảnh
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={clearImage}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>


            {/* ═══ SECTION 2: Photo Size & Crop ═══ */}
            <section className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
              <div className="p-4 sm:p-6 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                    <Crop className="w-4.5 h-4.5 text-zinc-700" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight">Crop ảnh thẻ</h2>
                    <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Chọn cỡ ảnh và vùng crop</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-5">
                {/* Photo size selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-600">Cỡ ảnh thẻ</Label>
                  <div className="flex flex-wrap gap-2">
                    {PHOTO_SIZES.map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setPhotoSize(size.id)}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                          photoSize === size.id
                            ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50",
                        )}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-zinc-400">{currentPhotoSize.desc} — tỉ lệ {currentPhotoSize.w}:{currentPhotoSize.h}</p>
                </div>

                <Separator />

                {/* Crop mode */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold text-zinc-600">Chế độ crop</Label>
                    <div className="flex gap-1 bg-zinc-100 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setCropMode('auto')}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
                          cropMode === 'auto'
                            ? "bg-white text-zinc-900 shadow-sm"
                            : "text-zinc-500 hover:text-zinc-700",
                        )}
                      >
                        <Scan className="size-3.5" />
                        Auto (Visa)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCropMode('custom')}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5",
                          cropMode === 'custom'
                            ? "bg-white text-zinc-900 shadow-sm"
                            : "text-zinc-500 hover:text-zinc-700",
                        )}
                      >
                        <Crop className="size-3.5" />
                        Custom
                      </button>
                    </div>
                  </div>

                  {cropMode === 'auto' && (
                    <p className="text-[11px] text-zinc-400 bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
                      💡 Auto crop sẽ căn giữa khuôn mặt (nhỉnh lên trên), mặt chiếm ~70% diện tích ảnh — chuẩn visa/hộ chiếu.
                    </p>
                  )}

                  {cropMode === 'custom' && (
                    <p className="text-[11px] text-zinc-400 bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
                      ✋ Kéo chuột trên ảnh để chọn vùng crop. Tỉ lệ sẽ tự động giữ theo cỡ ảnh đã chọn ({currentPhotoSize.w}:{currentPhotoSize.h}).
                    </p>
                  )}
                </div>

                {/* Crop preview area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Source image with crop overlay */}
                  <div className="space-y-2">
                    <Label className="text-[11px] font-semibold text-zinc-500">Ảnh gốc</Label>
                    {image ? (
                    <div
                      ref={cropContainerRef}
                      className="relative rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 cursor-crosshair select-none"
                      style={{ aspectRatio: `${image.width}/${image.height}`, maxHeight: 400 }}
                      onMouseDown={handleCropMouseDown}
                      onMouseMove={handleCropMouseMove}
                      onMouseUp={handleCropMouseUp}
                      onMouseLeave={handleCropMouseUp}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.src}
                        alt="Source"
                        className="w-full h-full object-contain pointer-events-none"
                        draggable={false}
                      />
                      {/* Crop overlay */}
                      {cropOverlay && (
                        <>
                          {/* Dimmed areas */}
                          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
                          {/* Clear crop region */}
                          <div
                            className="absolute border-2 border-white/90 pointer-events-none shadow-lg"
                            style={{
                              left: cropOverlay.left,
                              top: cropOverlay.top,
                              width: cropOverlay.width,
                              height: cropOverlay.height,
                              boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
                              background: 'transparent',
                            }}
                          >
                            {/* Corner markers */}
                            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white" />
                            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white" />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white" />
                            {/* Rule of thirds */}
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                              {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="border border-white/20" />
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    ) : (
                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center py-12 text-zinc-400">
                        <ImagePlus className="size-8 mb-2 opacity-40" />
                        <p className="text-xs font-medium">Tải ảnh lên để xem</p>
                      </div>
                    )}
                  </div>

                  {/* Cropped preview */}
                  <div className="space-y-2">
                    <Label className="text-[11px] font-semibold text-zinc-500">Kết quả crop ({currentPhotoSize.name})</Label>
                    <div
                      className="rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center"
                      style={{ aspectRatio: `${currentPhotoSize.w}/${currentPhotoSize.h}`, maxHeight: 400 }}
                    >
                      {croppedDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={croppedDataUrl}
                          alt="Cropped"
                          className="w-full h-full object-contain"
                          style={{ filter: buildFilterString(filters) }}
                        />
                      ) : (
                        <div className="text-center text-zinc-400 p-6">
                          <Crop className="size-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs font-medium">Chưa crop</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ═══ SECTION 3: Filters ═══ */}
            <section className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
              <div className="p-4 sm:p-6 border-b border-zinc-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                      <Palette className="w-4.5 h-4.5 text-zinc-700" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight">Chỉnh màu</h2>
                      <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Chuẩn Canon Selphy CP1300 — dye-sublimation</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-zinc-500">
                    <RotateCcw className="size-3.5 mr-1.5" />
                    Reset
                  </Button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-5">
                {/* Preset info */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200">
                  <Printer className="size-4 text-amber-600 shrink-0" />
                  <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                    Giá trị mặc định đã được tối ưu cho Canon Selphy CP1300: tăng saturation +20%, contrast +12%, brightness +8% và warmth +5° để ảnh in ra tươi sáng, sắc nét, không bị xỉn màu.
                  </p>
                </div>

                {/* Filter sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <FilterSlider
                    label="Độ sáng"
                    value={filters.brightness}
                    min={80}
                    max={130}
                    defaultValue={DEFAULT_FILTERS.brightness}
                    unit="%"
                    onChange={(v) => updateFilter('brightness', v)}
                  />
                  <FilterSlider
                    label="Tương phản"
                    value={filters.contrast}
                    min={80}
                    max={140}
                    defaultValue={DEFAULT_FILTERS.contrast}
                    unit="%"
                    onChange={(v) => updateFilter('contrast', v)}
                  />
                  <FilterSlider
                    label="Bão hòa màu"
                    value={filters.saturation}
                    min={80}
                    max={150}
                    defaultValue={DEFAULT_FILTERS.saturation}
                    unit="%"
                    onChange={(v) => updateFilter('saturation', v)}
                  />
                  <FilterSlider
                    label="Độ ấm"
                    value={filters.warmth}
                    min={-15}
                    max={20}
                    defaultValue={DEFAULT_FILTERS.warmth}
                    unit="°"
                    onChange={(v) => updateFilter('warmth', v)}
                  />
                </div>

                {/* Filter CSS string preview */}
                <div className="bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
                  <p className="text-[10px] font-mono text-zinc-400 break-all">{buildFilterString(filters)}</p>
                </div>
              </div>
            </section>

            {/* ═══ SECTION 4: Layout & Print Preview ═══ */}
            <section className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
              <div className="p-4 sm:p-6 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                    <Grid3x3 className="w-4.5 h-4.5 text-zinc-700" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight">Layout vỉ in</h2>
                    <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Khổ giấy 10×15 cm — Borderless</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-5">
                {/* Layout selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-600">Chọn kiểu vỉ in</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.values(PRINT_LAYOUTS).map((layout) => (
                      <button
                        key={layout.id}
                        type="button"
                        onClick={() => setLayoutId(layout.id)}
                        className={cn(
                          "flex flex-col items-start p-3 rounded-lg border text-left transition-all",
                          layoutId === layout.id
                            ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50",
                        )}
                      >
                        <span className="text-xs font-bold">{layout.name}</span>
                        <span className={cn("text-[10px] mt-0.5", layoutId === layout.id ? "text-zinc-300" : "text-zinc-400")}>
                          {layout.desc} — {layout.count} ảnh
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Print preview canvas */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-zinc-600">Preview vỉ in</Label>
                    <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                      10 × 15 cm
                    </span>
                  </div>

                  <div className="flex justify-center">
                    <div className="relative border-2 border-zinc-300 rounded-sm bg-white shadow-inner overflow-hidden" style={{ width: PREVIEW_W, height: PREVIEW_H }}>
                      <canvas
                        ref={previewCanvasRef}
                        width={PREVIEW_W}
                        height={PREVIEW_H}
                        className="block"
                      />
                      {/* Slot labels overlay */}
                      {currentLayout?.slots.map((slot, i) => (
                        <div
                          key={i}
                          className={cn(
                            "absolute flex items-center justify-center border text-[9px] font-bold select-none rounded-[2px] pointer-events-none",
                            !croppedDataUrl && (LAYOUT_COLORS[layoutId] || 'bg-zinc-50 border-zinc-200'),
                          )}
                          style={{
                            left: slot.x * PX_PER_CM,
                            top: slot.y * PX_PER_CM,
                            width: slot.w * PX_PER_CM,
                            height: slot.h * PX_PER_CM,
                            opacity: croppedDataUrl ? 0 : 1,
                          }}
                        >
                          {!croppedDataUrl && `${slot.w}×${slot.h}`}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 text-center font-medium">
                    Khổ giấy in 10 × 15 cm — Canon Selphy CP1300 Borderless
                  </p>
                </div>
              </div>
            </section>

            {/* ═══ SECTION 5: Export ═══ */}
            <section className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm sticky bottom-4 z-10">
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-[13px] font-bold text-zinc-950">
                      {currentLayout?.name} — {currentLayout?.count} ảnh/vỉ
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Export: {EXPORT_W}×{EXPORT_H}px ({DPI} DPI) · JPEG
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleExport}
                  disabled={!croppedDataUrl || isExporting}
                  className="h-11 px-8 rounded-xl font-bold text-sm bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-black/10 transition-all"
                >
                  {isExporting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Đang xuất...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Download className="size-4" />
                      Tải vỉ in (.jpg)
                    </span>
                  )}
                </Button>
              </div>
            </section>
      </main>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// FILTER SLIDER SUBCOMPONENT
// ═══════════════════════════════════════════════════

function FilterSlider({
  label,
  value,
  min,
  max,
  defaultValue,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  defaultValue: number
  unit: string
  onChange: (v: number) => void
}) {
  const isDefault = value === defaultValue
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-zinc-600">{label}</Label>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs font-bold tabular-nums",
            isDefault ? "text-zinc-400" : "text-zinc-900",
          )}>
            {value}{unit}
          </span>
          {!isDefault && (
            <button
              type="button"
              onClick={() => onChange(defaultValue)}
              className="text-[10px] text-zinc-400 hover:text-zinc-600 underline transition-colors"
            >
              reset
            </button>
          )}
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:bg-zinc-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-zinc-900
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-white"
        />
        {/* Default marker line */}
        <div
          className="absolute top-0 w-px h-1.5 bg-zinc-400 pointer-events-none"
          style={{ left: `${((defaultValue - min) / (max - min)) * 100}%` }}
        />
      </div>
    </div>
  )
}
