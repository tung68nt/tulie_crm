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

interface RevenueChartProps {
    data: RevenueData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    const [period, setPeriod] = useState('year')
    return (
        <Card className="col-span-2 border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/30">
                <CardTitle className="text-lg font-semibold">Doanh thu & Lợi nhuận</CardTitle>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-[140px] bg-background/50 border-border/50 rounded-lg">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="month">Tháng này</SelectItem>
                        <SelectItem value="quarter">Quý này</SelectItem>
                        <SelectItem value="year">Năm nay</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="oklch(0.646 0.222 41.116)" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="oklch(0.646 0.222 41.116)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="dashboardProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="oklch(0.6 0.118 184.704)" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="oklch(0.6 0.118 184.704)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                className="text-[10px] font-medium"
                                tick={{ fill: 'oklch(var(--muted-foreground))' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                className="text-[10px] font-medium"
                                tick={{ fill: 'oklch(var(--muted-foreground))' }}
                                tickFormatter={(value) => `${value}M`}
                            />
                            <Tooltip
                                cursor={{ stroke: 'oklch(var(--muted))', strokeWidth: 1 }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-md p-3 shadow-xl">
                                                <p className="text-[10px] font-semibold text-muted-foreground mb-2">Tháng {label}</p>
                                                <div className="space-y-1.5">
                                                    {payload.map((entry, index) => (
                                                        <div key={index} className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                                <span className="text-xs font-semibold text-foreground/80">{entry.name}</span>
                                                            </div>
                                                            <span className="text-xs font-semibold font-mono text-foreground">{entry.value}M VNĐ</span>
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
                                className="text-xs font-medium"
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                name="Doanh thu"
                                stroke="oklch(0.646 0.222 41.116)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#dashboardRevenue)"
                                activeDot={{ r: 4, strokeWidth: 0 }}
                                stackId="1"
                            />
                            <Area
                                type="monotone"
                                dataKey="profit"
                                name="Lợi nhuận"
                                stroke="oklch(0.6 0.118 184.704)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#dashboardProfit)"
                                activeDot={{ r: 4, strokeWidth: 0 }}
                                stackId="2"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
