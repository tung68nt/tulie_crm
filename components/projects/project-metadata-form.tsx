'use client'

import { Project } from '@/types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Globe, FolderArchive, Link2, Layout, Save, Loader2, ExternalLink } from 'lucide-react'
import { updateProjectMetadata } from '@/lib/supabase/services/project-service'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ProjectMetadataFormProps {
    project: Project
}

export function ProjectMetadataForm({ project }: ProjectMetadataFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [metadata, setMetadata] = useState({
        source_link: project.metadata?.source_link || '',
        hosting_info: project.metadata?.hosting_info || '',
        domain_info: project.metadata?.domain_info || '',
        ai_folder_link: project.metadata?.ai_folder_link || '',
    })

    const handleSave = async () => {
        setIsLoading(true)
        try {
            await updateProjectMetadata(project.id, metadata)
            toast.success('Đã cập nhật tài nguyên dự án')
            router.refresh()
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-700" />
                        Link Source / Landing
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            value={metadata.source_link}
                            onChange={(e) => setMetadata({ ...metadata, source_link: e.target.value })}
                            placeholder="https://..."
                        />
                        {metadata.source_link && (
                            <Button variant="outline" size="icon" asChild>
                                <a href={metadata.source_link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <FolderArchive className="h-4 w-4 text-slate-700" />
                        Thư mục AI Assets (Google Drive/Dropbox)
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            value={metadata.ai_folder_link}
                            onChange={(e) => setMetadata({ ...metadata, ai_folder_link: e.target.value })}
                            placeholder="https://drive.google.com/..."
                        />
                        {metadata.ai_folder_link && (
                            <Button variant="outline" size="icon" asChild>
                                <a href={metadata.ai_folder_link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        Thông tin Hosting (IP/Admin)
                    </Label>
                    <Input
                        value={metadata.hosting_info}
                        onChange={(e) => setMetadata({ ...metadata, hosting_info: e.target.value })}
                        placeholder="IP: 1.2.3.4, User: admin..."
                    />
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Layout className="h-4 w-4 text-muted-foreground" />
                        Thông tin Tên miền (Domain)
                    </Label>
                    <Input
                        value={metadata.domain_info}
                        onChange={(e) => setMetadata({ ...metadata, domain_info: e.target.value })}
                        placeholder="Provider: Tenten, Expiry: 2025..."
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Lưu thông tin tài nguyên
                </Button>
            </div>
        </div>
    )
}
