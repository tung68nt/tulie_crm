/**
 * Color Tokens — shadcn/ui Monochrome Zinc Palette
 *
 * RULES:
 * 1. Dashboard UI uses ONLY zinc-based colors
 * 2. Exceptions: destructive (red) for errors, green for success indicators
 * 3. NO colorful backgrounds (no bg-blue-100, bg-yellow-100, etc.)
 * 4. Status badges use zinc monochrome scale only
 * 5. Document/PDF templates may use different palettes (they are separate)
 */

// ─── Semantic Status Colors ──────────────────────────────────────────────────
// Used for: StatusBadge, progress indicators, status dots
// Pattern: light bg + dark text (light mode) / dark bg + light text (dark mode)

export type StatusLevel = 'inactive' | 'draft' | 'pending' | 'active' | 'success' | 'danger'

export const STATUS_COLORS: Record<StatusLevel, {
    bg: string
    text: string
    dot: string
    border?: string
}> = {
    inactive: {
        bg: 'bg-zinc-100 dark:bg-zinc-800',
        text: 'text-zinc-400 dark:text-zinc-500',
        dot: 'bg-zinc-300 dark:bg-zinc-600',
    },
    draft: {
        bg: 'bg-zinc-100 dark:bg-zinc-800',
        text: 'text-zinc-500 dark:text-zinc-400',
        dot: 'bg-zinc-400 dark:bg-zinc-500',
    },
    pending: {
        bg: 'bg-zinc-100 dark:bg-zinc-800',
        text: 'text-zinc-700 dark:text-zinc-300',
        dot: 'bg-zinc-500 dark:bg-zinc-400',
    },
    active: {
        bg: 'bg-zinc-900 dark:bg-zinc-100',
        text: 'text-white dark:text-zinc-900',
        dot: 'bg-zinc-900 dark:bg-zinc-100',
    },
    success: {
        bg: 'bg-zinc-900 dark:bg-zinc-50',
        text: 'text-white dark:text-zinc-900',
        dot: 'bg-zinc-900 dark:bg-zinc-50',
    },
    danger: {
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        dot: 'bg-destructive',
        border: 'border-destructive/20',
    },
}

// ─── Brand Colors ────────────────────────────────────────────────────────────
export const BRAND_BADGE_COLORS: Record<string, string> = {
    agency: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
    studio: 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900',
    academy: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300',
}

// ─── Chart Colors (zinc-based) ───────────────────────────────────────────────
// For dashboard charts — uses zinc scale to maintain monochrome feel
export const CHART_COLORS = {
    primary: 'hsl(var(--chart-1))',
    secondary: 'hsl(var(--chart-2))',
    tertiary: 'hsl(var(--chart-3))',
    quaternary: 'hsl(var(--chart-4))',
    quinary: 'hsl(var(--chart-5))',
} as const

// ─── Background Utility Colors ───────────────────────────────────────────────
// For: page sections, highlighted areas, info boxes
export const BG_COLORS = {
    subtle: 'bg-muted/50',           // Very light background
    muted: 'bg-muted',               // Standard muted background
    emphasis: 'bg-zinc-900 dark:bg-zinc-100', // Strong emphasis (dark card)
    destructive: 'bg-destructive/5', // Error/warning background
    success: 'bg-green-500/5',       // Success indicator only (minimal use)
} as const
