import React from 'react';
import ContractPdfTemplate from './ContractPdfTemplate';
import QuotationPdfTemplate from './QuotationPdfTemplate';
import PurchaseOrderPdfTemplate from './PurchaseOrderPdfTemplate';
import PaymentRequestPdfTemplate from './PaymentRequestPdfTemplate';
import DeliveryMinutesPdfTemplate from './DeliveryMinutesPdfTemplate';

interface UnifiedDocumentPdfProps {
    type: string;
    data: any;
}

const UnifiedDocumentPdf: React.FC<UnifiedDocumentPdfProps> = ({ type, data }) => {
    switch (type) {
        case 'contract':
            return <ContractPdfTemplate data={data} />;
        case 'quotation':
            return <QuotationPdfTemplate data={data} />;
        case 'order':
            return <PurchaseOrderPdfTemplate data={data} />;
        case 'payment_request':
        case 'invoice':
            return <PaymentRequestPdfTemplate data={data} />;
        case 'delivery_minutes':
        case 'minutes':
            return <DeliveryMinutesPdfTemplate data={data} />;
        default:
            return null;
    }
};

export default UnifiedDocumentPdf;
