'use client'

import { Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ListTodo, PlayCircle, Eye, CheckCircle2 } from 'lucide-react'

interface ProjectPipelineProps {
    pipeline: {
        todo: Project[]
        in_progress: Project[]
        review: Project[]
        completed: Project[]
    }
}

const stages = [
    { key: 'todo', label: 'Chưa bắt đầu', icon: ListTodo, color: 'bg-gray-100 text-gray-700 border-gray-200', dotColor: 'bg-gray-400' },
    { key: 'in_progress', label: 'Đang thực hiện', icon: PlayCircle, color: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500' },
    { key: 'review', label: 'Đang review', icon: Eye, color: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
    { key: 'completed', label: 'Hoàn thành', icon: CheckCircle2, color: 'bg-green-50 text-green-700 border-green-200', dotColor: 'bg-green-500' },
] as const

export default function ProjectPipeline({ pipeline }: ProjectPipelineProps) {
    const total = Object.values(pipeline).reduce((sum, arr) => sum + arr.length, 0)

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">
                    Pipeline dự án ({total})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Summary bar */}
                {total > 0 && (
                    <div className="w-full h-3 rounded-full bg-gray-100 flex overflow-hidden mb-4">
                        {stages.map(stage => {
                            const count = pipeline[stage.key].length
                            if (count === 0) return null
                            return (
                                <div
                                    key={stage.key}
                                    className={`h-3 ${stage.dotColor} transition-all`}
                                    style={{ width: `${(count / total) * 100}%` }}
                                    title={`${stage.label}: ${count}`}
                                />
                            )
                        })}
                    </div>
                )}

                {/* Stage columns */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {stages.map(stage => {
                        const projects = pipeline[stage.key]
                        const Icon = stage.icon
                        return (
                            <div key={stage.key} className={`rounded-xl p-3 border ${stage.color}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon className="h-4 w-4" />
                                    <span className="text-xs font-medium">{stage.label}</span>
                                    <Badge variant="secondary" className="ml-auto text-xs h-5 px-1.5">
                                        {projects.length}
                                    </Badge>
                                </div>
                                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                                    {projects.slice(0, 5).map(project => (
                                        <Link
                                            key={project.id}
                                            href={`/projects/${project.id}`}
                                            className="block text-xs p-1.5 rounded bg-white/80 hover:bg-white border border-transparent hover:border-current/10 truncate transition-colors"
                                        >
                                            {project.title}
                                        </Link>
                                    ))}
                                    {projects.length > 5 && (
                                        <div className="text-[11px] text-center opacity-70">
                                            +{projects.length - 5} khác
                                        </div>
                                    )}
                                    {projects.length === 0 && (
                                        <div className="text-[11px] text-center opacity-50 py-2">Trống</div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
