'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { markAllAsRead } from '@/lib/supabase/services/notification-service'

export function MarkAllReadButton({ userId }: { userId: string }) {
    const router = useRouter()

    const handleClick = async () => {
        await markAllAsRead(userId)
        router.refresh()
    }

    return (
        <Button variant="outline" size="sm" onClick={handleClick} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Đánh dấu tất cả đã đọc
        </Button>
    )
}
