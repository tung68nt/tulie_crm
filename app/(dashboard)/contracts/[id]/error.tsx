'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ContractDetailError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Contract detail page error:', error)
    }, [error])

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Lỗi hiển thị hợp đồng
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Đã xảy ra lỗi khi tải trang hợp đồng. Dữ liệu có thể đã được lưu thành công.
                    </p>
                    {error.digest && (
                        <p className="text-xs text-muted-foreground font-mono">
                            Mã lỗi: {error.digest}
                        </p>
                    )}
                    <div className="flex items-center gap-2">
                        <Button onClick={reset} variant="default" size="sm">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Thử lại
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/contracts">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Về danh sách
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
