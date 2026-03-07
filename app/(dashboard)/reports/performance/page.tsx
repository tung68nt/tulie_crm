import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PerformanceReportPage() {
 return (
 <div className="space-y-6">
 <div className="flex items-center gap-4">
 <Button variant="ghost" size="icon" asChild>
 <Link href="/reports">
 <ArrowLeft className="h-4 w-4" />
 </Link>
 </Button>
 <div>
 <h1 className="text-3xl font-semibold">Báo cáo hiệu suất team</h1>
 <p className="text-muted-foreground">Theo dõi KPI và hiệu quả làm việc của nhân viên</p>
 </div>
 </div>

 <Card>
 <CardHeader>
 <CardTitle>Đang phát triển</CardTitle>
 </CardHeader>
 <CardContent>
 <p>Trang báo cáo hiệu suất đang được kết nối dữ liệu từ Supabase.</p>
 </CardContent>
 </Card>
 </div>
 )
}
