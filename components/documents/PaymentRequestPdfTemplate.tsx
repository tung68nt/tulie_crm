import React from 'react';
import { Page, Text, View, Document } from '@react-pdf/renderer';
import { docStyles as styles } from './document-styles';
import { formatCurrency } from '@/lib/utils/format';

interface PaymentRequestPdfTemplateProps {
    data: any;
}

const PaymentRequestPdfTemplate: React.FC<PaymentRequestPdfTemplateProps> = ({ data }) => {
    const {
        request_number = '......./ĐNTT-TL',
        contract_number = '................',
        contract_date = '................',
        day = new Date().getDate(),
        month = new Date().getMonth() + 1,
        year = new Date().getFullYear(),
        customer = {},
        payment_amount = 0,
        amount_in_words = '................',
    } = data;

    return (
        <Document title={`De_nghi_thanh_toan_${request_number}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.companyHeader}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP</Text>
                        <Text style={styles.brandName}>CÔNG NGHỆ TULIE</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.nationalTitle}>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
                        <Text style={styles.nationalMotto}>Độc lập - Tự do - Hạnh phúc</Text>
                        <View style={styles.underline} />
                    </View>
                </View>

                <View style={styles.docMeta}>
                    <Text style={styles.docNumber}>Số: {request_number}</Text>
                    <Text style={styles.docDate}>Hà Nội, ngày {day} tháng {month} năm {year}</Text>
                </View>

                <Text style={[styles.title, { fontSize: 14 }]}>CÔNG VĂN ĐỀ NGHỊ THANH TOÁN CÔNG NỢ</Text>

                <View style={{ marginVertical: 20 }}>
                    <Text style={[styles.bold, styles.italic]}>Kính gửi: <Text style={{ textDecoration: 'none' }}>{customer.company_name || customer.name || '................'}</Text></Text>
                </View>

                <Text style={[styles.text, { textIndent: 20 }]}>
                    Thực hiện Hợp đồng dịch vụ số <Text style={styles.bold}>{contract_number}</Text> ký ngày {contract_date} giữa {customer.company_name || 'Quý công ty'} và Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie về việc cung cấp dịch vụ, chúng tôi đã hoàn thành đầy đủ các hạng mục công việc đã thỏa thuận.
                </Text>

                <Text style={[styles.text, { marginTop: 10 }]}>
                    Theo điều khoản Thanh toán hợp đồng, Bên sử dụng dịch vụ sẽ thanh toán cho Bên cung cấp dịch vụ giá trị hợp đồng tương ứng với các hạng mục hoàn thành theo đúng tiến độ.
                </Text>

                <Text style={[styles.text, { marginTop: 10 }]}>
                    Vậy, chúng tôi kính đề nghị quý cơ quan thanh toán giá trị hợp đồng tương đương số tiền: <Text style={styles.bold}>{formatCurrency(payment_amount)}</Text> (Bằng chữ: <Text style={styles.italic}>{amount_in_words}</Text>) theo đúng quy định trong hợp đồng.
                </Text>

                <View style={{ marginTop: 20 }}>
                    <Text style={[styles.bold, { textDecoration: 'underline' }]}>Thông tin thanh toán:</Text>
                    <View style={{ marginTop: 5, paddingLeft: 10 }}>
                        <Text style={styles.text}>- Số tiền cần thanh toán: <Text style={styles.bold}>{formatCurrency(payment_amount)}</Text></Text>
                        <Text style={styles.text}>- Tên tài khoản thụ hưởng: <Text style={styles.bold}>Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie</Text></Text>
                        <Text style={styles.text}>- Số tài khoản: <Text style={styles.bold}>86683979</Text></Text>
                        <Text style={styles.text}>- Ngân hàng: <Text style={styles.bold}>TMCP Kỹ Thương Việt Nam (Techcombank)</Text></Text>
                        <Text style={styles.text}>- Chi nhánh: <Text style={styles.bold}>Trung tâm giao dịch Hội Sở</Text></Text>
                        <Text style={styles.text}>- Nội dung chuyển khoản: <Text style={styles.bold}>Thanh toán HĐ {contract_number}</Text></Text>
                    </View>
                </View>

                <Text style={[styles.text, { marginTop: 20 }]}>Rất mong nhận được sự hợp tác từ quý cơ quan.</Text>
                <Text style={[styles.bold, styles.italic, { marginTop: 5 }]}>Xin trân trọng cảm ơn!</Text>

                <View style={[styles.signatureSection, { justifyContent: 'flex-end' }]} wrap={false}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.bold}>CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP</Text>
                        <Text style={styles.bold}>CÔNG NGHỆ TULIE</Text>
                        <Text style={styles.italic}>(Ký và đóng dấu)</Text>
                        <View style={styles.signatureSpace} />
                        <Text style={styles.signatureName}>Ông Nguyễn Thanh Tùng</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default PaymentRequestPdfTemplate;
