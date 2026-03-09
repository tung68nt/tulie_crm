import React from 'react';
import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
import { docStyles as styles } from './document-styles';
import { formatCurrency } from '@/lib/utils/format';

interface DeliveryMinutesPdfTemplateProps {
    data: any;
}

const DeliveryMinutesPdfTemplate: React.FC<DeliveryMinutesPdfTemplateProps> = ({ data }) => {
    const {
        minutes_number = '......./BBGN-TL',
        contract_number = '................',
        contract_date = '................',
        day = new Date().getDate(),
        month = new Date().getMonth() + 1,
        year = new Date().getFullYear(),
        customer = {},
        items = [],
    } = data;

    return (
        <Document title={`Bien_ban_ban_giao_${minutes_number}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.companyHeader}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>Công ty TNHH Dịch vụ và Giải pháp</Text>
                        <Text style={styles.brandName}>Công nghệ Tulie</Text>
                        <View style={{ marginTop: 5, fontSize: 8 }}>
                            <Text>MST: 0110163102</Text>
                            <Text>Hotline: 098.898.4554</Text>
                        </View>
                    </View>
                    <View style={[styles.headerRight, { alignItems: 'center' }]}>
                        <View style={{ width: 80, height: 40, marginBottom: 5 }}>
                            <Image src="/file/tulie-agency-logo.png" style={{ objectFit: 'contain' }} />
                        </View>
                        <Text style={[styles.companyName, { fontSize: 14 }]}>TULIE AGENCY</Text>
                        <View style={[styles.underline, { width: '60%' }]} />
                    </View>
                </View>

                <View style={styles.docMeta}>
                    <Text style={styles.docNumber}>Số: {minutes_number}</Text>
                    <Text style={styles.docDate}>Hà Nội, ngày {day} tháng {month} năm {year}</Text>
                </View>

                <Text style={styles.title}>Biên bản giao nhận và nghiệm thu</Text>

                <View style={styles.lawSection}>
                    <Text style={styles.lawItem}>- Căn cứ Hợp đồng số {contract_number} ký ngày {contract_date}.</Text>
                </View>

                <Text style={[styles.text, { marginBottom: 10 }]}>
                    Hôm nay, ngày {day} tháng {month} năm {year}, chúng tôi gồm có:
                </Text>

                <View style={styles.partySection}>
                    <Text style={styles.partyTitle}>Bên nhận (Bên A): {customer.company_name || customer.name || '................'}</Text>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Người đại diện:</Text>
                        <Text style={[styles.partyValue, styles.bold]}>{customer.representative || '................'}</Text>
                        <Text style={{ width: '15%' }}>Chức vụ:</Text>
                        <Text style={{ width: '25%' }}>{customer.position || '................'}</Text>
                    </View>
                </View>

                <View style={styles.partySection}>
                    <Text style={styles.partyTitle}>Bên giao (Bên B): Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie</Text>
                    <View style={styles.partyInfo}>
                        <Text style={styles.partyLabel}>Người đại diện:</Text>
                        <Text style={[styles.partyValue, styles.bold]}>Ông Nguyễn Thanh Tùng</Text>
                        <Text style={{ width: '15%' }}>Chức vụ:</Text>
                        <Text style={{ width: '25%' }}>Giám đốc</Text>
                    </View>
                </View>

                <Text style={[styles.text, { marginTop: 15 }]}>Hai bên thống nhất nghiệm thu và bàn giao các hạng mục công việc sau:</Text>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableCell, styles.colCenter, { width: '10%' }, styles.bold]}>STT</Text>
                        <Text style={[styles.tableCell, { width: '60%' }, styles.bold]}>Nội dung công việc/Sản phẩm</Text>
                        <Text style={[styles.tableCell, styles.colCenter, { width: '15%' }, styles.bold]}>ĐVT</Text>
                        <Text style={[styles.tableCellLast, styles.colCenter, { width: '15%' }, styles.bold]}>Số lượng</Text>
                    </View>
                    {items.map((item: any, idx: number) => (
                        <View style={styles.tableRow} key={idx} wrap={false}>
                            <Text style={[styles.tableCell, styles.colCenter, { width: '10%' }]}>{idx + 1}</Text>
                            <Text style={[styles.tableCell, { width: '60%' }]}>{item.product_name || item.name}</Text>
                            <Text style={[styles.tableCell, styles.colCenter, { width: '15%' }]}>{item.unit || 'Bộ'}</Text>
                            <Text style={[styles.tableCellLast, styles.colCenter, { width: '15%' }]}>{item.quantity}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ marginTop: 15 }}>
                    <Text style={[styles.bold, { textDecoration: 'underline' }]}>Ý kiến nhận xét:</Text>
                    <Text style={[styles.text, { marginTop: 5 }]}>- Chất lượng sản phẩm: Đạt yêu cầu theo thỏa thuận.</Text>
                    <Text style={styles.text}>- Số lượng: Đầy đủ theo đúng đơn đặt hàng/hợp đồng.</Text>
                </View>

                <Text style={[styles.text, { marginTop: 15 }]}>
                    Biên bản bàn giao và nghiệm thu được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau.
                </Text>

                <View style={styles.signatureSection} wrap={false}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.bold}>Đại diện Bên A</Text>
                        <Text>(Ký và ghi rõ họ tên)</Text>
                        <View style={styles.signatureSpace} />
                        <Text style={styles.signatureName}>{customer.representative || ''}</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.bold}>Đại diện Bên B</Text>
                        <Text>(Ký và ghi rõ họ tên)</Text>
                        <View style={styles.signatureSpace} />
                        <Text style={styles.signatureName}>Ông Nguyễn Thanh Tùng</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default DeliveryMinutesPdfTemplate;
