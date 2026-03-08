'use client';

import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import UnifiedDocumentPdf from './UnifiedDocumentPdf';
import { getDocumentData } from '@/lib/supabase/services/document-template-service';

interface DocumentDownloadButtonProps {
    type: string;
    label?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'sm' | 'default' | 'lg';
    documentId: string;
    customerId: string;
    fileName?: string;
    className?: string;
}

export default function DocumentDownloadButton({
    type,
    label = 'Tải PDF',
    variant = 'ghost',
    size = 'sm',
    documentId,
    customerId,
    fileName,
    className
}: DocumentDownloadButtonProps) {
    const [docData, setDocData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handlePrepare = async () => {
        if (docData) return;
        setLoading(true);
        try {
            // Map types to supported PDF templates
            let pdfType: any = type;
            if (type === 'invoice') pdfType = 'payment_request';
            if (type === 'minutes') pdfType = 'delivery_minutes';

            const data = await getDocumentData(pdfType, customerId, documentId);
            setDocData(data);
        } catch (error) {
            console.error('Error fetching document data:', error);
        } finally {
            setLoading(false);
        }
    };

    const finalFileName = fileName || `${type}_${documentId.substring(0, 8)}.pdf`;

    // Wrap in stable span to prevent position swap on re-render
    return (
        <span className="inline-flex">
            {!docData ? (
                <Button
                    variant={variant}
                    size={size}
                    onClick={handlePrepare}
                    disabled={loading}
                    className={className}
                >
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    <span>{label}</span>
                </Button>
            ) : (
                <PDFDownloadLink
                    document={<UnifiedDocumentPdf type={type} data={docData} />}
                    fileName={finalFileName}
                >
                    {({ loading: pdfLoading }) => (
                        <Button
                            variant={variant}
                            size={size}
                            disabled={pdfLoading}
                            className={className}
                        >
                            {pdfLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4 mr-2" />
                            )}
                            <span>{label}</span>
                        </Button>
                    )}
                </PDFDownloadLink>
            )}
        </span>
    );
}
