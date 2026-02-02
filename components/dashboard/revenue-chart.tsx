'use client'

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
import { useState } from 'react'

const monthlyData = [
    { name: 'T1', revenue: 120, expenses: 80, profit: 40 },
    { name: 'T2', revenue: 150, expenses: 90, profit: 60 },
    { name: 'T3', revenue: 180, expenses: 100, profit: 80 },
    { name: 'T4', revenue: 140, expenses: 85, profit: 55 },
    { name: 'T5', revenue: 200, expenses: 110, profit: 90 },
    { name: 'T6', revenue: 220, expenses: 120, profit: 100 },
    { name: 'T7', revenue: 190, expenses: 95, profit: 95 },
    { name: 'T8', revenue: 250, expenses: 130, profit: 120 },
    { name: 'T9', revenue: 280, expenses: 140, profit: 140 },
    { name: 'T10', revenue: 260, expenses: 135, profit: 125 },
    { name: 'T11', revenue: 300, expenses: 150, profit: 150 },
    { name: 'T12', revenue: 350, expenses: 170, profit: 180 },
]

export function RevenueChart() {
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
                        <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="name"
                                className="text-xs"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <YAxis
                                className="text-xs"
                                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                tickFormatter={(value) => `${value}tr`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                                formatter={(value) => value !== undefined ? [`${value} triệu`, ''] : ['', '']}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                name="Doanh thu"
                                stroke="hsl(142.1 76.2% 36.3%)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="expenses"
                                name="Chi phí"
                                stroke="hsl(0 84.2% 60.2%)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="profit"
                                name="Lợi nhuận"
                                stroke="hsl(217.2 91.2% 59.8%)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
