/**
 * Typography Tokens — shadcn/ui Style
 *
 * RULES:
 * 1. Font family: Inter (already set in layout.tsx)
 * 2. NO uppercase in dashboard UI — ever (except PDF document templates)
 * 3. NO font-black (900) in dashboard UI — max is font-bold (700)
 * 4. NO tracking-widest — use tracking-tight or normal only
 * 5. NO arbitrary font sizes (text-[9px], text-[10px]) — use Tailwind scale
 * 6. Font weight follows shadcn: medium (500) for labels, semibold (600) for titles
 */

// ─── Text Style Classes ─────────────────────────────────────────────────────
// These are the ONLY text styles that should be used in the dashboard UI.
// Each style is a combination of font-size + font-weight + color.

export const TEXT = {
    // Page-level headings
    pageTitle: 'text-2xl font-bold tracking-tight',
    pageDescription: 'text-sm text-muted-foreground',

    // Section-level headings (inside a page)
    sectionTitle: 'text-lg font-semibold',
    sectionDescription: 'text-sm text-muted-foreground',

    // Card-level headings
    cardTitle: 'leading-none font-semibold',  // shadcn CardTitle default
    cardDescription: 'text-sm text-muted-foreground', // shadcn CardDescription default

    // Body text
    body: 'text-sm',
    bodyMuted: 'text-sm text-muted-foreground',

    // Small text & captions
    caption: 'text-xs text-muted-foreground',
    captionBold: 'text-xs font-medium text-muted-foreground',

    // Form labels
    label: 'text-sm font-medium',

    // Data display
    statValue: 'text-2xl font-bold tracking-tight',
    statLabel: 'text-xs text-muted-foreground',
    statTrend: 'text-xs font-medium',

    // Navigation & interactive
    link: 'text-sm font-medium hover:underline',
    navItem: 'text-sm font-medium',
    breadcrumb: 'text-sm text-muted-foreground',

    // Table
    tableHeader: 'text-sm font-medium',
    tableCell: 'text-sm',
    tableCellMuted: 'text-sm text-muted-foreground',
} as const

// ─── Font Weight Reference ──────────────────────────────────────────────────
// ✅ ALLOWED in dashboard:
//   font-normal   (400) — body text
//   font-medium   (500) — labels, nav items, table headers
//   font-semibold (600) — card titles, section titles
//   font-bold     (700) — page titles, stat values
//
// ❌ NOT ALLOWED in dashboard:
//   font-black    (900) — ONLY for PDF/document templates
//
// ─── Letter Spacing Reference ───────────────────────────────────────────────
// ✅ ALLOWED:
//   tracking-tight   — for large headings, stat values
//   tracking-normal  — default, most text
//
// ❌ NOT ALLOWED in dashboard:
//   tracking-wide    — not shadcn style
//   tracking-wider   — not shadcn style
//   tracking-widest  — ONLY for PDF/document templates

// ─── Font Size Reference ────────────────────────────────────────────────────
// ✅ ALLOWED (Tailwind standard scale only):
//   text-xs    (12px) — captions, badges, meta info
//   text-sm    (14px) — body text, labels, most content
//   text-base  (16px) — slightly larger body text
//   text-lg    (18px) — section titles
//   text-xl    (20px) — sub-page titles
//   text-2xl   (24px) — page titles
//   text-3xl   (30px) — large display (dashboard hero stats)
//
// ❌ NOT ALLOWED in dashboard:
//   text-[9px], text-[10px], text-[11px] — use text-xs (12px) instead
//   text-[13px]                          — use text-sm (14px) instead
//   text-4xl, text-5xl                   — too large for dashboard
