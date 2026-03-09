import React from 'react';
import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
import { docStyles as styles } from './document-styles';
import { formatCurrency } from '@/lib/utils/format';

interface QuotationPdfTemplateProps {
    data: any;
}

const QuotationPdfTemplate: React.FC<QuotationPdfTemplateProps> = ({ data }) => {
    const {
        quotation_number = '......./BG-TL',
        day = new Date().getDate(),
        month = new Date().getMonth() + 1,
        year = new Date().getFullYear(),
        customer = {},
        items = [],
        total_amount = 0,
        amount_in_words = '................',
        valid_until = '30 ngày kể từ ngày báo giá',
        payment_method = 'Chuyển khoản / Tiền mặt',
        delivery_time = 'Theo thoả thuận',
    } = data;

    return (
        <Document title={`Bao_gia_${quotation_number}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.companyHeader}>
                    <View style={styles.headerLeft}>
                        <Text style={[styles.companyName, { fontSize: 8 }]}>CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</Text>
                        <View style={{ marginTop: 5, fontSize: 8 }}>
                            <Text>MST: 0110163102</Text>
                            <Text>Hotline: 098.898.4554</Text>
                        </View>
                    </View>
                    <View style={[styles.headerRight, { alignItems: 'center' }]}>
                        <View style={{ width: 80, height: 40, marginBottom: 5 }}>
                            <Image src="/file/tulie-agency-logo.png" style={{ objectFit: 'contain' }} />
                        </View>
                        <Text style={[styles.companyName, { fontSize: 12 }]}>TULIE AGENCY</Text>
                        <View style={[styles.underline, { width: '60%' }]} />
                    </View>
                </View>

                <View style={styles.docMeta}>
                    <Text style={styles.docNumber}>Số: {quotation_number}</Text>
                    <Text style={styles.docDate}>Hà Nội, ngày {day} tháng {month} năm {year}</Text>
                </View>

                <Text style={styles.title}>BÁO GIÁ DỊCH VỤ</Text>

                {/* Receiver */}
                <View style={[styles.partySection, { borderBottom: 'none', marginBottom: 5 }]}>
                    <Text style={[styles.text, { marginBottom: 5 }]}>Kính gửi: <Text style={styles.bold}>{customer.company_name || customer.name || '................'}</Text></Text>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Người đại diện:</Text>
                        <Text style={[styles.partyValue, styles.bold]}>{customer.representative || '................'}</Text>
                    </View>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Địa chỉ:</Text>
                        <Text style={styles.partyValue}>{customer.address || '................'}</Text>
                    </View>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Số điện thoại:</Text>
                        <Text style={styles.partyValue}>{customer.phone || '................'}</Text>
                    </View>
                </View>

                <Text style={[styles.text, { marginTop: 10, marginBottom: 10 }]}>
                    Công ty Công nghệ Tulie chân trọng gửi tới Quý khách hàng báo giá chi tiết dịch vụ như sau:
                </Text>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableCell, styles.colCenter, { width: '8%' }, styles.bold]}>STT</Text>
                        <Text style={[styles.tableCell, { width: '42%' }, styles.bold]}>Nội dung hạng mục</Text>
                        <Text style={[styles.tableCell, styles.colCenter, { width: '10%' }, styles.bold]}>ĐVT</Text>
                        <Text style={[styles.tableCell, styles.colCenter, { width: '10%' }, styles.bold]}>SL</Text>
                        <Text style={[styles.tableCell, styles.colRight, { width: '15%' }, styles.bold]}>Đơn giá</Text>
                        <Text style={[styles.tableCellLast, styles.colRight, { width: '15%' }, styles.bold]}>Thành tiền</Text>
                    </View>
                    {items.map((item: any, idx: number) => (
                        <View style={styles.tableRow} key={idx} wrap={false}>
                            <Text style={[styles.tableCell, styles.colCenter, { width: '8%' }]}>{idx + 1}</Text>
                            <Text style={[styles.tableCell, { width: '42%' }]}>{item.product_name || item.name}</Text>
                            <Text style={[styles.tableCell, styles.colCenter, { width: '10%' }]}>{item.unit || 'Bộ'}</Text>
                            <Text style={[styles.tableCell, styles.colCenter, { width: '10%' }]}>{item.quantity}</Text>
                            <Text style={[styles.tableCell, styles.colRight, { width: '15%' }]}>{formatCurrency(item.unit_price).replace('₫', '')}</Text>
                            <Text style={[styles.tableCellLast, styles.colRight, { width: '15%' }]}>{formatCurrency(item.total_price || (item.quantity * item.unit_price)).replace('₫', '')}</Text>
                        </View>
                    ))}
                    {/* Summary Row */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '70%' }, styles.bold, styles.colRight]}>Tổng cộng tiền dịch vụ:</Text>
                        <Text style={[styles.tableCellLast, { width: '30%' }, styles.bold, styles.colRight]}>{formatCurrency(total_amount)}</Text>
                    </View>
                </View>

                <View style={{ marginTop: 15, fontSize: 10 }}>
                    <Text style={styles.text}>- Bằng chữ: <Text style={[styles.bold, { fontStyle: 'italic' }]}>{amount_in_words}</Text></Text>
                    <Text style={styles.text}>- Thời gian thực hiện: {delivery_time}</Text>
                    <Text style={styles.text}>- Hiệu lực báo giá: {valid_until}</Text>
                    <Text style={styles.text}>- Giá trên chưa bao gồm thuế VAT 8%-10% (nếu có)</Text>
                </View>

                {/* Footer Notes */}
                <View style={{ marginTop: 20 }}>
                    <Text style={[styles.text, styles.bold]}>Ghi chú & Điều khoản thanh toán:</Text>
                    <Text style={styles.text}>1. Thanh toán bằng chuyển khoản hoặc tiền mặt.</Text>
                    <Text style={styles.text}>2. Chia làm 2 đợt: Đợt 1 Tạm ứng 50%, Đợt 2 Tất toán sau nghiệm thu.</Text>
                </View>

                <View style={[styles.signatureSection, { marginTop: 40 }]} wrap={false}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.bold}>Đại diện Khách hàng</Text>
                        <Text>(Ký và ghi rõ họ tên)</Text>
                        <View style={styles.signatureSpace} />
                    </View>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.bold}>Đại diện Công ty Tulie</Text>
                        <Text>(Ký và đóng dấu)</Text>
                        <View style={styles.signatureSpace} />
                        <Text style={styles.signatureName}>Nguyễn Thanh Tùng</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default QuotationPdfTemplate;
