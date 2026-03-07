import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
    status: string
    label: string
    colorClass?: string
}

export function StatusBadge({ status, label, colorClass }: StatusBadgeProps) {
    return (
        <Badge variant="secondary" className={cn('font-medium', colorClass)}>
            {label}
        </Badge>
    )
}
