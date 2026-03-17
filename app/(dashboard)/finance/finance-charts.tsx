'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils/format'
import {
    ArrowUpRight,
    ArrowDownRight,
    Banknote,
    FileText,
    ShoppingBag,
    ChevronRight,
} from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'
import { RevenueData, RevenueDetailItem } from '@/types'

interface FinanceChartsProps {
    monthlyData: RevenueData[]
    recentTransactions: any[]
}

const SOURCE_CONFIG: Record<RevenueDetailItem['source'], { label: string; icon: typeof Banknote; color: string; bg: string }> = {
    sepay: { label: 'SePay', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    invoice: { label: 'Hóa đơn B2B', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    retail_order: { label: 'Đơn hàng Studio', icon: ShoppingBag, color: 'text-violet-600', bg: 'bg-violet-50' },
}

export function FinanceCharts({ monthlyData, recentTransactions }: FinanceChartsProps) {
    const hasData = monthlyData && monthlyData.length > 0
    const [selectedMonth, setSelectedMonth] = useState<RevenueData | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    const handleMonthClick = (month: RevenueData) => {
        if (month.details && month.details.length > 0) {
            setSelectedMonth(month)
            setDialogOpen(true)
        }
    }

    // Group details by source
    const groupedDetails = selectedMonth?.details?.reduce((acc, item) => {
        if (!acc[item.source]) acc[item.source] = []
        acc[item.source].push(item)
        return acc
    }, {} as Record<string, RevenueDetailItem[]>) || {}

    // Monthly data with revenue > 0, sorted descending by revenue
    const revenueMonths = monthlyData.filter(m => m.revenue > 0)

    return (
        <>
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                    <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
                    <TabsTrigger value="expenses">Chi phí</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Card className="lg:col-span-2 rounded-xl border shadow-sm overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold">Doanh thu vs Chi phí (Triệu VNĐ)</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2">
                                {!hasData ? (
                                    <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                                        <div className="text-center space-y-2">
                                            <p className="text-3xl">📊</p>
                                            <p>Chưa có dữ liệu tài chính</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6b7280', fontSize: 11 }}
                                                    dy={8}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6b7280', fontSize: 11 }}
                                                    tickFormatter={(value) => `${value}`}
                                                    width={45}
                                                />
                                                <Tooltip
                                                    cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4 4' }}
                                                    content={({ active, payload, label }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="rounded-lg border bg-background p-3 shadow-lg">
                                                                    <p className="text-xs font-medium text-muted-foreground mb-2">Tháng {label}</p>
                                                                    <div className="space-y-1">
                                                                        {payload.map((entry, index) => (
                                                                            <div key={index} className="flex items-center justify-between gap-6">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                                                    <span className="text-xs text-muted-foreground">{entry.name}</span>
                                                                                </div>
                                                                                <span className="text-xs font-semibold">{entry.value} tr</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        return null
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="top"
                                                    align="right"
                                                    height={36}
                                                    iconType="circle"
                                                    iconSize={8}
                                                    formatter={(value) => <span className="text-xs text-muted-foreground ml-1">{value}</span>}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    name="Doanh thu"
                                                    stroke="#2563eb"
                                                    strokeWidth={2}
                                                    fillOpacity={1}
                                                    fill="url(#colorRevenue)"
                                                    activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="expenses"
                                                    name="Chi phí"
                                                    stroke="#ef4444"
                                                    strokeWidth={2}
                                                    fillOpacity={1}
                                                    fill="url(#colorExpenses)"
                                                    activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border shadow-sm overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold">Giao dịch SePay</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 space-y-1">
                                {recentTransactions.map((tx: any) => {
                                    const isIn = tx.transfer_type === 'in'
                                    const amount = isIn ? tx.amount_in : tx.amount_out
                                    const isMatched = tx.matched_order_id || tx.matched_invoice_id
                                    return (
                                        <div key={tx.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isIn
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-rose-50 text-red-500'
                                                }`}>
                                                {isIn ? (
                                                    <ArrowUpRight className="h-4 w-4" />
                                                ) : (
                                                    <ArrowDownRight className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate" title={tx.content || tx.code || '—'}>
                                                    {tx.code || tx.content?.substring(0, 30) || '—'}
                                                </p>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString('vi-VN') : '—'}
                                                    </span>
                                                    {isMatched ? (
                                                        <span className="inline-flex items-center text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">✓ Khớp</span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Chưa khớp</span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`text-sm font-semibold tabular-nums ${isIn ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {isIn ? '+' : '-'}{formatCurrency(amount)}
                                            </span>
                                        </div>
                                    )
                                })}
                                {recentTransactions.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-sm text-muted-foreground">Chưa có giao dịch SePay</p>
                                        <p className="text-xs text-muted-foreground mt-1">Nhấn &quot;Đồng bộ SePay&quot; ở trang giao dịch</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-4">
                    <Card className="rounded-xl border shadow-sm overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Biểu đồ doanh thu 12 tháng qua</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenueOnly" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} dy={8} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} width={45} />
                                        <Tooltip
                                            cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4 4' }}
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                                                            <p className="text-xs font-medium text-muted-foreground mb-1">Tháng {label}</p>
                                                            <p className="text-sm font-bold">{payload[0].value} tr</p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            name="Doanh thu"
                                            stroke="#2563eb"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorRevenueOnly)"
                                            activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Clickable monthly revenue list */}
                    <Card className="rounded-xl border shadow-sm overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Chi tiết doanh thu theo tháng</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            {revenueMonths.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Chưa có doanh thu</p>
                            ) : (
                                <div className="space-y-1">
                                    {revenueMonths.map((month) => {
                                        const hasDetails = month.details && month.details.length > 0
                                        // Count sources
                                        const sourceCount = month.details?.reduce((acc, d) => {
                                            acc[d.source] = (acc[d.source] || 0) + 1
                                            return acc
                                        }, {} as Record<string, number>) || {}

                                        return (
                                            <button
                                                key={month.date}
                                                onClick={() => handleMonthClick(month)}
                                                disabled={!hasDetails}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                                                    hasDetails
                                                        ? 'hover:bg-blue-50/80 cursor-pointer group'
                                                        : 'opacity-60 cursor-default'
                                                }`}
                                            >
                                                <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                                    <span className="text-xs font-bold text-blue-600">{month.date}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        {sourceCount['sepay'] && (
                                                            <span className="inline-flex items-center text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                                                SePay ({sourceCount['sepay']})
                                                            </span>
                                                        )}
                                                        {sourceCount['invoice'] && (
                                                            <span className="inline-flex items-center text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                                HĐ ({sourceCount['invoice']})
                                                            </span>
                                                        )}
                                                        {sourceCount['retail_order'] && (
                                                            <span className="inline-flex items-center text-[10px] font-medium text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
                                                                ĐH ({sourceCount['retail_order']})
                                                            </span>
                                                        )}
                                                        {!hasDetails && (
                                                            <span className="text-[10px] text-muted-foreground">Không có chi tiết</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-sm font-bold text-blue-600 tabular-nums whitespace-nowrap">
                                                    {formatCurrency(month.revenue * 1000000)}
                                                </span>
                                                {hasDetails && (
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors shrink-0" />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="expenses">
                    <Card className="rounded-xl border shadow-sm overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Biểu đồ chi phí 12 tháng qua</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorExpensesOnly" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} dy={8} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} width={45} />
                                        <Tooltip
                                            cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4 4' }}
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                                                            <p className="text-xs font-medium text-muted-foreground mb-1">Tháng {label}</p>
                                                            <p className="text-sm font-bold text-red-500">{payload[0].value} tr</p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="expenses"
                                            name="Chi phí"
                                            stroke="#ef4444"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorExpensesOnly)"
                                            activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Revenue Drill-down Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Chi tiết doanh thu — {selectedMonth?.date}</span>
                            <span className="text-blue-600 font-bold text-lg">
                                {formatCurrency((selectedMonth?.revenue || 0) * 1000000)}
                            </span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        {Object.entries(groupedDetails).map(([source, items]) => {
                            const config = SOURCE_CONFIG[source as RevenueDetailItem['source']]
                            const Icon = config.icon
                            const groupTotal = items.reduce((sum, i) => sum + i.amount, 0)

                            return (
                                <div key={source} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-6 w-6 rounded-md flex items-center justify-center ${config.bg}`}>
                                                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                                            </div>
                                            <span className="text-sm font-semibold">{config.label}</span>
                                            <span className="text-xs text-muted-foreground">({items.length})</span>
                                        </div>
                                        <span className={`text-sm font-bold ${config.color}`}>
                                            {formatCurrency(groupTotal)}
                                        </span>
                                    </div>

                                    <div className="ml-8 space-y-1">
                                        {items.map((item, idx) => (
                                            <div
                                                key={`${item.reference_id || idx}`}
                                                className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex-1 min-w-0 mr-3">
                                                    <p className="text-xs font-medium truncate" title={item.description}>
                                                        {item.description}
                                                    </p>
                                                    {item.date && (
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {new Date(item.date).toLocaleDateString('vi-VN')}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-xs font-semibold tabular-nums whitespace-nowrap">
                                                    +{formatCurrency(item.amount)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}

                        {(!selectedMonth?.details || selectedMonth.details.length === 0) && (
                            <div className="text-center py-6 text-sm text-muted-foreground">
                                Không có chi tiết doanh thu cho tháng này
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
