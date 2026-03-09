'use client'

import { DataTable } from '@/components/shared/data-table'
import { customerColumns } from './customer-columns'
import { Tag, UserPlus, Building2, User } from 'lucide-react'
import { deleteCustomers, updateCustomersStatus, reassignCustomers } from '@/lib/supabase/services/customer-service'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'

interface CustomerTableClientProps {
    data: any[]
    users: any[]
    defaultTab?: 'business' | 'individual'
    hideTabs?: boolean
}

export function CustomerTableClient({
    data,
    users,
    defaultTab = 'business',
    hideTabs = false
}: CustomerTableClientProps) {
    const handleDelete = async (rows: any[]) => {
        const ids = rows.map((r) => r.id)
        await deleteCustomers(ids)
    }

    const handleBulkStatusChange = async (rows: any[], status: string) => {
        const ids = rows.map((r) => r.id)
        await updateCustomersStatus(ids, status)
    }

    const handleBulkReassign = async (rows: any[], userId: string) => {
        const ids = rows.map((r) => r.id)
        await reassignCustomers(ids, userId)
    }

    const statusOptions = [
        { label: 'Tiềm năng', value: 'lead' },
        { label: 'Đang theo dõi', value: 'prospect' },
        { label: 'Khách hàng', value: 'customer' },
        { label: 'VIP', value: 'vip' },
        { label: 'Đã rời bỏ', value: 'churned' },
    ]

    // Create specific status actions
    const statusActions = statusOptions.map(opt => ({
        label: `Chuyển thành: ${opt.label}`,
        icon: <Tag className="h-4 w-4" />,
        onAction: async (rows: any[]) => handleBulkStatusChange(rows, opt.value)
    }))

    const reassignmentActions = users.map(user => ({
        label: `Giao cho: ${user.full_name}`,
        icon: <UserPlus className="h-4 w-4" />,
        onAction: async (rows: any[]) => handleBulkReassign(rows, user.id)
    }))

    const [activeTab, setActiveTab] = useState<'business' | 'individual'>(defaultTab)

    const filteredData = data.filter(c => c.customer_type === (hideTabs ? defaultTab : activeTab))

    return (
        <div className="space-y-4">
            {!hideTabs && (
                <Tabs defaultValue={defaultTab} className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList className="bg-zinc-100/50 p-1 h-11 rounded-xl">
                        <TabsTrigger value="business" className="rounded-lg px-6 h-9 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Building2 className="w-4 h-4 mr-2" />
                            Doanh nghiệp
                        </TabsTrigger>
                        <TabsTrigger value="individual" className="rounded-lg px-6 h-9 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <User className="w-4 h-4 mr-2" />
                            Cá nhân
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            )}

            <DataTable
                columns={customerColumns}
                data={filteredData}
                searchKey={hideTabs ? (defaultTab === 'business' ? "company_name" : "representative") : (activeTab === 'business' ? "company_name" : "representative")}
                searchPlaceholder={hideTabs ? (defaultTab === 'business' ? "Tìm theo tên công ty..." : "Tìm tên khách hàng...") : (activeTab === 'business' ? "Tìm theo tên công ty..." : "Tìm tên khách hàng...")}
                filters={[
                    {
                        columnId: 'status',
                        title: 'Trạng thái',
                        options: statusOptions
                    }
                ]}
                onDelete={handleDelete}
                bulkActions={[...statusActions, ...reassignmentActions]}
            />
        </div>
    )
}
