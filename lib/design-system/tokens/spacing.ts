/**
 * Spacing Tokens — shadcn/ui Layout
 *
 * Based on shadcn/ui examples:
 * - Dashboard page: gap-6 between sections
 * - Card internal: px-6 py-6 with gap-4 between elements
 * - Form fields: gap-4 between fields, gap-6 between sections
 * - Inline elements: gap-2 between items
 */

// ─── Page Layout ─────────────────────────────────────────────────────────────
export const PAGE = {
    wrapper: 'flex flex-col gap-6 pb-20',
    padding: 'px-0',  // Page padding handled by dashboard layout
    maxWidth: 'max-w-7xl',
} as const

// ─── Card Layout ─────────────────────────────────────────────────────────────
// shadcn Card defaults: rounded-xl border py-6, CardContent px-6
export const CARD = {
    padding: 'p-6',
    headerPadding: 'px-6',
    contentPadding: 'px-6',
    footerPadding: 'px-6',
    gap: 'gap-4',  // Between card elements
} as const

// ─── Form Layout ─────────────────────────────────────────────────────────────
export const FORM = {
    fieldGap: 'gap-4',           // Between form fields
    sectionGap: 'gap-6',         // Between form sections
    labelGap: 'gap-2',           // Between label and input
    gridCols2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    gridCols3: 'grid grid-cols-1 md:grid-cols-3 gap-4',
    gridCols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
} as const

// ─── List Layout ─────────────────────────────────────────────────────────────
export const LIST = {
    gap: 'gap-4',                 // Between list items
    itemPadding: 'p-4',          // List item padding
    divider: 'divide-y',         // Between list items (alternative to gap)
} as const

// ─── Inline Layout ───────────────────────────────────────────────────────────
export const INLINE = {
    gap: 'gap-2',                 // Between inline elements (badges, tags)
    gapLg: 'gap-3',              // Slightly larger gap
    gapXl: 'gap-4',              // For action button groups
} as const

// ─── Stat Cards (Dashboard) ─────────────────────────────────────────────────
// Based on shadcn dashboard example
export const STAT = {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
} as const

// ─── Detail Page Layout ──────────────────────────────────────────────────────
export const DETAIL = {
    wrapper: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
    main: 'lg:col-span-2 space-y-6',
    sidebar: 'space-y-6',
} as const
