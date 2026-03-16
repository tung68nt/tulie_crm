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
    family: 'Roboto-Bold',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
    fontWeight: 'bold',
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
        letterSpacing: 0,
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
        backgroundColor: '#1a1a1a',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingVertical: 10,
        alignItems: 'center',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    tableHeaderChild: {
        color: '#ffffff',
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'none',
    },
    tableHeaderSub: {
        fontSize: 7,
        color: '#aaa',
        fontStyle: 'italic',
        fontWeight: 'normal',
        marginTop: 2,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 10,
        alignItems: 'flex-start', // Align top for multiline description
    },
    col1: { width: '4%', textAlign: 'center' }, // #
    col2: { paddingRight: 5, paddingLeft: 4 }, // Product
    col3: { width: '10%', textAlign: 'center' }, // Unit
    col4: { width: '8%', textAlign: 'center' }, // Qty
    col5: { width: '16%', textAlign: 'right' }, // Price
    col6: { width: '7%', textAlign: 'center' }, // CK%
    col8: { width: '18%', textAlign: 'right', paddingRight: 8 }, // Total

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
    const DEFAULT_SECTION = 'Chi tiết hạng mục';

    const items = quotation.items || [];
    const hasDiscount = items.some((item: any) => item.discount > 0);
    const pc = quotation.proposal_content || {};
    const hasProposal = pc && Object.values(pc).some(v => v && String(v).trim().length > 0);

    // Calculate discount totals
    const subtotalRaw = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);
    const totalDiscount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price * ((item.discount || 0) / 100)), 0);

    items.forEach((item: any) => {
        const sectionName = item.section_name || DEFAULT_SECTION;
        if (!sections[sectionName]) {
            sections[sectionName] = [];
        }
        sections[sectionName].push(item);
    });

    const sectionEntries = Object.entries(sections).sort((a, b) => {
        if (a[0] === DEFAULT_SECTION) return 1;
        if (b[0] === DEFAULT_SECTION) return -1;
        return (a[1][0].sort_order || 0) - (b[1][0].sort_order || 0);
    });

    let globalItemIndex = 0;

    return (
        <Document title={`Bao gia ${quotation.quotation_number || ''}`}>
            <Page size="A4" style={styles.page}>
                {/* Header Block */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, alignItems: 'flex-start' }}>
                    {/* Left: Company Logo & Info */}
                    <View style={{ width: '60%' }}>
                        <Text style={{ fontSize: 13, fontFamily: 'Roboto-Bold', color: '#000', marginBottom: 6, textTransform: 'uppercase' }}>
                            Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie
                        </Text>
                        <View style={{ gap: 2 }}>
                            <Text style={{ fontSize: 8, color: '#444' }}>Địa chỉ: Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, TP. Hà Nội</Text>
                            <Text style={{ fontSize: 8, color: '#444' }}>Điện thoại: 098.898.4554</Text>
                            <Text style={{ fontSize: 8, color: '#444' }}>Email: info@tulie.vn</Text>
                            <Text style={{ fontSize: 8, color: '#444' }}>MST: 0110163102</Text>
                        </View>
                    </View>

                    {/* Right: Title & Meta */}
                    <View style={{ width: '35%', textAlign: 'right' }}>
                        <Text style={{ fontSize: 42, fontFamily: 'Roboto-Bold', color: '#000', letterSpacing: -1, textTransform: 'uppercase', lineHeight: 0.8 }}>Báo giá</Text>
                        <Text style={{ fontSize: 18, fontFamily: 'Roboto', color: '#666', marginBottom: 15 }}>Quotation</Text>

                        <View style={{ gap: 2 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 4 }}>
                                <Text style={{ fontSize: 8, fontFamily: 'Roboto-Bold' }}>Số/ No:</Text>
                                <Text style={{ fontSize: 8 }}>{quotation.quotation_number || '---'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 4 }}>
                                <Text style={{ fontSize: 8, fontFamily: 'Roboto-Bold' }}>Ngày/ Date:</Text>
                                <Text style={{ fontSize: 8 }}>{new Date(quotation.created_at || new Date()).toLocaleDateString('vi-VN')}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 4 }}>
                                <Text style={{ fontSize: 8, fontFamily: 'Roboto-Bold' }}>Hiệu lực/ Valid:</Text>
                                <Text style={{ fontSize: 8 }}>{quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString('vi-VN') : (quotation.valid_days || 30) + ' ngày'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Customer Info */}
                <View style={{ marginBottom: 30, backgroundColor: '#fcfcfc', padding: 15, borderRadius: 8, border: '1px solid #efefef' }}>
                    <Text style={{ fontSize: 9, color: '#888', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'Roboto-Bold' }}>Thông tin khách hàng / Customer:</Text>
                    <Text style={{ fontSize: 13, fontFamily: 'Roboto-Bold', color: '#000', marginBottom: 4 }}>{quotation.customer?.company_name || quotation.customer_name || 'Quý khách hàng'}</Text>
                    <Text style={{ fontSize: 9, color: '#444' }}>Địa chỉ: {quotation.customer?.address || 'N/A'}</Text>
                    <View style={{ flexDirection: 'row', marginTop: 4, gap: 20 }}>
                        <Text style={{ fontSize: 9, color: '#444' }}>Người liên hệ: {quotation.customer?.contact_person || quotation.customer?.contact_name || 'N/A'}</Text>
                        <Text style={{ fontSize: 9, color: '#444' }}>SĐT: {quotation.customer?.phone || 'N/A'}</Text>
                    </View>
                </View>

                {/* Proposal Sections */}
                {hasProposal && (
                    <View style={{ marginBottom: 30 }}>
                        <View style={{ backgroundColor: '#000', padding: 10, borderRadius: 4, marginBottom: 15 }}>
                            <Text style={{ color: '#fff', fontSize: 11, fontFamily: 'Roboto-Bold', textTransform: 'uppercase' }}>Đề xuất giải pháp / Proposal</Text>
                        </View>

                        {/* Map dynamic sections */}
                        {Object.entries(pc).map(([key, value], idx) => {
                            if (!value || typeof value !== 'string' || value.trim().length === 0 || ['custom_sections'].includes(key)) return null;
                            const labels: Record<string, string> = {
                                introduction: 'Mục tiêu & Giới thiệu',
                                transition: 'Tiếp cận & Giải pháp',
                                scope_of_work: 'Phạm vi công việc',
                                why_us: 'Tại sao chọn Tulie',
                                case_studies: 'Kinh nghiệm thực tế',
                                timeline: 'Lộ trình triển khai'
                            };
                            return (
                                <View key={key} wrap={false} style={{ marginBottom: 15, paddingLeft: 15, borderLeft: '2px solid #efefef' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                        <View style={{ backgroundColor: '#000', color: '#fff', width: 14, height: 14, borderRadius: 7, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                                            <Text style={{ fontSize: 8, fontFamily: 'Roboto-Bold' }}>{idx + 1}</Text>
                                        </View>
                                        <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold', textTransform: 'uppercase' }}>{labels[key] || key}</Text>
                                    </View>
                                    <Text style={{ fontSize: 9, color: '#555', lineHeight: 1.6 }}>{value}</Text>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Item Table */}
                <View style={[styles.table, { border: '1px solid #efefef', borderRadius: 8, overflow: 'hidden' }]}>
                    <View style={[styles.tableHeader, { backgroundColor: '#000', borderBottomWidth: 0 }]}>
                        <Text style={[styles.col1, styles.tableHeaderChild]}>#</Text>
                        <View style={[styles.col2, { width: hasDiscount ? '37%' : '44%' }]}>
                            <Text style={styles.tableHeaderChild}>Dịch vụ & Mô tả / Description</Text>
                        </View>
                        <View style={styles.col3}>
                            <Text style={styles.tableHeaderChild}>ĐVT</Text>
                        </View>
                        <View style={styles.col4}>
                            <Text style={styles.tableHeaderChild}>SL</Text>
                        </View>
                        <View style={styles.col5}>
                            <Text style={styles.tableHeaderChild}>Đơn giá</Text>
                        </View>
                        {hasDiscount && <View style={styles.col6}><Text style={styles.tableHeaderChild}>CK%</Text></View>}
                        <View style={styles.col8}>
                            <Text style={styles.tableHeaderChild}>Thành tiền</Text>
                        </View>
                    </View>

                    {sectionEntries.map(([sectionName, sectionItems], sectionIdx) => (
                        <View key={sectionIdx} wrap={false}>
                            {/* Section Divider */}
                            {(sectionName !== DEFAULT_SECTION || sectionEntries.length > 1) && (
                                <View style={{ backgroundColor: '#f9f9f9', padding: 8, borderBottom: '1px solid #efefef' }}>
                                    <Text style={{ fontSize: 9, fontFamily: 'Roboto-Bold', textTransform: 'uppercase' }}>{sectionName}</Text>
                                </View>
                            )}

                            {sectionItems.map((item, idx) => {
                                globalItemIndex++;
                                return (
                                    <View style={[styles.tableRow, { borderBottomColor: idx === sectionItems.length - 1 ? 'transparent' : '#f5f5f5' }]} key={item.id}>
                                        <Text style={styles.col1}>{globalItemIndex}</Text>
                                        <View style={[styles.col2, { width: hasDiscount ? '37%' : '44%' }]}>
                                            <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold' }}>{item.product_name}</Text>
                                            {item.description && <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>{item.description}</Text>}
                                        </View>
                                        <Text style={styles.col3}>{item.unit || '---'}</Text>
                                        <Text style={styles.col4}>{item.quantity}</Text>
                                        <Text style={styles.col5}>{formatCurrency(item.unit_price)}</Text>
                                        {hasDiscount && <Text style={styles.col6}>{item.discount || 0}%</Text>}
                                        <Text style={[styles.col8, { fontFamily: 'Roboto-Bold' }]}>{formatCurrency(item.total_price)}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </View>

                {/* Summary Table */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                    <View style={{ width: '40%', gap: 4 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 9 }}>Tạm tính:</Text>
                            <Text style={{ fontSize: 9, fontFamily: 'Roboto-Bold' }}>{formatCurrency(subtotalRaw)}</Text>
                        </View>
                        {totalDiscount > 0 && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 9 }}>Chiết khấu / Discount:</Text>
                                <Text style={{ fontSize: 9, fontFamily: 'Roboto-Bold', color: '#666' }}>-{formatCurrency(totalDiscount)}</Text>
                            </View>
                        )}
                        {totalDiscount > 0 && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: '#ddd', paddingTop: 4 }}>
                                <Text style={{ fontSize: 9, fontFamily: 'Roboto-Bold' }}>Thành tiền sau CK:</Text>
                                <Text style={{ fontSize: 9, fontFamily: 'Roboto-Bold' }}>{formatCurrency(subtotalRaw - totalDiscount)}</Text>
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 9 }}>VAT ({quotation.vat_percent || 0}%):</Text>
                            <Text style={{ fontSize: 9, fontFamily: 'Roboto-Bold' }}>{formatCurrency(quotation.vat_amount || 0)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#000', borderRadius: 4, marginTop: 5 }}>
                            <Text style={{ fontSize: 11, color: '#fff', fontFamily: 'Roboto-Bold' }}>TỔNG CỘNG:</Text>
                            <Text style={{ fontSize: 11, color: '#fff', fontFamily: 'Roboto-Bold' }}>{formatCurrency(quotation.total_amount || 0)}</Text>
                        </View>
                    </View>
                </View>

                {/* Notes & Bank */}
                <View style={{ marginTop: 40, flexDirection: 'row', gap: 30 }}>
                    {/* Notes & Terms */}
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Roboto-Bold', marginBottom: 8, textTransform: 'uppercase' }}>Ghi chú & Điều khoản / Terms:</Text>
                        <View style={{ gap: 4 }}>
                            {String(quotation.notes || quotation.brandConfig?.default_notes || '').split('\n').filter(Boolean).map((line, i) => (
                                <Text key={`n-${i}`} style={{ fontSize: 8, color: '#666' }}>• {line.replace(/^[-•]\s*/, '')}</Text>
                            ))}
                            {String(quotation.terms || quotation.brandConfig?.default_payment_terms || '').split('\n').filter(Boolean).map((line, i) => (
                                <Text key={`t-${i}`} style={{ fontSize: 8, color: '#666' }}>• {line.replace(/^[-•]\s*/, '')}</Text>
                            ))}
                        </View>
                    </View>

                    {/* Bank Info */}
                    <View style={{ width: '40%', padding: 12, backgroundColor: '#fcfcfc', borderRadius: 8, border: '1px solid #efefef' }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Roboto-Bold', marginBottom: 8, textTransform: 'uppercase', textAlign: 'center' }}>Thông tin thanh toán</Text>
                        <View style={{ gap: 4 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 8, color: '#888' }}>Số TK:</Text>
                                <Text style={{ fontSize: 8, fontFamily: 'Roboto-Bold' }}>{quotation.bank_account_no || quotation.bank_account_number || quotation.brandConfig?.bank_account_no}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 8, color: '#888' }}>Chủ TK:</Text>
                                <Text style={{ fontSize: 8, fontFamily: 'Roboto-Bold' }}>{quotation.bank_account_name || quotation.brandConfig?.bank_account_name}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 8, color: '#888' }}>Ngân hàng:</Text>
                                <Text style={{ fontSize: 8, fontFamily: 'Roboto-Bold' }}>{quotation.bank_name || quotation.brandConfig?.bank_name}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer Message */}
                <View style={{ position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', borderTop: '1px solid #efefef', paddingTop: 20 }}>
                    <Text style={{ fontSize: 8, color: '#aaa' }}>Cảm ơn Quý khách đã tin tưởng và đồng hành cùng Tulie Agency!</Text>
                </View>
            </Page>
        </Document>
    );
};

export default PdfTemplate;
