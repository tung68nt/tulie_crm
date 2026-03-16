'use client'

import { useEffect, useState } from 'react'
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import PdfTemplate from './pdf-template'
import { Button } from '@/components/ui/button'
import { Download, Eye } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Quotation } from '@/types'

interface QuotationPreviewProps {
    data: Partial<Quotation> & { brandConfig?: any }
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export default function QuotationPreview({ data, open, onOpenChange }: QuotationPreviewProps) {
    const [isClient, setIsClient] = useState(false)

    // Merge with default company info if missing (Simulating Settings)
    const [companyInfo, setCompanyInfo] = useState({
        name: "TULIE AGENCY",
        address: "123 Đường ABC, Quận XYZ, TP.HCM",
        phone: "090 123 4567",
        email: "hello@tulie.agency",
        tax_code: "0123456789",
        website: "tulie.agency"
    })

    useEffect(() => {
        setIsClient(true)
        const saved = localStorage.getItem('company_settings')
        if (saved) {
            setCompanyInfo(JSON.parse(saved))
        }
    }, [])

    if (!isClient) return null

    const previewData = {
        ...data,
        company_info: companyInfo,
        brandConfig: data.brandConfig || null
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-semibold text-lg">Xem trước báo giá</h2>
                    <div className="flex gap-2">
                        <PDFDownloadLink
                            document={<PdfTemplate quotation={previewData} />}
                            fileName={`Bao_gia_${previewData.quotation_number || 'new'}.pdf`}
                        >
                            {({ blob, url, loading, error }) => (
                                <Button disabled={loading} size="sm">
                                    {loading ? <LoadingSpinner size="sm" className="mr-2" /> : <Download className="mr-2 h-4 w-4" />}
                                    Tải PDF
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </div>
                </div>
                <div className="flex-1 bg-muted/20 p-4 overflow-hidden">
                    <PDFViewer className="w-full h-full rounded-md border shadow-sm" showToolbar={true}>
                        <PdfTemplate quotation={previewData} />
                    </PDFViewer>
                </div>
            </DialogContent>
        </Dialog>
    )
}
