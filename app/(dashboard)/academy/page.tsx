import { Button } from '@/components/ui/button'
import { GraduationCap, ShoppingBag, BookOpen, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function AcademyPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold">Academy Shop</h1>
                        <p className="text-muted-foreground">Các khóa học và tài liệu đào tạo chuyên sâu.</p>
                    </div>
                </div>
                <Button>
                    <ShoppingBag className="mr-2 h-4 w-4" /> Quản lý sản phẩm
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-xl">
                    <CardHeader className="bg-muted/30 border-b border-border/50">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            Khóa học hiện có
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-1">Đang được giảng dạy</p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-xl">
                    <CardHeader className="bg-muted/30 border-b border-border/50">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            Học viên mới
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-1">Trong 30 ngày qua</p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-xl">
                    <CardHeader className="bg-muted/30 border-b border-border/50">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            Doanh thu Shop
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">0 VNĐ</div>
                        <p className="text-xs text-muted-foreground mt-1">Tổng giá trị đơn hàng</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-xl">
                <div className="p-12 text-center space-y-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <GraduationCap className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">Chưa có khóa học nào</h2>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Bắt đầu tạo khóa học đầu tiên của bạn để học viên có thể đăng ký và mua tài liệu.
                    </p>
                    <Button variant="outline">Tạo sản phẩm ngay</Button>
                </div>
            </Card>
        </div>
    )
}

function Users({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
