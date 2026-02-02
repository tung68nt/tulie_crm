'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const loginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true)
        setError(null)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })

            if (error) {
                setError('Email hoặc mật khẩu không đúng')
                return
            }

            router.push('/')
            router.refresh()
        } catch {
            setError('Đã có lỗi xảy ra. Vui lòng thử lại.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 text-center">
                {/* Logo */}
                <div className="flex justify-center mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground">
                        <span className="text-xl font-bold text-background">T</span>
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
                <CardDescription>
                    Đăng nhập vào Tulie CRM để quản lý công việc
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@tulie.agency"
                            {...register('email')}
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                {...register('password')}
                                disabled={isLoading}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-destructive">{errors.password.message}</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 pt-4">
                    <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Đăng nhập
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
