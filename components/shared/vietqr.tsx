'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VietQRProps {
    bankId: string
    accountNo: string
    accountName: string
    amount: number
    description: string
    size?: number
}

export function VietQR({
    bankId,
    accountNo,
    accountName,
    amount,
    description,
    size = 250
}: VietQRProps) {
    const [qrUrl, setQrUrl] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!bankId || !accountNo) return

        setIsLoading(true)
        // VietQR template format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
        const encodedDesc = encodeURIComponent(description)
        const encodedName = encodeURIComponent(accountName)
        const url = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodedDesc}&accountName=${encodedName}`

        setQrUrl(url)

        // Simulating image load
        const img = new Image()
        img.src = url
        img.onload = () => setIsLoading(false)
        img.onerror = () => setIsLoading(false)
    }, [bankId, accountNo, amount, description, accountName])

    const handleDownload = () => {
        const link = document.createElement('a')
        link.href = qrUrl
        link.download = `payment-qr-${description}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (!bankId || !accountNo) {
        return (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground">
                <p className="text-sm font-medium">Thiếu thông tin tài khoản ngân hàng</p>
                <p className="text-xs">Vui lòng cấu hình trong phần Cài đặt hệ thống</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
                <Card className="overflow-hidden border-2 border-primary/20 shadow-xl bg-white p-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center bg-zinc-50 rounded-lg" style={{ width: size, height: size }}>
                            <RefreshCw className="h-8 w-8 text-primary/40 animate-spin" />
                        </div>
                    ) : (
                        <img
                            src={qrUrl}
                            alt="VietQR Payment"
                            width={size}
                            height={size}
                            className="rounded-lg transition-transform hover:scale-[1.02]"
                        />
                    )}
                </Card>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-xl pointer-events-none">
                </div>
            </div>

            <div className="flex gap-2 w-full max-w-[280px]">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 rounded-lg text-xs"
                    onClick={handleDownload}
                >
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Tải về
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 rounded-lg text-xs"
                    asChild
                >
                    <a href={qrUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 mr-2" />
                        Mở rộng
                    </a>
                </Button>
            </div>
        </div>
    )
}
