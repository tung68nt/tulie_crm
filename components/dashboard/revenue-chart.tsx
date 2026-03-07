'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
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
import { RevenueData } from '@/types'
import { formatCurrency } from '@/lib/utils/format'

interface RevenueChartProps {
    data: RevenueData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    const [period, setPeriod] = useState('year')

    const hasData = data && data.length > 0 && data.some(d => d.revenue > 0 || d.profit > 0)

    return (
        <Card className="col-span-2 rounded-xl border shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">Doanh thu & Lợi nhuận</CardTitle>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="month">Tháng này</SelectItem>
                        <SelectItem value="quarter">Quý này</SelectItem>
                        <SelectItem value="year">Năm nay</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="pt-2">
                {!hasData ? (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                        <div className="text-center space-y-2">
                            <p className="text-3xl">📊</p>
                            <p>Chưa có dữ liệu doanh thu</p>
                            <p className="text-xs">Dữ liệu sẽ hiển thị khi có hóa đơn thanh toán</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 11 }}
                                    dy={8}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 11 }}
                                    tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(0)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toString()}
                                    width={50}
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
                                                                <span className="text-xs font-semibold">{formatCurrency((entry.value as number) * 1000000)}</span>
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
                                    stroke="#f97316"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#revenueGrad)"
                                    activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="profit"
                                    name="Lợi nhuận"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#profitGrad)"
                                    activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
