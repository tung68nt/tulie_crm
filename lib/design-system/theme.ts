/**
 * Theme Configuration — shadcn/ui Design System
 *
 * This is the single source of truth for all UI decisions in Tulie CRM.
 * Every component and page MUST follow these rules.
 *
 * Reference: https://ui.shadcn.com/examples/dashboard
 */

export const THEME = {
    // ─── Border Radius ───────────────────────────────────────────────────────
    // Based on --radius: 0.5rem in globals.css
    radius: {
        button: 'rounded-md',        // shadcn Button default
        input: 'rounded-md',         // shadcn Input default
        card: 'rounded-xl',          // shadcn Card default
        badge: 'rounded-full',       // shadcn Badge default (pill shape)
        dialog: 'rounded-lg',        // shadcn Dialog default
        dropdown: 'rounded-md',      // shadcn DropdownMenu default
        popover: 'rounded-md',       // shadcn Popover default
        avatar: 'rounded-full',      // Always circular
        select: 'rounded-md',        // shadcn Select default
        tabs: 'rounded-md',          // shadcn Tabs trigger default
        tooltip: 'rounded-md',       // shadcn Tooltip default
        separator: 'rounded-full',   // For progress bars, dividers
        // Icon buttons (back nav) — exception: use rounded-full
        iconButton: 'rounded-full',
    },

    // ─── Shadows ─────────────────────────────────────────────────────────────
    // Vercel/shadcn: minimal shadows, prefer borders
    shadow: {
        card: 'shadow-none',         // Cards use border, no shadow
        button: 'shadow-none',       // Buttons use no shadow
        dropdown: 'shadow-md',       // shadcn DropdownMenuContent
        popover: 'shadow-md',        // shadcn PopoverContent
        dialog: 'shadow-lg',         // shadcn DialogContent
        sheet: 'shadow-lg',          // shadcn SheetContent
        tooltip: 'shadow-sm',        // shadcn TooltipContent
        sticky: 'shadow-sm',        // For sticky headers/footers
    },

    // ─── Sizing ──────────────────────────────────────────────────────────────
    // shadcn component heights
    size: {
        buttonDefault: 'h-9',        // Default button height
        buttonSm: 'h-8',
        buttonLg: 'h-10',
        buttonIcon: 'size-9',
        inputDefault: 'h-9',         // Default input height
        inputLg: 'h-10',
        badge: 'h-auto',
        tableRow: 'h-12',
    },

    // ─── Animation ───────────────────────────────────────────────────────────
    animation: {
        fast: 'duration-150',
        normal: 'duration-200',
        slow: 'duration-300',
        easing: 'ease-in-out',
        hover: 'transition-colors',
        all: 'transition-all',
    },
} as const

// ─── Quick Reference: What NOT to do ──────────────────────────────────────
// ❌ rounded-2xl on buttons/cards/dropdown items
// ❌ font-black (900) in dashboard
// ❌ uppercase + tracking-widest in dashboard
// ❌ shadow-xl, shadow-lg on buttons/cards
// ❌ text-[9px], text-[10px], text-[11px] arbitrary sizes
// ❌ bg-green-500, bg-red-100, bg-yellow-100 colorful backgrounds
// ❌ Custom button heights (h-11, h-14) — use size variants
