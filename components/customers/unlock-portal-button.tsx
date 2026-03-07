'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { updateCustomer } from '@/lib/supabase/services/customer-service'
import { Unlock, Lock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface UnlockPortalButtonProps {
    customerId: string
    isUnlocked: boolean
}

export function UnlockPortalButton({ customerId, isUnlocked }: UnlockPortalButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const toggleUnlock = async () => {
        setIsLoading(true)
        try {
            await updateCustomer(customerId, {
                is_info_unlocked: !isUnlocked
            })
            toast.success(isUnlocked ? 'Đã khóa quyền cập nhật' : 'Đã mở quyền cập nhật portal cho khách hàng')
            router.refresh()
        } catch (error: any) {
            toast.error('Lỗi: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant={isUnlocked ? "destructive" : "outline"}
            size="sm"
            onClick={toggleUnlock}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isUnlocked ? (
                <Lock className="mr-2 h-4 w-4" />
            ) : (
                <Unlock className="mr-2 h-4 w-4" />
            )}
            {isUnlocked ? 'Khóa quyền cập nhật' : 'Mở quyền portal'}
        </Button>
    )
}
