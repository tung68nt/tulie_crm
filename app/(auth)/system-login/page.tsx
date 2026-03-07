'use client'

import React, { useState } from 'react'
import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    async function handleAction(formData: FormData) {
        setLoading(true)
        setError(null)
        try {
            const result = await login(formData)
            if (result?.error) {
                setError(result.error)
                setLoading(false)
            }
            // If success, the action will redirect, so we don't need to setLoading(false)
            // otherwise it might flicker before navigation
        } catch (e) {
            // Check if it's a redirect error (NEXT_REDIRECT)
            if (
                e instanceof Error &&
                (e.message === 'NEXT_REDIRECT' || (e as any).digest?.startsWith('NEXT_REDIRECT') || e.message.includes('NEXT_REDIRECT'))
            ) {
                throw e
            }
            console.error('Login error:', e)
            setError('Đã có lỗi xảy ra. Vui lòng thử lại.')
            setLoading(false)
        }
    }

    return (
        <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold">Hệ thống Tulie CRM</CardTitle>
                <CardDescription>
                    Nhập email và mật khẩu để đăng nhập vào hệ thống
                </CardDescription>
            </CardHeader>
            <form action={handleAction}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="admin@tulie.agency" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div className="text-sm font-medium text-destructive">
                            {error}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="pt-6">
                    <Button className="w-full" type="submit" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
