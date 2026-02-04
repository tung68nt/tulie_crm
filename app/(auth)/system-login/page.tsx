'use client'

import React, { useState } from 'react'
import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

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
            if ((e as Error).message === 'NEXT_REDIRECT') {
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
                <CardTitle className="text-2xl font-bold">Hệ thống Tulie CRM</CardTitle>
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
                        <Input id="password" name="password" type="password" required />
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
