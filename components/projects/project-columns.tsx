'use client'

import { Project } from '@/types'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/lib/constants/status'
import { formatDate } from '@/lib/utils/format'
import { DataTableColumnHeader } from '@/components/shared/data-table-column-header'
import Link from 'next/link'
import { ExternalLink, FolderArchive, Globe, Layout } from 'lucide-react'

export const projectColumns: ColumnDef<Project>[] = [
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Dự án" />
        ),
        cell: ({ row }) => {
            const project = row.original
            return (
                <div className="flex flex-col">
                    <Link
                        href={`/projects/${project.id}`}
                        className="font-medium hover:underline text-primary"
                    >
                        {project.title}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                        {project.customer?.company_name}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Trạng thái" />
        ),
        cell: ({ row }) => {
            const status = row.getValue('status') as keyof typeof PROJECT_STATUS_LABELS
            return (
                <Badge className={PROJECT_STATUS_COLORS[status] || 'bg-gray-100'}>
                    {PROJECT_STATUS_LABELS[status] || status}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'assigned_user.full_name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Phụ trách" />
        ),
    },
    {
        id: 'metadata',
        header: 'Tài liệu',
        cell: ({ row }) => {
            const metadata = row.original.metadata
            if (!metadata) return null
            return (
                <div className="flex items-center gap-2">
                    {metadata.source_link && (
                        <Globe className="h-4 w-4 text-zinc-500" />
                    )}
                    {metadata.ai_folder_link && (
                        <FolderArchive className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: 'end_date',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Hạn bàn giao" />
        ),
        cell: ({ row }) => {
            const date = row.getValue('end_date') as string
            if (!date) return <span className="text-muted-foreground">-</span>
            return <span>{formatDate(date)}</span>
        },
    },
]
