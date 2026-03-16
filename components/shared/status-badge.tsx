import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
    CUSTOMER_STATUS_LABELS,
    CUSTOMER_STATUS_COLORS,
    QUOTATION_STATUS_LABELS,
    QUOTATION_STATUS_COLORS,
    CONTRACT_STATUS_LABELS,
    CONTRACT_STATUS_COLORS,
    INVOICE_STATUS_LABELS,
    INVOICE_STATUS_COLORS,
    DEAL_STATUS_LABELS,
    DEAL_STATUS_COLORS,
    PROJECT_STATUS_LABELS,
    PROJECT_STATUS_COLORS,
    PRODUCT_STATUS_LABELS,
    PRODUCT_STATUS_COLORS,
    BRAND_LABELS,
    BRAND_COLORS,
    TICKET_STATUS_LABELS,
    TICKET_STATUS_COLORS,
    TICKET_PRIORITY_LABELS,
    TICKET_PRIORITY_COLORS,
    RETAIL_ORDER_STATUS_LABELS,
    RETAIL_ORDER_STATUS_COLORS,
    RETAIL_PAYMENT_STATUS_LABELS,
    RETAIL_PAYMENT_STATUS_COLORS,
} from '@/lib/constants/status'

type EntityType = 'customer' | 'quotation' | 'contract' | 'invoice' | 'deal' | 'project' | 'product' | 'brand' | 'ticket' | 'ticket_priority' | 'retail_order' | 'retail_payment' | 'none'

interface StatusBadgeProps {
    status: string
    label?: string
    entityType?: EntityType
    className?: string
    showDot?: boolean
}

const MAPPINGS: Record<Exclude<EntityType, 'none'>, { labels: any, colors: any }> = {
    customer: { labels: CUSTOMER_STATUS_LABELS, colors: CUSTOMER_STATUS_COLORS },
    quotation: { labels: QUOTATION_STATUS_LABELS, colors: QUOTATION_STATUS_COLORS },
    contract: { labels: CONTRACT_STATUS_LABELS, colors: CONTRACT_STATUS_COLORS },
    invoice: { labels: INVOICE_STATUS_LABELS, colors: INVOICE_STATUS_COLORS },
    deal: { labels: DEAL_STATUS_LABELS, colors: DEAL_STATUS_COLORS },
    project: { labels: PROJECT_STATUS_LABELS, colors: PROJECT_STATUS_COLORS },
    product: { labels: PRODUCT_STATUS_LABELS, colors: PRODUCT_STATUS_COLORS },
    brand: { labels: BRAND_LABELS, colors: BRAND_COLORS },
    ticket: { labels: TICKET_STATUS_LABELS, colors: TICKET_STATUS_COLORS },
    ticket_priority: { labels: TICKET_PRIORITY_LABELS, colors: TICKET_PRIORITY_COLORS },
    retail_order: { labels: RETAIL_ORDER_STATUS_LABELS, colors: RETAIL_ORDER_STATUS_COLORS },
    retail_payment: { labels: RETAIL_PAYMENT_STATUS_LABELS, colors: RETAIL_PAYMENT_STATUS_COLORS },
}

export function StatusBadge({ status, label, entityType = 'none', className, showDot = true }: StatusBadgeProps) {
    let displayLabel = label || status
    let colorClass = ''

    if (entityType !== 'none') {
        const mapping = MAPPINGS[entityType]
        displayLabel = label || mapping.labels[status as keyof typeof mapping.labels] || status
        colorClass = mapping.colors[status as keyof typeof mapping.colors] || ''
    }

    // Determine dot color from the semantic color class
    const dotColor = getDotColor(colorClass)

    return (
        <Badge
            variant="secondary"
            className={cn(
                'font-normal tracking-tight whitespace-nowrap px-3 h-6 flex items-center gap-1.5 rounded-full text-[11px]',
                colorClass,
                className
            )}
        >
            {showDot && dotColor && (
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />
            )}
            {displayLabel}
        </Badge>
    )
}

/**
 * Map semantic color class → dot color
 * Matches components.html dot colors
 */
function getDotColor(colorClass: string): string {
    if (!colorClass) return 'bg-zinc-400'
    if (colorClass.includes('line-through')) return 'bg-zinc-400'
    if (colorClass.includes('emerald')) return 'bg-emerald-500'
    if (colorClass.includes('blue-')) return 'bg-blue-500'
    if (colorClass.includes('sky-')) return 'bg-sky-500'
    if (colorClass.includes('amber')) return 'bg-amber-500'
    if (colorClass.includes('rose')) return 'bg-rose-500'
    if (colorClass.includes('violet')) return 'bg-violet-500'
    if (colorClass.includes('orange')) return 'bg-orange-500'
    if (colorClass.includes('indigo')) return 'bg-indigo-500'
    if (colorClass.includes('border border-zinc')) return 'bg-zinc-500'
    return 'bg-zinc-400'
}
