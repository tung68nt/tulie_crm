'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { DEAL_STATUS_LABELS, DEAL_CHART_COLORS as COLORS } from "@/lib/constants/status"
import { formatCurrency } from "@/lib/utils/format"

interface DealProjectionChartProps {
    stats: any
}

export function DealProjectionChart({ stats }: DealProjectionChartProps) {
    if (!stats) return null

    const data = [
        { name: 'Mới', value: stats.new, key: 'new' },
        { name: 'Briefing', value: stats.briefing, key: 'briefing' },
        { name: 'Báo giá', value: stats.proposal_sent, key: 'proposal_sent' },
        { name: 'Thành công', value: stats.closed_won, key: 'closed_won' },
    ].filter(item => item.value > 0)

    const barData = data.map(item => ({
        name: item.name,
        amount: item.value / 1000000,
        rawAmount: item.value,
        fullName: DEAL_STATUS_LABELS[item.key as keyof typeof DEAL_STATUS_LABELS],
        key: item.key
    }))

    const hasData = barData.length > 0

    return (
        <Card className="col-span-2 rounded-xl border shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base font-semibold">Dự báo doanh thu (Deals Pipeline)</CardTitle>
                    <CardDescription className="text-xs mt-1">Tiềm năng doanh thu dựa trên các cơ hội đang theo đuổi</CardDescription>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Tổng tiềm năng</p>
                    <p className="text-xl font-bold">{formatCurrency(stats.total_potential)}</p>
                </div>
            </CardHeader>
            <CardContent className="pt-2">
                {!hasData ? (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                        <div className="text-center space-y-2">
                            <p className="text-3xl">📈</p>
                            <p>Chưa có cơ hội (deal) nào</p>
                            <p className="text-xs">Tạo cơ hội để theo dõi pipeline</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
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
                                        tickFormatter={(value) => value > 0 ? `${value.toFixed(0)}M` : '0'}
                                        width={45}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const d = payload[0].payload
                                                return (
                                                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                                                        <p className="text-xs font-medium text-muted-foreground mb-1">{d.fullName}</p>
                                                        <p className="text-sm font-bold">{formatCurrency(d.rawAmount)}</p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                    <Bar
                                        dataKey="amount"
                                        radius={[6, 6, 2, 2]}
                                        barSize={40}
                                    >
                                        {barData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={(COLORS as any)[entry.key] || '#6366f1'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                            {data.map((item) => (
                                <div key={item.key} className="space-y-1 p-3 rounded-lg border bg-muted/30">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: (COLORS as any)[item.key] }} />
                                        <span className="text-xs text-muted-foreground">
                                            {DEAL_STATUS_LABELS[item.key as keyof typeof DEAL_STATUS_LABELS]?.split('(')[0]}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold">
                                        {formatCurrency(item.value)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
