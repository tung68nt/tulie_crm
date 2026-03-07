'use client'

import { DataTable } from '@/components/shared/data-table'
import { customerColumns } from './customer-columns'
import { Tag, UserPlus } from 'lucide-react'
import { deleteCustomers, updateCustomersStatus, reassignCustomers } from '@/lib/supabase/services/customer-service'

interface CustomerTableClientProps {
    data: any[]
    users: any[]
}

export function CustomerTableClient({ data, users }: CustomerTableClientProps) {
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

    return (
        <DataTable
            columns={customerColumns}
            data={data}
            searchKey="company_name"
            searchPlaceholder="Tìm theo tên công ty..."
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
    )
}
