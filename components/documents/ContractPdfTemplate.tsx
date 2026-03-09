import React from 'react';
import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
import { docStyles as styles } from './document-styles';
import { formatCurrency } from '@/lib/utils/format';

interface ContractPdfTemplateProps {
    data: any;
}

const ContractPdfTemplate: React.FC<ContractPdfTemplateProps> = ({ data }) => {
    const {
        contract_number = '......./HĐKT-TL',
        day = new Date().getDate(),
        month = new Date().getMonth() + 1,
        year = new Date().getFullYear(),
        customer = {},
        items = [],
        total_amount = 0,
        amount_in_words = '................',
        start_date = '...........',
        delivery_location = customer.address || '...........',
    } = data;

    return (
        <Document title={`Hop_dong_${contract_number}`}>
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
                    <Text style={styles.docNumber}>Số: {contract_number}</Text>
                    <Text style={styles.docDate}>Hà Nội, ngày {day} tháng {month} năm {year}</Text>
                </View>

                <Text style={styles.title}>Hợp đồng kinh tế</Text>

                {/* Law Bases */}
                <View style={styles.lawSection}>
                    <Text style={styles.lawItem}>- Căn cứ Bộ luật Dân sự nước Cộng hòa Xã hội Chủ nghĩa Việt Nam số 91/2015/QH13;</Text>
                    <Text style={styles.lawItem}>- Căn cứ Luật Thương mại số 36/2005/QH11;</Text>
                    <Text style={styles.lawItem}>- Căn cứ Luật Doanh nghiệp số 68/2014/QH13;</Text>
                    <Text style={styles.lawItem}>- Căn cứ vào khả năng và nhu cầu của hai bên.</Text>
                </View>

                {/* Parties */}
                <View style={styles.partySection}>
                    <Text style={styles.partyTitle}>Bên sử dụng dịch vụ (Bên A): {customer.company_name || customer.name || '................'}</Text>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Người đại diện:</Text>
                        <Text style={[styles.partyValue, styles.bold]}>{customer.representative || '................'}</Text>
                        <Text style={{ width: '15%' }}>Chức vụ:</Text>
                        <Text style={{ width: '25%' }}>{customer.position || '................'}</Text>
                    </View>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Địa chỉ:</Text>
                        <Text style={styles.partyValue}>{customer.address || '................'}</Text>
                    </View>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Điện thoại:</Text>
                        <Text style={{ width: '35%' }}>{customer.phone || '................'}</Text>
                        <Text style={{ width: '10%' }}>Email:</Text>
                        <Text style={styles.partyValue}>{customer.email || '................'}</Text>
                    </View>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Mã số thuế:</Text>
                        <Text style={styles.partyValue}>{customer.tax_code || '................'}</Text>
                    </View>
                </View>

                <View style={styles.partySection}>
                    <Text style={styles.partyTitle}>Bên cung cấp dịch vụ (Bên B): Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie</Text>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Người đại diện:</Text>
                        <Text style={[styles.partyValue, styles.bold]}>Ông Nguyễn Thanh Tùng</Text>
                        <Text style={{ width: '15%' }}>Chức vụ:</Text>
                        <Text style={{ width: '25%' }}>Giám đốc</Text>
                    </View>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Địa chỉ:</Text>
                        <Text style={styles.partyValue}>Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Q. Hà Đông, Hà Nội</Text>
                    </View>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Mã số thuế:</Text>
                        <Text style={styles.partyValue}>0110163102</Text>
                    </View>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Số tài khoản:</Text>
                        <Text style={styles.partyValue}>86683979 tại Ngân hàng Techcombank - CN Hội sở</Text>
                    </View>
                </View>

                <Text style={[styles.subtitle, { marginTop: 15 }]}>Điều 1: Nội dung và giá trị hợp đồng</Text>
                <Text style={styles.text}>1.1. Bên B thực hiện cung cấp cho Bên A những sản phẩm, dịch vụ sau:</Text>

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

                <Text style={styles.subtitle}>Điều 2: Giá trị hợp đồng và phương thức thanh toán</Text>
                <Text style={styles.text}>2.1. Tổng giá trị hợp đồng (đã bao gồm thuế GTGT): <Text style={styles.bold}>{formatCurrency(total_amount)}</Text></Text>
                <Text style={styles.text}>(Bằng chữ: <Text>{amount_in_words}</Text>)</Text>
                <Text style={styles.text}>2.2. Hình thức thanh toán: Chuyển khoản hoặc tiền mặt.</Text>
                <Text style={styles.text}>2.3. Thời hạn thanh toán: Trong vòng 05 ngày kể từ ngày nhận đầy đủ hóa đơn.</Text>

                <View style={styles.signatureSection} wrap={false}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.bold}>Đại diện Bên A</Text>
                        <Text>(Ký và đóng dấu)</Text>
                        <View style={styles.signatureSpace} />
                        <Text style={styles.signatureName}>{customer.representative || ''}</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.bold}>Đại diện Bên B</Text>
                        <Text>(Ký và đóng dấu)</Text>
                        <View style={styles.signatureSpace} />
                        <Text style={styles.signatureName}>Ông Nguyễn Thanh Tùng</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default ContractPdfTemplate;
