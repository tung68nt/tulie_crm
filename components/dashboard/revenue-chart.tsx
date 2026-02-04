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
    LineChart,
    Line,
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
        <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Doanh thu & Lợi nhuận</CardTitle>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="month">Tháng này</SelectItem>
                        <SelectItem value="quarter">Quý này</SelectItem>
                        <SelectItem value="year">Năm nay</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/50" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                className="text-[10px] font-medium uppercase tracking-wider"
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
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Tháng {label}</p>
                                                <div className="space-y-1.5">
                                                    {payload.map((entry, index) => (
                                                        <div key={index} className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                                <span className="text-xs font-semibold text-foreground/80">{entry.name}</span>
                                                            </div>
                                                            <span className="text-xs font-bold font-mono text-foreground">{entry.value}M</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                name="Doanh thu"
                                stroke="oklch(0.646 0.222 41.116)"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="expenses"
                                name="Chi phí"
                                stroke="oklch(0.577 0.245 27.325)"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="profit"
                                name="Lợi nhuận"
                                stroke="oklch(0.6 0.118 184.704)"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
