'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/ui/dialog"
import {
 CheckCircle,
 Clock,
 FileText,
 Download,
 Calendar,
 Building2,
 Wallet,
 FileSignature,
 Eye,
 AlertCircle,
 PenTool,
 Loader2
} from 'lucide-react'
import { toast } from 'sonner'

// Mock data for demo - in production, fetch from database using token
const mockPortalData = {
 customer: {
 company_name: 'Công ty ABC',
 email: 'abc@company.com'
 },
 contract: {
 contract_number: 'HD-2026-0001',
 title: 'Hợp đồng dịch vụ phần mềm CRM',
 total_value: 50000000,
 start_date: '2026-01-15',
 end_date: '2026-12-31',
 status: 'active'
 },
 timeline: [
 {
 id: '1',
 type: 'milestone',
 title: 'Ký kết hợp đồng',
 description: 'Hợp đồng đã được ký kết bởi hai bên',
 date: '2026-01-15',
 status: 'completed',
 files: [
 { name: 'Hop-dong-da-ky.pdf', url: '#' }
 ]
 },
 {
 id: '2',
 type: 'payment',
 title: 'Thanh toán đợt 1 (30%)',
 description: 'Thanh toán 15.000.000 VNĐ',
 date: '2026-01-20',
 status: 'completed',
 amount: 15000000
 },
 {
 id: '3',
 type: 'delivery',
 title: 'Bàn giao demo',
 description: 'Bàn giao phiên bản demo để khách hàng review',
 date: '2026-02-01',
 status: 'completed',
 files: [
 { name: 'Demo-link.txt', url: '#' }
 ]
 },
 {
 id: '4',
 type: 'payment',
 title: 'Thanh toán đợt 2 (40%)',
 description: 'Thanh toán 20.000.000 VNĐ sau khi nghiệm thu demo',
 date: '2026-02-15',
 status: 'pending',
 amount: 20000000
 },
 {
 id: '5',
 type: 'delivery',
 title: 'Bàn giao chính thức',
 description: 'Bàn giao phiên bản production',
 date: '2026-03-01',
 status: 'upcoming'
 },
 {
 id: '6',
 type: 'payment',
 title: 'Thanh toán đợt 3 (30%)',
 description: 'Thanh toán 15.000.000 VNĐ sau khi bàn giao chính thức',
 date: '2026-03-15',
 status: 'upcoming',
 amount: 15000000
 }
 ],
 documents: [
 { id: '1', name: 'Hợp đồng dịch vụ', type: 'contract', status: 'pending_signature' },
 { id: '2', name: 'Đề nghị thanh toán đợt 1', type: 'payment_request', status: 'paid' },
 { id: '3', name: 'Đề nghị thanh toán đợt 2', type: 'payment_request', status: 'pending' }
 ]
}

const getStatusBadge = (status: string) => {
 switch (status) {
 case 'completed':
 case 'signed':
 case 'paid':
 return <Badge className="bg-green-500">Hoàn thành</Badge>
 case 'pending':
 case 'pending_signature':
 return <Badge className="bg-yellow-500">Chờ xử lý</Badge>
 case 'upcoming':
 return <Badge variant="outline">Sắp tới</Badge>
 default:
 return <Badge variant="secondary">{status}</Badge>
 }
}

const getTimelineIcon = (type: string, status: string) => {
 const iconClass = status === 'completed' ? 'text-green-500' : status === 'pending' ? 'text-yellow-500' : 'text-muted-foreground'
 switch (type) {
 case 'payment':
 return <Wallet className={`h-5 w-5 ${iconClass}`} />
 case 'delivery':
 return <FileText className={`h-5 w-5 ${iconClass}`} />
 case 'milestone':
 return <FileSignature className={`h-5 w-5 ${iconClass}`} />
 default:
 return <Clock className={`h-5 w-5 ${iconClass}`} />
 }
}

export default function CustomerPortalPage({ params }: { params: { token: string } }) {
 const [docs, setDocs] = useState(mockPortalData.documents)
 const [isSigning, setIsSigning] = useState(false)
 const [selectedDoc, setSelectedDoc] = useState<typeof docs[0] | null>(null)
 const [isDialogOpen, setIsDialogOpen] = useState(false)

 const data = mockPortalData

 const totalPaid = data.timeline
 .filter(t => t.type === 'payment' && t.status === 'completed')
 .reduce((sum, t) => sum + (t.amount || 0), 0)

 const paymentProgress = (totalPaid / data.contract.total_value) * 100

 const handleSign = () => {
 setIsSigning(true)
 // Simulate signing process
 setTimeout(() => {
 if (selectedDoc) {
 setDocs(prev => prev.map(d =>
 d.id === selectedDoc.id ? { ...d, status: 'signed' } : d
 ))
 }
 setIsSigning(false)
 setIsDialogOpen(false)
 toast.success('Ký xác nhận thành công!')
 }, 2000)
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
 {/* Header */}
 <header className="bg-white dark:bg-gray-900 border-b shadow-sm">
 <div className="container mx-auto px-4 py-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
 <span className="text-primary-foreground font-semibold">T</span>
 </div>
 <div>
 <h1 className="font-semibold">Tulie CRM</h1>
 <p className="text-xs text-muted-foreground">Customer Portal</p>
 </div>
 </div>
 <div className="text-right">
 <p className="font-medium">{data.customer.company_name}</p>
 <p className="text-sm text-muted-foreground">{data.customer.email}</p>
 </div>
 </div>
 </div>
 </header>

 <main className="container mx-auto px-4 py-8 space-y-6">
 {/* Contract Overview */}
 <Card>
 <CardHeader>
 <div className="flex items-start justify-between">
 <div>
 <CardTitle className="flex items-center gap-2">
 <FileSignature className="h-5 w-5" />
 {data.contract.contract_number}
 </CardTitle>
 <CardDescription className="mt-1">
 {data.contract.title}
 </CardDescription>
 </div>
 <Badge className="bg-green-500">Đang thực hiện</Badge>
 </div>
 </CardHeader>
 <CardContent>
 <div className="grid gap-4 md:grid-cols-4">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
 <Wallet className="h-5 w-5" />
 </div>
 <div>
 <p className="text-sm text-muted-foreground">Tổng giá trị</p>
 <p className="font-semibold">
 {new Intl.NumberFormat('vi-VN').format(data.contract.total_value)} VNĐ
 </p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-lg bg-green-100 text-green-600">
 <CheckCircle className="h-5 w-5" />
 </div>
 <div>
 <p className="text-sm text-muted-foreground">Đã thanh toán</p>
 <p className="font-semibold">
 {new Intl.NumberFormat('vi-VN').format(totalPaid)} VNĐ
 </p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
 <Calendar className="h-5 w-5" />
 </div>
 <div>
 <p className="text-sm text-muted-foreground">Ngày bắt đầu</p>
 <p className="font-semibold">
 {new Date(data.contract.start_date).toLocaleDateString('vi-VN')}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
 <Clock className="h-5 w-5" />
 </div>
 <div>
 <p className="text-sm text-muted-foreground">Ngày kết thúc</p>
 <p className="font-semibold">
 {new Date(data.contract.end_date).toLocaleDateString('vi-VN')}
 </p>
 </div>
 </div>
 </div>

 {/* Payment Progress */}
 <div className="mt-6">
 <div className="flex justify-between text-sm mb-2">
 <span className="text-muted-foreground">Tiến độ thanh toán</span>
 <span className="font-medium">{paymentProgress.toFixed(0)}%</span>
 </div>
 <div className="h-3 bg-muted rounded-full overflow-hidden">
 <div
 className="h-full bg-green-500 rounded-full transition-all"
 style={{ width: `${paymentProgress}%` }}
 />
 </div>
 </div>
 </CardContent>
 </Card>

 <div className="grid gap-6 lg:grid-cols-3">
 {/* Timeline */}
 <div className="lg:col-span-2">
 <Card>
 <CardHeader>
 <CardTitle>Timeline dự án</CardTitle>
 <CardDescription>
 Theo dõi tiến độ triển khai và thanh toán
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="relative space-y-0">
 {data.timeline.map((item, index) => (
 <div key={item.id} className="flex gap-4 pb-6">
 {/* Timeline Line */}
 <div className="flex flex-col items-center">
 <div className={`p-2 rounded-full border-2 ${item.status === 'completed' ? 'bg-green-100 border-green-500' :
 item.status === 'pending' ? 'bg-yellow-100 border-yellow-500' :
 'bg-muted border-muted-foreground/30'
 }`}>
 {getTimelineIcon(item.type, item.status)}
 </div>
 {index < data.timeline.length - 1 && (
 <div className={`w-0.5 flex-1 mt-2 ${item.status === 'completed' ? 'bg-green-500' : 'bg-muted'
 }`} />
 )}
 </div>

 {/* Content */}
 <div className="flex-1 pb-2">
 <div className="flex items-start justify-between">
 <div>
 <h4 className="font-semibold">{item.title}</h4>
 <p className="text-sm text-muted-foreground">
 {item.description}
 </p>
 {item.amount && (
 <p className="text-sm font-medium text-green-600 mt-1">
 {new Intl.NumberFormat('vi-VN').format(item.amount)} VNĐ
 </p>
 )}
 </div>
 <div className="text-right">
 {getStatusBadge(item.status)}
 <p className="text-xs text-muted-foreground mt-1">
 {new Date(item.date).toLocaleDateString('vi-VN')}
 </p>
 </div>
 </div>
 {item.files && item.files.length > 0 && (
 <div className="mt-2 flex gap-2">
 {item.files.map((file, i) => (
 <Button key={i} variant="outline" size="sm">
 <Download className="mr-1 h-3 w-3" />
 {file.name}
 </Button>
 ))}
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Documents */}
 <div>
 <Card>
 <CardHeader>
 <CardTitle>Giấy tờ</CardTitle>
 <CardDescription>
 Tài liệu liên quan đến hợp đồng
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-3">
 {docs.map((doc) => (
 <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
 <div className="flex items-center gap-3">
 <FileText className="h-5 w-5 text-muted-foreground" />
 <div>
 <p className="font-medium text-sm">{doc.name}</p>
 {getStatusBadge(doc.status)}
 </div>
 </div>
 <div className="flex gap-1">
 {doc.status === 'pending_signature' && (
 <Dialog open={isDialogOpen && selectedDoc?.id === doc.id} onOpenChange={(open) => {
 setIsDialogOpen(open)
 if (open) setSelectedDoc(doc)
 }}>
 <DialogTrigger asChild>
 <Button variant="outline" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
 <PenTool className="h-4 w-4 mr-1" />
 Ký tên
 </Button>
 </DialogTrigger>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Ký tên xác nhận</DialogTitle>
 <DialogDescription>
 Bằng việc bấm xác nhận, bạn đồng ý với các điều khoản trong tài liệu "{doc.name}".
 </DialogDescription>
 </DialogHeader>
 <div className="p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/30">
 <PenTool className="h-12 w-12 text-muted-foreground mb-4" />
 <p className="text-sm text-muted-foreground">Khu vực chữ ký điện tử</p>
 <div className="mt-4 w-full h-24 border bg-white rounded flex items-center justify-center italic font-serif text-xl border-slate-300">
 {data.customer.company_name}
 </div>
 </div>
 <DialogFooter>
 <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
 <Button onClick={handleSign} disabled={isSigning}>
 {isSigning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
 Xác nhận ký
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )}
 <Button variant="ghost" size="icon">
 <Eye className="h-4 w-4" />
 </Button>
 <Button variant="ghost" size="icon">
 <Download className="h-4 w-4" />
 </Button>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>

 {/* Help */}
 <Card className="mt-4">
 <CardContent className="pt-6">
 <div className="flex items-start gap-3">
 <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
 <div>
 <h4 className="font-medium">Cần hỗ trợ?</h4>
 <p className="text-sm text-muted-foreground mt-1">
 Liên hệ với chúng tôi qua email support@tulie.vn hoặc hotline 0901234567
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 </main>

 {/* Footer */}
 <footer className="border-t bg-white dark:bg-gray-900 mt-12">
 <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
 <p>© 2026 Tulie CRM. Tất cả quyền được bảo lưu.</p>
 </div>
 </footer>
 </div>
 )
}
