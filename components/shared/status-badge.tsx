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
    BRAND_COLORS
} from '@/lib/constants/status'

type EntityType = 'customer' | 'quotation' | 'contract' | 'invoice' | 'deal' | 'project' | 'product' | 'brand' | 'none'

interface StatusBadgeProps {
    status: string
    label?: string
    entityType?: EntityType
    className?: string
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
}

export function StatusBadge({ status, label, entityType = 'none', className }: StatusBadgeProps) {
    let displayLabel = label || status
    let colorClass = ''

    if (entityType !== 'none') {
        const mapping = MAPPINGS[entityType]
        displayLabel = label || mapping.labels[status as keyof typeof mapping.labels] || status
        colorClass = mapping.colors[status as keyof typeof mapping.colors] || ''
    }

    return (
        <Badge
            variant="secondary"
            className={cn(
                'font-normal tracking-tight whitespace-nowrap px-3 h-6 flex items-center rounded-full text-[11px]',
                colorClass,
                className
            )}
        >
            {displayLabel}
        </Badge>
    )
}
