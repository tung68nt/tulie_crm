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
        } catch (e) {
            // Next.js redirect creates an error that should not be caught here
            // if we want the framework to handle it, but sometimes we need to 
            // let it bubble up or handle it more gracefully.
            // However, in form actions, we usually don't need to catch redirect.
            setLoading(false)
            throw e
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
