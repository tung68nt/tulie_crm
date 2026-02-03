'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface CopyButtonProps {
    value: string
    variant?: 'outline' | 'ghost' | 'default'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    className?: string
}

export function CopyButton({ value, variant = 'outline', size = 'sm', className }: CopyButtonProps) {
    const [isCopied, setIsCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            setIsCopied(true)
            toast.success('Đã sao chép vào bộ nhớ tạm')
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            toast.error('Lỗi khi sao chép')
        }
    }

    return (
        <Button
            variant={variant}
            size={size as any}
            className={className}
            onClick={handleCopy}
        >
            {isCopied ? (
                <>
                    <Check className="mr-2 h-4 w-4" />
                    Đã chép
                </>
            ) : (
                <>
                    <Copy className="mr-2 h-4 w-4" />
                    Sao chép link
                </>
            )}
        </Button>
    )
}
