import React from 'react';
import { Page, Text, View, Document } from '@react-pdf/renderer';
import { docStyles as styles } from './document-styles';
import { formatCurrency } from '@/lib/utils/format';

interface PurchaseOrderPdfTemplateProps {
    data: any;
}

const PurchaseOrderPdfTemplate: React.FC<PurchaseOrderPdfTemplateProps> = ({ data }) => {
    const {
        order_number = '......./ĐDH-TL',
        day = new Date().getDate(),
        month = new Date().getMonth() + 1,
        year = new Date().getFullYear(),
        customer = {},
        items = [],
        total_amount = 0,
        amount_in_words = '................',
        payment_method = 'Chuyển khoản / Tiền mặt',
        delivery_time = 'Theo thoả thuận',
    } = data;

    return (
        <Document title={`Don_dat_hang_${order_number}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.companyHeader}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>Công ty TNHH Dịch vụ và Giải pháp</Text>
                        <Text style={styles.brandName}>Công nghệ Tulie</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.nationalTitle}>Cộng hoà Xã hội Chủ nghĩa Việt Nam</Text>
                        <Text style={styles.nationalMotto}>Độc lập - Tự do - Hạnh phúc</Text>
                        <View style={styles.underline} />
                    </View>
                </View>

                <View style={styles.docMeta}>
                    <Text style={styles.docNumber}>Số: {order_number}</Text>
                    <Text style={styles.docDate}>Hà Nội, ngày {day} tháng {month} năm {year}</Text>
                </View>

                <Text style={styles.title}>Đơn đặt hàng</Text>

                {/* Parties */}
                <View style={styles.partySection}>
                    <Text style={styles.partyTitle}>Bên đặt hàng (Bên A): {customer.company_name || customer.name || '................'}</Text>
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

                <View style={styles.partySection}>
                    <Text style={styles.partyTitle}>Bên nhận đặt hàng (Bên B): Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie</Text>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Người đại diện:</Text>
                        <Text style={[styles.partyValue, styles.bold]}>Ông Nguyễn Thanh Tùng</Text>
                        <Text style={{ width: '15%' }}>Chức vụ:</Text>
                        <Text style={{ width: '25%' }}>Giám đốc</Text>
                    </View>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Mã số thuế:</Text>
                        <Text style={styles.partyValue}>0110163102</Text>
                    </View>
                </View>

                <Text style={[styles.subtitle, { marginTop: 15 }]}>Nội dung đặt hàng:</Text>
                <Text style={styles.text}>Bên A cam kết đặt hàng các sản phẩm, dịch vụ như sau:</Text>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableCell, styles.colCenter, { width: '8%' }, styles.bold]}>STT</Text>
                        <Text style={[styles.tableCell, { width: '42%' }, styles.bold]}>Tên hàng hoá, dịch vụ</Text>
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
                </View>

                <View style={{ marginTop: 15 }}>
                    <Text style={styles.text}>- Tổng giá trị đơn hàng: <Text style={styles.bold}>{formatCurrency(total_amount)}</Text></Text>
                    <Text style={styles.text}>- Bằng chữ: <Text>{amount_in_words}</Text></Text>
                    <Text style={styles.text}>- Thời gian giao hàng: {delivery_time}</Text>
                    <Text style={styles.text}>- Hình thức thanh toán: {payment_method}</Text>
                </View>

                <View style={styles.signatureSection} wrap={false}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.bold}>Đại diện Bên A</Text>
                        <Text>(Ký tên)</Text>
                        <View style={styles.signatureSpace} />
                        <Text style={styles.signatureName}>{customer.representative || ''}</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.bold}>Đại diện Bên B</Text>
                        <Text>(Ký và đóng dấu)</Text>
                        <View style={styles.signatureSpace} />
                        <Text style={styles.signatureName}>Nguyễn Thanh Tùng</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default PurchaseOrderPdfTemplate;
