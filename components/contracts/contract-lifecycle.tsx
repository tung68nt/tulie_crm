'use client'

import { Contract, ContractMilestone, Project } from '@/types'
import { Check, Circle, ChevronRight, FileText, CreditCard, Rocket, PackageCheck, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LifecycleStep {
    id: string
    label: string
    description: string
    status: 'completed' | 'active' | 'upcoming'
    date?: string
    document?: string
    documentType?: string
    link?: string
}

interface ContractLifecycleProps {
    contract: Contract
    project?: Project | null
}

function getLifecycleSteps(contract: Contract, project?: Project | null): LifecycleStep[] {
    const hasSignedDate = !!contract.signed_date
    const isActive = contract.status === 'active'
    const isCompleted = contract.status === 'completed'
    const milestones = contract.milestones || []

    // Determine milestone statuses
    const ms1 = milestones[0]
    const ms2 = milestones[1]
    const ms3 = milestones[2]

    const ms1Done = ms1?.status === 'completed'
    const ms2Done = ms2?.status === 'completed'
    const ms3Done = ms3?.status === 'completed'

    const projectStatus = project?.status
    const projectDone = projectStatus === 'completed'

    // Determine which document type to show for step 3
    const isOrder = contract.type === 'order'
    const docLabel = isOrder ? 'Đơn đặt hàng' : 'Hợp đồng kinh tế'
    const docType = isOrder ? 'order' : 'contract'

    const steps: LifecycleStep[] = [
        {
            id: 'deal',
            label: '1. Cơ hội',
            description: 'Tiếp nhận yêu cầu từ khách hàng',
            status: 'completed', // Always done if contract exists
            link: (contract as any).quotation?.deal_id ? `/deals/${(contract as any).quotation.deal_id}` : undefined,
        },
        {
            id: 'quotation',
            label: '2. Báo giá',
            description: 'Gửi báo giá và khách hàng phê duyệt',
            status: 'completed', // Always done if contract exists
            link: contract.quotation_id ? `/quotations/${contract.quotation_id}` : undefined,
        },
        {
            id: 'contract',
            label: `3. ${docLabel}`,
            description: isOrder ? 'Đơn đặt hàng chi tiết sản phẩm/dịch vụ' : 'Ký kết hợp đồng kinh tế giữa 2 bên',
            status: hasSignedDate || isActive || isCompleted ? 'completed' : 'active',
            date: contract.signed_date || contract.start_date,
            document: docLabel,
            documentType: docType,
        },
        {
            id: 'payment1',
            label: '4. Thanh toán đợt 1',
            description: 'Tạm ứng theo điều khoản hợp đồng',
            status: ms1Done ? 'completed' : (hasSignedDate || isActive) ? 'active' : 'upcoming',
            date: ms1?.completed_at || ms1?.due_date,
            document: 'Đề nghị thanh toán',
            documentType: 'payment_request',
        },
        {
            id: 'execution',
            label: '5. Triển khai',
            description: 'Thực hiện dịch vụ/sản phẩm theo hợp đồng',
            status: ms2Done ? 'completed' : ms1Done ? 'active' : 'upcoming',
            date: ms2?.due_date,
            link: contract.project_id ? `/projects/${contract.project_id}` : undefined,
        },
        {
            id: 'delivery',
            label: '6. Nghiệm thu & Bàn giao',
            description: 'Xác nhận kết quả và bàn giao cho khách hàng',
            status: ms3Done ? 'completed' : ms2Done ? 'active' : 'upcoming',
            date: ms3?.due_date,
            document: 'Biên bản giao nhận',
            documentType: 'delivery_minutes',
        },
        {
            id: 'payment2',
            label: '7. Thanh toán đợt cuối',
            description: 'Quyết toán theo hợp đồng',
            status: isCompleted ? 'completed' : ms3Done ? 'active' : 'upcoming',
            document: 'Đề nghị thanh toán',
            documentType: 'payment_request',
        },
        {
            id: 'close',
            label: '8. Kết thúc dự án',
            description: 'Đóng hợp đồng và dự án',
            status: isCompleted ? 'completed' : 'upcoming',
        },
    ]

    return steps
}

export function ContractLifecycle({ contract, project }: ContractLifecycleProps) {
    const steps = getLifecycleSteps(contract, project)
    const activeIndex = steps.findIndex(s => s.status === 'active')
    const progress = activeIndex >= 0
        ? Math.round((activeIndex / (steps.length - 1)) * 100)
        : steps.every(s => s.status === 'completed') ? 100 : 0

    return (
        <Card className="rounded-xl border shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Rocket className="h-4 w-4" />
                        Vòng đời dự án
                    </CardTitle>
                    <Badge variant={progress === 100 ? 'default' : 'secondary'} className="text-xs">
                        {progress}% hoàn thành
                    </Badge>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </CardHeader>
            <CardContent className="space-y-0">
                {steps.map((step, index) => {
                    const isLast = index === steps.length - 1
                    const isCompleted = step.status === 'completed'
                    const isActive = step.status === 'active'

                    return (
                        <div key={step.id} className="relative">
                            {/* Connector line */}
                            {!isLast && (
                                <div className={cn(
                                    "absolute left-[15px] top-[38px] w-[2px] h-[calc(100%-12px)]",
                                    isCompleted ? "bg-primary" : "bg-muted"
                                )} />
                            )}

                            <div className={cn(
                                "flex items-start gap-3 py-2 px-2 rounded-lg transition-colors",
                                isActive && "bg-primary/5"
                            )}>
                                {/* Status icon */}
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium border-2 relative z-10",
                                    isCompleted && "bg-primary border-primary text-primary-foreground",
                                    isActive && "bg-background border-primary text-primary",
                                    !isCompleted && !isActive && "bg-muted border-muted text-muted-foreground"
                                )}>
                                    {isCompleted ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex items-center gap-2">
                                        <p className={cn(
                                            "text-sm font-medium",
                                            !isCompleted && !isActive && "text-muted-foreground"
                                        )}>
                                            {step.label}
                                        </p>
                                        {isActive && (
                                            <Badge variant="outline" className="text-[10px] h-5 border-primary/30 text-primary">
                                                Đang thực hiện
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>

                                    {/* Actions row */}
                                    {(step.link || step.document) && (isCompleted || isActive) && (
                                        <div className="flex items-center gap-2 mt-1.5">
                                            {step.link && (
                                                <Button variant="ghost" size="sm" className="h-6 text-xs px-2" asChild>
                                                    <Link href={step.link}>
                                                        Xem chi tiết
                                                        <ChevronRight className="h-3 w-3 ml-1" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {step.document && step.documentType && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-xs px-2"
                                                    asChild
                                                >
                                                    <Link href={`#doc-${step.documentType}`}>
                                                        <FileText className="h-3 w-3 mr-1" />
                                                        {step.document}
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Date */}
                                {step.date && (
                                    <span className="text-[10px] text-muted-foreground shrink-0 pt-1">
                                        {new Date(step.date).toLocaleDateString('vi-VN')}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
