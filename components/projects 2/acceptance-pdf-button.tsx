'use client'

import { Project, AcceptanceReport, Customer } from '@/types'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { AcceptanceReportPDF } from './acceptance-report-pdf'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'

interface AcceptancePDFButtonProps {
    project: Project
    report: AcceptanceReport
    customer: Customer
}

export function AcceptancePDFButton({ project, report, customer }: AcceptancePDFButtonProps) {
    return (
        <PDFDownloadLink
            document={<AcceptanceReportPDF project={project} report={report} customer={customer} />}
            fileName={`acceptance-report-${report.report_number}.pdf`}
        >
            {({ loading }: any) => (
                <Button variant="outline" size="sm" className="h-8 group hover:border-primary transition-all">
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <FileDown className="mr-2 h-4 w-4" />
                    )}
                    Tải PDF
                </Button>
            )}
        </PDFDownloadLink>
    )
}
