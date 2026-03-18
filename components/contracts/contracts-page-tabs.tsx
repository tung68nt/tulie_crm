'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils/format'
import { FileSignature, Clock, CheckCircle, Plus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/data-table'
import { contractColumns } from '@/components/contracts/contract-columns'

interface Stats {
    active: number
    completed: number
    totalValue: number
}

interface ContractsPageTabsProps {
    contracts: any[]
    orders: any[]
    contractStats: Stats
    orderStats: Stats
    onDeleteContracts: (rows: any[]) => Promise<void>
    onDeleteOrders: (rows: any[]) => Promise<void>
}

export function ContractsPageTabs({
    contracts,
    orders,
    contractStats,
    orderStats,
    onDeleteContracts,
    onDeleteOrders,
}: ContractsPageTabsProps) {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-zinc-100 flex items-center justify-center shadow-sm border border-border/50">
                        <FileSignature className="h-6 w-6 text-zinc-900" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-950 tracking-tight italic">Hợp đồng & Đơn hàng</h1>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            Quản lý hợp đồng kinh tế và đơn đặt hàng
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" className="rounded-xl font-bold">
                        <Link href="/contracts/new?type=order">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Tạo đơn hàng
                        </Link>
                    </Button>
                    <Button asChild className="rounded-xl font-bold shadow-md shadow-zinc-200">
                        <Link href="/contracts/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Tạo hợp đồng
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="contracts" className="space-y-6">
                <TabsList className="h-10">
                    <TabsTrigger value="contracts" className="gap-2 px-4">
                        <FileSignature className="h-4 w-4" />
                        Hợp đồng
                        <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-md font-medium">{contracts.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="gap-2 px-4">
                        <ShoppingCart className="h-4 w-4" />
                        Đơn hàng
                        <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-md font-medium">{orders.length}</span>
                    </TabsTrigger>
                </TabsList>

                {/* Contracts Tab */}
                <TabsContent value="contracts" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="rounded-xl border-border/50 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-bold text-muted-foreground tracking-tight uppercase">
                                    Đang thực hiện
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-zinc-900">{contractStats.active}</div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-xl border-border/50 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-bold text-muted-foreground tracking-tight uppercase">
                                    Đã hoàn thành
                                </CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-zinc-900">{contractStats.completed}</div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-xl border-border/50 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-bold text-muted-foreground tracking-tight uppercase">
                                    Tổng giá trị
                                </CardTitle>
                                <FileSignature className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-zinc-900">{formatCurrency(contractStats.totalValue)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <DataTable
                        columns={contractColumns}
                        data={contracts}
                        searchKey="contract_number"
                        searchPlaceholder="Tìm theo số hợp đồng..."
                        onDelete={onDeleteContracts}
                    />
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="rounded-xl border-border/50 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-bold text-muted-foreground tracking-tight uppercase">
                                    Đang thực hiện
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-zinc-900">{orderStats.active}</div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-xl border-border/50 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-bold text-muted-foreground tracking-tight uppercase">
                                    Đã hoàn thành
                                </CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-zinc-900">{orderStats.completed}</div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-xl border-border/50 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-bold text-muted-foreground tracking-tight uppercase">
                                    Tổng giá trị
                                </CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-zinc-900">{formatCurrency(orderStats.totalValue)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <DataTable
                        columns={contractColumns}
                        data={orders}
                        searchKey="contract_number"
                        searchPlaceholder="Tìm theo số đơn hàng..."
                        onDelete={onDeleteOrders}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
