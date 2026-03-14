import { cn } from "@/lib/utils"

// Canvas: 300px = 15cm, 200px = 10cm → scale = 20px/cm
const S = 20;

type Slot = { x: number; y: number; w: number; h: number; label: string; colorClass: string }

const COLOR = {
  '4x6':   'bg-amber-100 text-amber-800 border-amber-300',
  '3x4':   'bg-sky-100 text-sky-800 border-sky-300',
  '2x3':   'bg-emerald-100 text-emerald-800 border-emerald-300',
  '3.5x4.5': 'bg-violet-100 text-violet-800 border-violet-300',
  '3.3x4.8': 'bg-rose-100 text-rose-800 border-rose-300',
  '4.5x4.5': 'bg-teal-100 text-teal-800 border-teal-300',
  '5x5':   'bg-orange-100 text-orange-800 border-orange-300',
  default: 'bg-zinc-100 text-zinc-700 border-zinc-300',
} as const

function getColor(sizeId: string) {
  return (COLOR as any)[sizeId] || COLOR.default;
}

function buildSlots(sizeId: string): Slot[] {
  const slots: Slot[] = [];
  const c = getColor(sizeId);

  switch (sizeId) {
    case '2x3': {
      // 18 photos: 6 cols × 3 rows = 12×9cm, paper 15×10
      for (let r = 0; r < 3; r++) {
        for (let col = 0; col < 6; col++) {
          slots.push({ x: 1.5 * S + col * 2 * S, y: 0.5 * S + r * 3 * S, w: 2 * S, h: 3 * S, label: '2×3', colorClass: c });
        }
      }
      break;
    }
    case '3x4': {
      // 10 photos: 2 rows × 5 cols (3×4cm each) = 15×8cm, centered vertically
      const oy34 = 1; // (10-8)/2 = 1cm
      for (let r = 0; r < 2; r++) {
        for (let col = 0; col < 5; col++) {
          slots.push({ x: col * 3 * S, y: oy34 * S + r * 4 * S, w: 3 * S, h: 4 * S, label: '3×4', colorClass: c });
        }
      }
      break;
    }
    case '4x6': {
      // 5 photos centered: 3 portrait top + 2 landscape bottom
      // 3 portrait (4W×6H) = 12cm wide, centered: offset = (15-12)/2 = 1.5cm
      const ox = 1.5;
      slots.push({ x: ox * S, y: 0, w: 4 * S, h: 6 * S, label: '4×6', colorClass: c });
      slots.push({ x: (ox + 4) * S, y: 0, w: 4 * S, h: 6 * S, label: '4×6', colorClass: c });
      slots.push({ x: (ox + 8) * S, y: 0, w: 4 * S, h: 6 * S, label: '4×6', colorClass: c });
      // 2 landscape (6W×4H) = 12cm wide, same center offset
      slots.push({ x: ox * S, y: 6 * S, w: 6 * S, h: 4 * S, label: '↻4×6', colorClass: c });
      slots.push({ x: (ox + 6) * S, y: 6 * S, w: 6 * S, h: 4 * S, label: '↻4×6', colorClass: c });
      break;
    }
    case 'mix': {
      const c46 = getColor('4x6');
      const c34 = getColor('3x4');
      const c23 = getColor('2x3');

      // 3× 4x6 portrait (4W×6H) → top-left 12cm
      slots.push({ x: 0, y: 0, w: 4 * S, h: 6 * S, label: '4×6', colorClass: c46 });
      slots.push({ x: 4 * S, y: 0, w: 4 * S, h: 6 * S, label: '4×6', colorClass: c46 });
      slots.push({ x: 8 * S, y: 0, w: 4 * S, h: 6 * S, label: '4×6', colorClass: c46 });

      // 3× 2x3 landscape (3W×2H) → top-right 3cm column
      slots.push({ x: 12 * S, y: 0, w: 3 * S, h: 2 * S, label: '↻2×3', colorClass: c23 });
      slots.push({ x: 12 * S, y: 2 * S, w: 3 * S, h: 2 * S, label: '↻2×3', colorClass: c23 });
      slots.push({ x: 12 * S, y: 4 * S, w: 3 * S, h: 2 * S, label: '↻2×3', colorClass: c23 });

      // 5× 3x4 portrait (3W×4H) → bottom 4cm strip, full 15cm wide
      for (let i = 0; i < 5; i++) {
        slots.push({ x: i * 3 * S, y: 6 * S, w: 3 * S, h: 4 * S, label: '3×4', colorClass: c34 });
      }
      break;
    }
    case '3.5x4.5': {
      // 8 photos: 4 cols × 2 rows = 14×9cm
      for (let r = 0; r < 2; r++) {
        for (let col = 0; col < 4; col++) {
          slots.push({ x: 0.5 * S + col * 3.5 * S, y: 0.5 * S + r * 4.5 * S, w: 3.5 * S, h: 4.5 * S, label: '3.5×4.5', colorClass: c });
        }
      }
      break;
    }
    case '3.3x4.8': {
      // 8 photos: 4 cols × 2 rows = 13.2×9.6cm
      for (let r = 0; r < 2; r++) {
        for (let col = 0; col < 4; col++) {
          slots.push({ x: 0.9 * S + col * 3.3 * S, y: 0.2 * S + r * 4.8 * S, w: 3.3 * S, h: 4.8 * S, label: '3.3×4.8', colorClass: c });
        }
      }
      break;
    }
    case '4.5x4.5': {
      // 6 photos: 3 cols × 2 rows = 13.5×9cm
      for (let r = 0; r < 2; r++) {
        for (let col = 0; col < 3; col++) {
          slots.push({ x: 0.75 * S + col * 4.5 * S, y: 0.5 * S + r * 4.5 * S, w: 4.5 * S, h: 4.5 * S, label: '4.5×4.5', colorClass: c });
        }
      }
      break;
    }
    case '5x5': {
      // 4 photos: 2 cols × 2 rows = 10×10cm → perfect fit
      for (let r = 0; r < 2; r++) {
        for (let col = 0; col < 2; col++) {
          slots.push({ x: 2.5 * S + col * 5 * S, y: r * 5 * S, w: 5 * S, h: 5 * S, label: '5×5', colorClass: c });
        }
      }
      break;
    }
  }

  return slots;
}

export function PrintLayoutPreview({ sizeId }: { sizeId: string }) {
  const slots = buildSlots(sizeId);

  if (slots.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div
        className="relative border-2 border-zinc-300 bg-white rounded-sm shadow-inner overflow-hidden box-content"
        style={{ width: 300, height: 200 }}
      >
        {slots.map((s, i) => (
          <div
            key={i}
            className={cn(
              "absolute flex items-center justify-center border text-[10px] font-bold select-none rounded-[2px]",
              s.colorClass,
            )}
            style={{ left: s.x, top: s.y, width: s.w, height: s.h }}
          >
            {s.label}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-widest">
        Khổ giấy in 10 × 15 cm
      </p>
    </div>
  )
}
