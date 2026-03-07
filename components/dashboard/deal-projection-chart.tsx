'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts"
import { DEAL_STATUS_LABELS } from "@/lib/constants/status"
import { formatCurrency } from "@/lib/utils/format"

interface DealProjectionChartProps {
    stats: any
}

const COLORS = {
    new: '#3b82f6',          // blue-500
    briefing: '#a855f7',    // purple-500
    proposal_sent: '#06b6d4', // cyan-500
    closed_won: '#22c55e',    // green-500
    closed_lost: '#ef4444'    // red-500
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
        amount: item.value / 1000000, // in millions
        fullName: DEAL_STATUS_LABELS[item.key as keyof typeof DEAL_STATUS_LABELS],
        key: item.key
    }))

    return (
        <Card className="col-span-2 border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/30">
                <div>
                    <CardTitle className="text-lg font-semibold">Dự báo doanh thu (Deals Pipeline)</CardTitle>
                    <CardDescription className="text-xs">Tiềm năng doanh thu dựa trên các cơ hội đang theo đuổi.</CardDescription>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-muted-foreground font-semibold">Tổng tiềm năng</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(stats.total_potential)}</p>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                className="text-[10px] font-medium"
                                tick={{ fill: 'oklch(var(--muted-foreground))' }}
                            />
                            <YAxis
                                hide
                            />
                            <Tooltip
                                cursor={{ fill: 'oklch(var(--muted)/0.2)' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-3">
                                                <p className="font-semibold text-xs text-muted-foreground mb-1">{payload[0].payload.fullName}</p>
                                                <p className="text-lg font-bold text-primary">
                                                    {formatCurrency(payload[0].value as number * 1000000)}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="amount"
                                radius={[12, 12, 4, 4]}
                                barSize={48}
                            >
                                {barData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={(COLORS as any)[entry.key] || '#8884d8'}
                                        className="opacity-90 hover:opacity-100 transition-opacity"
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                    {data.map((item) => (
                        <div key={item.key} className="space-y-1 p-3 rounded-xl bg-muted/30 border border-border/50 group hover:border-primary/50 transition-all duration-300">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                <span className="h-2 w-2 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.1)]" style={{ backgroundColor: (COLORS as any)[item.key] }} />
                                <span className="text-[10px] text-muted-foreground font-semibold truncate">
                                    {DEAL_STATUS_LABELS[item.key as keyof typeof DEAL_STATUS_LABELS]?.split('(')[0]}
                                </span>
                            </div>
                            <p className="text-sm font-bold truncate">
                                {formatCurrency(item.value)}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
