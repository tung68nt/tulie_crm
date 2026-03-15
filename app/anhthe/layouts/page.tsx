import { PrintLayoutPreview } from '../components/PrintLayoutPreview'

const PRINT_SIZES = [
  { id: 'mix', name: 'Vỉ Mix', desc: '3×4x6 + 5×3x4 + 3×2x3', photos: '11 ảnh/vỉ' },
  { id: '2x3', name: 'Cỡ 2×3 cm', desc: 'Ảnh thẻ nhỏ', photos: '18 ảnh/vỉ' },
  { id: '3x4', name: 'Cỡ 3×4 cm', desc: 'Ảnh thẻ phổ biến', photos: '10 ảnh/vỉ' },
  { id: '4x6', name: 'Cỡ 4×6 cm', desc: 'Ảnh thẻ lớn', photos: '5 ảnh/vỉ' },
  { id: '3.5x4.5', name: 'Cỡ 3.5×4.5 cm', desc: 'Passport / Visa', photos: '8 ảnh/vỉ' },
  { id: '3.3x4.8', name: 'Cỡ 3.3×4.8 cm', desc: 'Hộ chiếu Nhật', photos: '8 ảnh/vỉ' },
  { id: '4.5x4.5', name: 'Cỡ 4.5×4.5 cm', desc: 'Vuông lớn', photos: '6 ảnh/vỉ' },
  { id: '5x5', name: 'Cỡ 5.0×5.0 cm', desc: 'Vuông XL', photos: '4 ảnh/vỉ' },
]

export default function PrintLayoutsPage() {
  return (
    <div className="min-h-screen bg-zinc-50/50 font-sans text-zinc-900 pb-20 selection:bg-black selection:text-white">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 pt-8 sm:pt-10 pb-6 sm:pb-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 sm:gap-6">
            <img src="/file/tulie-agency-logo.png" alt="Logo" className="h-10 sm:h-14 w-auto object-contain grayscale" />
            <div className="w-px h-8 sm:h-10 bg-zinc-200" />
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">Các kiểu vỉ in ảnh</h1>
              <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 font-medium uppercase tracking-wider">Print Layout Catalog — Khổ giấy 10×15 cm</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 sm:mt-10 space-y-6">
        {/* Info */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 shadow-sm">
          <p className="text-sm text-zinc-600 font-medium leading-relaxed">
            Tất cả các kiểu vỉ in đều sử dụng <strong>giấy in ảnh chính hãng Canon</strong>, khổ <strong>10×15 cm</strong> (4×6 inch). 
            Giấy in có độ bền được công bố lên tới 100 năm trong điều kiện bảo quản tốt, không bị ẩm mốc.
          </p>
        </div>

        {/* Grid of layouts */}
        <div className="grid gap-6 sm:grid-cols-2">
          {PRINT_SIZES.map(size => (
            <div key={size.id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
              <div className="p-4 sm:p-5 border-b border-zinc-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[15px] font-bold text-zinc-950 tracking-tight">{size.name}</h3>
                    <p className="text-xs text-zinc-400 font-medium mt-0.5">{size.desc}</p>
                  </div>
                  <span className="text-xs font-bold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-full">{size.photos}</span>
                </div>
              </div>
              <div className="p-3 bg-zinc-50">
                <PrintLayoutPreview sizeId={size.id} />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center py-8">
          <a 
            href="/anhthe" 
            className="group relative inline-flex flex-col items-center justify-center rounded-2xl font-bold tracking-tight h-auto py-4 px-12 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 hover:from-zinc-800 hover:via-zinc-700 hover:to-zinc-800 text-white shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-zinc-400/20 via-zinc-300/10 to-zinc-400/20 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
            <span className="relative flex items-center gap-2 text-[15px]">
              ✦ Đặt ảnh thẻ ngay
            </span>
            <span className="relative text-[11px] font-medium text-zinc-400 mt-0.5">Chỉ từ 29.000đ — Giao tận nhà</span>
          </a>
        </div>
      </main>
    </div>
  )
}
