'use client'

import { Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface StaleProjectsPanelProps {
    projects: Project[]
}

export default function StaleProjectsPanel({ projects }: StaleProjectsPanelProps) {
    const getDaysStale = (updatedAt: string) => {
        const diff = Date.now() - new Date(updatedAt).getTime()
        return Math.floor(diff / (1000 * 60 * 60 * 24))
    }

    return (
        <Card className={projects.length > 0 ? 'border-amber-200' : ''}>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${projects.length > 0 ? 'text-amber-600' : 'text-muted-foreground'}`} />
                    Dự án chưa cập nhật
                    {projects.length > 0 && (
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                            {projects.length}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {projects.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Tất cả dự án đều được cập nhật đều đặn ✓
                    </p>
                ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {projects.map(project => {
                            const days = getDaysStale(project.updated_at)
                            return (
                                <Link
                                    key={project.id}
                                    href={`/projects/${project.id}`}
                                    className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-100 hover:bg-amber-50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{project.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {project.customer?.company_name || 'N/A'}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 shrink-0 ml-2">
                                        {days} ngày
                                    </Badge>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
