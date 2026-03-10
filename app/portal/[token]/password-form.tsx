'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, Loader2, AlertCircle } from 'lucide-react'
import { verifyPortalPassword } from '@/lib/supabase/services/portal-actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label' // Added Label import

export default function PortalPasswordForm({ token, companyName }: { token: string, companyName?: string }) {
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [captcha, setCaptcha] = useState({ a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) })
    const [captchaValue, setCaptchaValue] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!password) return

        // Verify captcha
        if (parseInt(captchaValue) !== captcha.a + captcha.b) {
            setError('Mã xác nhận không đúng')
            setCaptcha({ a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) })
            setCaptchaValue('')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const res = await verifyPortalPassword(token, password)
            if (!res.success) {
                setError(res.error || 'Mật khẩu không đúng')
                setCaptcha({ a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) })
                setCaptchaValue('')
            }
        } catch (err) {
            setError('Lỗi kết nối')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40 dark:bg-neutral-950 font-sans">
            <Card className="w-full max-w-md border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg">
                <CardHeader className="text-center space-y-4 pb-6 mt-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center">
                        <Lock className="h-6 w-6 text-neutral-50 dark:text-neutral-900" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-semibold tracking-tight">Portal khách hàng</CardTitle>
                        <CardDescription className="text-muted-foreground mt-2 font-medium">
                            {companyName ? `Tài liệu bảo mật dành cho ${companyName}` : 'Vui lòng nhập mật khẩu để tiếp tục'}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Mật khẩu</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Nhập mật khẩu..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 border-neutral-300 dark:border-neutral-700 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-100"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="captcha">Mã xác nhận: {captcha.a} + {captcha.b} = ?</Label>
                                <Input
                                    id="captcha"
                                    type="number"
                                    placeholder="Kết quả..."
                                    value={captchaValue}
                                    onChange={(e) => setCaptchaValue(e.target.value)}
                                    className="h-12 border-neutral-300 dark:border-neutral-700 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-100"
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-50 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 transition-all active:scale-[0.98] shadow-md"
                            disabled={isLoading || !password || !captchaValue}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : null}
                            Xác nhận truy cập
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
