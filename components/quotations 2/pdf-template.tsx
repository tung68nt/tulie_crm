import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Quotation, QuotationItem, Customer } from '@/types';
import { formatCurrency } from '@/lib/utils/format';

// Register a font that supports Vietnamese
Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', // Fallback/Standard font
    fontWeight: 'medium',
});
Font.register({
    family: 'Roboto-Regular',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
    fontWeight: 'normal',
});


const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Roboto-Regular',
        fontSize: 10,
        color: '#333',
        lineHeight: 1.5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 20,
    },
    logo: {
        width: 100,
        marginBottom: 10,
    },
    companyInfo: {
        width: '50%',
    },
    companyName: {
        fontSize: 18,
        fontFamily: 'Roboto',
        color: '#000',
        marginBottom: 5,
        textTransform: 'none',
    },
    metaInfo: {
        width: '40%',
        textAlign: 'right',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Roboto',
        color: '#000',
        marginBottom: 10,
        textTransform: 'none',
        letterSpacing: 2,
    },
    billTo: {
        marginTop: 20,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Roboto',
        color: '#000',
        marginTop: 15,
        marginBottom: 5,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        textTransform: 'none',
    },
    table: {
        width: 'auto',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingVertical: 8,
        alignItems: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 8,
        alignItems: 'flex-start', // Align top for multiline description
    },
    col1: { width: '5%', textAlign: 'center' }, // STT
    col2: { width: '30%', paddingRight: 5 }, // Description/Specs
    col3: { width: '10%', textAlign: 'center' }, // Unit
    col4: { width: '8%', textAlign: 'center' }, // Qty
    col5: { width: '12%', textAlign: 'right' }, // Price
    col6: { width: '10%', textAlign: 'center' }, // CK%
    col7: { width: '10%', textAlign: 'center' }, // VAT%
    col8: { width: '15%', textAlign: 'right' }, // Total

    productName: {
        fontSize: 10,
        fontFamily: 'Roboto',
        marginBottom: 2,
    },
    productDesc: {
        fontSize: 9,
        color: '#666',
        fontStyle: 'italic',
    },
    totals: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '40%',
        marginBottom: 5,
    },
    totalLabel: {
        fontFamily: 'Roboto',
    },
    totalValue: {
        fontFamily: 'Roboto',
        textAlign: 'right',
    },
    grandTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '40%',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#000',
    },
    grandTotalValue: {
        fontSize: 14,
        fontFamily: 'Roboto',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        fontSize: 9,
        color: '#999',
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 20,
    },
    terms: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 4,
    },
    termsTitle: {
        fontSize: 11,
        fontFamily: 'Roboto',
        marginBottom: 5,
    },
    termsText: {
        fontSize: 9,
        color: '#444',
    },
    bankInfo: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 4,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    bankRow: {
        width: '50%',
        marginBottom: 3,
        flexDirection: 'row',
    },
    bankLabel: {
        width: '35%',
        fontSize: 8,
        color: '#666',
    },
    bankValue: {
        width: '65%',
        fontSize: 8,
        fontFamily: 'Roboto',
    }
});

interface PdfTemplateProps {
    quotation: any; // Using any temporarily to be flexible with new types
}

const PdfTemplate: React.FC<PdfTemplateProps> = ({ quotation }) => {
    // Group items by section
    const sections: Record<string, QuotationItem[]> = {};

    // Default section for items without one
    const DEFAULT_SECTION = 'Chi tiết';

    const items = quotation.items || [];
    const hasDiscount = items.some((item: any) => item.discount > 0);

    items.forEach((item: any) => {
        const sectionName = item.section_name || DEFAULT_SECTION;
        if (!sections[sectionName]) {
            sections[sectionName] = [];
        }
        sections[sectionName].push(item);
    });

    // Dynamic column widths
    const col2Width = hasDiscount ? '40%' : '50%';
    const col6Width = hasDiscount ? '10%' : '0%';
    const col7Width = '0%'; // Always hide VAT col in table as requested
    const col8Width = '15%';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.companyInfo}>
                        <Image src="/logo.png" style={styles.logo} />
                        <Text style={styles.companyName}>TULIE AGENCY</Text>
                        <Text>Design • Branding • Marketing • Events</Text>
                        <Text>123 Đường ABC, Quận XYZ, TP.HCM</Text>
                        <Text>Hotline: 090 123 4567 | Email: hello@tulie.agency</Text>
                    </View>
                    <View style={styles.metaInfo}>
                        <Text style={styles.title}>BÁO GIÁ</Text>
                        <Text>Số: {quotation.quote_number || 'BG-XXXX'}</Text>
                        <Text>Ngày: {new Date().toLocaleDateString('vi-VN')}</Text>
                        <Text>Hiệu lực: {quotation.valid_days || 30} ngày</Text>
                    </View>
                </View>

                {/* Customer Info */}
                <View style={styles.billTo}>
                    <Text style={{ fontFamily: 'Roboto', marginBottom: 5 }}>Khách hàng:</Text>
                    <Text style={{ fontSize: 12, fontFamily: 'Roboto' }}>{quotation.customer?.company_name || 'Khách hàng'}</Text>
                    <Text>{quotation.customer?.address || ''}</Text>
                    <Text>Liên hệ: {quotation.customer?.phone || ''}</Text>
                </View>

                {/* Table Content */}
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>STT</Text>
                        <Text style={[styles.col2, { width: col2Width }]}>Hạng mục / Mô tả</Text>
                        <Text style={styles.col3}>ĐVT</Text>
                        <Text style={styles.col4}>SL</Text>
                        <Text style={styles.col5}>Đơn giá</Text>
                        {hasDiscount && <Text style={[styles.col6, { width: col6Width }]}>CK (%)</Text>}
                        <Text style={[styles.col8, { width: col8Width }]}>Thành tiền</Text>
                    </View>

                    {/* Render items by section */}
                    {Object.entries(sections).map(([sectionName, sectionItems], sectionIdx) => (
                        <View key={sectionIdx} wrap={false}>
                            {/* Section Header */}
                            <Text style={styles.sectionTitle}>
                                {(() => {
                                    const toRoman = (num: number) => {
                                        const lookup: any = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
                                        let roman = '';
                                        for (let i in lookup) { while (num >= lookup[i]) { roman += i; num -= lookup[i]; } }
                                        return roman;
                                    };
                                    return toRoman(sectionIdx + 1);
                                })()}. {sectionName}
                            </Text>

                            {/* Items in Section */}
                            {sectionItems.map((item, idx) => (
                                <View style={styles.tableRow} key={item.id}>
                                    <Text style={styles.col1}>{idx + 1}</Text>
                                    <View style={[styles.col2, { width: col2Width }]}>
                                        <Text style={styles.productName}>{item.product_name}</Text>
                                        {item.description && (
                                            <Text style={styles.productDesc}>{item.description}</Text>
                                        )}
                                    </View>
                                    <Text style={styles.col3}>{item.unit}</Text>
                                    <Text style={styles.col4}>{item.quantity}</Text>
                                    <Text style={styles.col5}>{new Intl.NumberFormat('vi-VN').format(item.unit_price)}</Text>
                                    {hasDiscount && <Text style={[styles.col6, { width: col6Width }]}>{item.discount || 0}%</Text>}
                                    <Text style={[styles.col8, { width: col8Width }]}>{new Intl.NumberFormat('vi-VN').format(item.total_price || (item.quantity * item.unit_price * (1 - (item.discount || 0) / 100)))}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totals}>
                    <View style={{ width: '100%' }}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Tạm tính:</Text>
                            <Text style={styles.totalValue}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quotation.subtotal || 0)}</Text>
                        </View>
                        {quotation.vat_percent > 0 && (
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>VAT ({quotation.vat_percent}%):</Text>
                                <Text style={styles.totalValue}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quotation.vat_amount || 0)}</Text>
                            </View>
                        )}
                        <View style={styles.grandTotal}>
                            <Text style={[styles.totalLabel, { fontSize: 12 }]}>TỔNG CỘNG:</Text>
                            <Text style={[styles.grandTotalValue, { color: '#000' }]}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quotation.grand_total || quotation.total_amount || 0)}</Text>
                        </View>
                    </View>
                </View>

                {/* Footer / Terms */}
                <View style={styles.terms} wrap={false}>
                    <Text style={styles.sectionTitle}>ĐIỀU KHOẢN & GHI CHÚ / TERMS & NOTES</Text>
                    <View style={{ marginBottom: 10 }}>
                        <Text style={styles.termsTitle}>Điều khoản thanh toán / Payment Terms:</Text>
                        <Text style={styles.termsText}>{quotation.terms || '• 50% đặt cọc khi xác nhận báo giá\n• 50% còn lại thanh toán khi hoàn thành'}</Text>
                    </View>
                    <View>
                        <Text style={styles.termsTitle}>Ghi chú / Notes:</Text>
                        <Text style={styles.termsText}>
                            {quotation.notes || '• Báo giá có hiệu lực trong vòng 07 ngày.\n• Giá trên chưa bao gồm chi phí mua tên miền & hosting (nếu có).\n• Nội dung công việc sẽ được mô tả chi tiết trong hợp đồng.'}
                        </Text>
                    </View>
                </View>

                {/* Bank Info */}
                <View style={styles.bankInfo} wrap={false}>
                    <View style={{ width: '100%', marginBottom: 5 }}>
                        <Text style={[styles.termsTitle, { marginBottom: 5 }]}>THÔNG TIN CHUYỂN KHOẢN / BANK TRANSFER</Text>
                    </View>
                    <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Ngân hàng / Bank:</Text>
                        <Text style={styles.bankValue}>{quotation.bank_name || 'TECHCOMBANK'}</Text>
                    </View>
                    <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Số TK / Account No:</Text>
                        <Text style={styles.bankValue}>{quotation.bank_account_no || '190368686868'}</Text>
                    </View>
                    <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Chủ TK / Acc Name:</Text>
                        <Text style={styles.bankValue}>{quotation.bank_account_name || 'CONG TY TNHH TULIE'}</Text>
                    </View>
                    <View style={styles.bankRow}>
                        <Text style={styles.bankLabel}>Chi nhánh / Branch:</Text>
                        <Text style={styles.bankValue}>{quotation.bank_branch || 'Thanh Xuân - Hà Nội'}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text>Cảm ơn quý khách đã tin tưởng dịch vụ của Tulie Agency!</Text>
                </View>
            </Page>
        </Document>
    );
};

export default PdfTemplate;
