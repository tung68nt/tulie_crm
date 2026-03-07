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
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'none',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 8,
        alignItems: 'flex-start', // Align top for multiline description
    },
    col1: { width: '4%', textAlign: 'center' }, // #
    col2: { width: '38%', paddingRight: 5 }, // Product
    col3: { width: '10%', textAlign: 'center' }, // Unit
    col4: { width: '6%', textAlign: 'center' }, // Qty
    col5: { width: '12%', textAlign: 'right' }, // Price
    col6: { width: '8%', textAlign: 'center' }, // CK%
    col7: { width: '7%', textAlign: 'center' }, // VAT%
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
    const DEFAULT_SECTION = 'Chi tiết hạng mục';

    const items = quotation.items || [];
    const hasDiscount = items.some((item: any) => item.discount > 0);
    const pc = quotation.proposal_content || {};
    const hasProposal = pc && Object.values(pc).some(v => v && String(v).trim().length > 0);

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
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: '#000', borderBottomWidth: 2 }]}>
                    <View style={styles.companyInfo}>
                        <Text style={[styles.companyName, { fontSize: 22, letterSpacing: -0.5 }]}>THIỆP NHANH</Text>
                        <Text style={{ fontSize: 9, color: '#666', marginBottom: 8, fontWeight: 'bold' }}>THIỆP MỜI & QUÀ TẶNG CAO CẤP</Text>
                        <Text style={{ fontSize: 8 }}>Website: thiepnhanh.vn</Text>
                        <Text style={{ fontSize: 8 }}>Email: hello@thiepnhanh.vn</Text>
                        <Text style={{ fontSize: 8 }}>Hotline: 098.898.4554</Text>
                    </View>
                    <View style={styles.metaInfo}>
                        <Text style={[styles.title, { fontSize: 20, letterSpacing: 0, marginBottom: 4 }]}>BÁO GIÁ DỊCH VỤ</Text>
                        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>SỐ: {quotation.quotation_number || 'BG-XXXX'}</Text>
                        <Text style={{ fontSize: 9, color: '#666' }}>Ngày lập: {new Date().toLocaleDateString('vi-VN')}</Text>
                        <Text style={{ fontSize: 9, color: '#666' }}>Hiệu lực: {quotation.valid_days || 30} ngày</Text>
                    </View>
                </View>

                {/* Customer Info */}
                <View style={{ marginBottom: 25, backgroundColor: '#f9f9f9', padding: 15, borderRadius: 4 }}>
                    <Text style={{ fontSize: 8, color: '#666', textTransform: 'uppercase', marginBottom: 4, fontWeight: 'bold' }}>Khách hàng / Client:</Text>
                    <Text style={{ fontSize: 14, fontFamily: 'Roboto', color: '#000' }}>{quotation.customer?.company_name || 'Quý khách hàng'}</Text>
                    {quotation.customer?.address && <Text style={{ fontSize: 9, marginTop: 4, color: '#444' }}>Địa chỉ: {quotation.customer.address}</Text>}
                    <View style={{ flexDirection: 'row', marginTop: 6, gap: 20 }}>
                        <Text style={{ fontSize: 9, color: '#444' }}>SĐT: {quotation.customer?.phone || 'N/A'}</Text>
                        <Text style={{ fontSize: 9, color: '#444' }}>Email: {quotation.customer?.email || 'N/A'}</Text>
                    </View>
                </View>

                {/* Proposal Section (Simplified) */}
                {hasProposal && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={[styles.sectionTitle, { backgroundColor: '#000', color: '#fff', padding: 6, borderBottomWidth: 0 }]}>ĐỀ XUẤT GIẢI PHÁP / PROPOSAL</Text>
                        {Object.entries({
                            introduction: 'Giới thiệu',
                            scope_of_work: 'Phạm vi công việc',
                            timeline: 'Tiến độ thực hiện'
                        }).map(([key, label]) => pc[key] ? (
                            <View key={key} style={{ marginTop: 10, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#eee' }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 }}>{label}:</Text>
                                <Text style={{ fontSize: 9, color: '#444', lineHeight: 1.4 }}>{pc[key]}</Text>
                            </View>
                        ) : null)}
                    </View>
                )}

                {/* Table Content */}
                <View style={styles.table}>
                    <Text style={[styles.sectionTitle, { backgroundColor: '#000', color: '#fff', padding: 6, borderBottomWidth: 0, marginBottom: 0 }]}>CHI TIẾT HẠNG MỤC / INVESTMENT PLAN</Text>

                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.col1, styles.tableHeaderChild]}>#</Text>
                        <Text style={[styles.col2, styles.tableHeaderChild, { width: hasDiscount ? '38%' : '46%' }]}>DỊCH VỤ / SẢN PHẨM</Text>
                        <Text style={[styles.col3, styles.tableHeaderChild]}>ĐVT</Text>
                        <Text style={[styles.col4, styles.tableHeaderChild]}>SL</Text>
                        <Text style={[styles.col5, styles.tableHeaderChild]}>ĐƠN GIÁ</Text>
                        {hasDiscount && <Text style={[styles.col6, styles.tableHeaderChild]}>CK%</Text>}
                        <Text style={[styles.col7, styles.tableHeaderChild]}>VAT</Text>
                        <Text style={[styles.col8, styles.tableHeaderChild]}>THÀNH TIỀN</Text>
                    </View>

                    {/* Render items by section */}
                    {sectionEntries.map(([sectionName, sectionItems], sectionIdx) => (
                        <View key={sectionIdx} wrap={false}>
                            {/* Section Header - Show if a name is provided OR if there are multiple sections */}
                            {(sectionName !== DEFAULT_SECTION || sectionEntries.length > 1) && (
                                <View style={{ backgroundColor: '#f9f9f9', paddingVertical: 6, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <View style={{ backgroundColor: '#000', borderRadius: 2, paddingHorizontal: 4, paddingVertical: 1 }}>
                                        <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>{sectionIdx + 1}</Text>
                                    </View>
                                    <Text style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
                                        {sectionName || `Hạng mục ${sectionIdx + 1}`}
                                    </Text>
                                </View>
                            )}

                            {/* Items in Section */}
                            {sectionItems.map((item, idx) => {
                                globalItemIndex++;
                                return (
                                    <View style={styles.tableRow} key={item.id}>
                                        <Text style={styles.col1}>{globalItemIndex}</Text>
                                        <View style={[styles.col2, { width: hasDiscount ? '38%' : '46%' }]}>
                                            <Text style={[styles.productName, { fontWeight: 'bold' }]}>{item.product_name}</Text>
                                            {item.description && (
                                                <Text style={[styles.productDesc, { marginTop: 2, fontSize: 8 }]}>{item.description}</Text>
                                            )}
                                        </View>
                                        <Text style={styles.col3}>{item.unit}</Text>
                                        <Text style={styles.col4}>{item.quantity}</Text>
                                        <Text style={styles.col5}>{new Intl.NumberFormat('vi-VN').format(item.unit_price)}</Text>
                                        {hasDiscount && <Text style={styles.col6}>{item.discount || 0}%</Text>}
                                        <Text style={styles.col7}>{quotation.vat_percent}%</Text>
                                        <Text style={[styles.col8, { fontWeight: 'bold' }]}>{new Intl.NumberFormat('vi-VN').format(item.total_price)}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </View>

                {/* Summary & Footer */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                    <View style={{ width: '55%' }}>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 5 }}>ĐIỀU KHOẢN THANH TOÁN:</Text>
                        <Text style={{ fontSize: 8, color: '#666', lineHeight: 1.4 }}>{quotation.terms || '• 50% đặt cọc khi xác nhận báo giá\n• 50% còn lại thanh toán khi hoàn thành bàn giao'}</Text>

                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 15, marginBottom: 5 }}>THÔNG TIN CHUYỂN KHOẢN:</Text>
                        <View style={{ fontSize: 8, color: '#444' }}>
                            <Text>Chủ TK: {quotation.bank_account_name || 'NGUYEN MANH TUNG'}</Text>
                            <Text>Số TK: {quotation.bank_account_no || '190368686868'}</Text>
                            <Text>Ngân hàng: {quotation.bank_name || 'Techcombank'} - {quotation.bank_branch || 'Chi nhánh Hà Nội'}</Text>
                        </View>
                    </View>

                    <View style={{ width: '40%' }}>
                        <View style={{ borderTopWidth: 1, borderTopColor: '#000', paddingTop: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text style={{ fontSize: 9 }}>Tạm tính:</Text>
                                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quotation.subtotal || 0)}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text style={{ fontSize: 9 }}>VAT ({quotation.vat_percent}%):</Text>
                                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quotation.vat_amount || 0)}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#000', padding: 8, borderRadius: 2 }}>
                                <Text style={{ fontSize: 11, color: '#fff', fontWeight: 'bold' }}>TỔNG CỘNG:</Text>
                                <Text style={{ fontSize: 11, color: '#fff', fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quotation.total_amount || 0)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text>Cảm ơn quý khách đã tin tưởng dịch vụ của Thiệp Nhanh (thiepnhanh.vn)!</Text>
                </View>
            </Page>
        </Document>
    );
};

export default PdfTemplate;
