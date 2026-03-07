'use client'

import { Project } from '@/types'
import { DataTable } from '@/components/shared/data-table'
import { projectColumns } from './project-columns'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus } from 'lucide-react'
import Link from 'next/link'

interface ProjectListProps {
    initialData: Project[]
}

export function ProjectList({ initialData }: ProjectListProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredData = initialData.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.customer?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm dự án, khách hàng..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button asChild>
                    <Link href="/projects/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo dự án mới
                    </Link>
                </Button>
            </div>

            <DataTable
                columns={projectColumns}
                data={filteredData}
                searchKey="title"
            />
        </div>
    )
}
