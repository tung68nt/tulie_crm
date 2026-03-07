'use client'

import { Deal } from '@/types'
import { DataTable } from '@/components/shared/data-table'
import { dealColumns } from './deal-columns'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search, LayoutGrid, List } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DealKanban } from './deal-kanban'

interface DealListProps {
    initialData: Deal[]
}

export function DealList({ initialData }: DealListProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [view, setView] = useState<'list' | 'kanban'>('list')

    const filteredData = initialData.filter(deal =>
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.customer?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm cơ hội, khách hàng..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Tabs value={view} onValueChange={(v: any) => setView(v)}>
                    <TabsList>
                        <TabsTrigger value="list">
                            <List className="h-4 w-4 mr-2" />
                            Danh sách
                        </TabsTrigger>
                        <TabsTrigger value="kanban">
                            <LayoutGrid className="h-4 w-4 mr-2" />
                            Kanban
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {view === 'list' ? (
                <DataTable
                    columns={dealColumns}
                    data={filteredData}
                    searchKey="title"
                />
            ) : (
                <DealKanban deals={filteredData} />
            )}
        </div>
    )
}
