'use client'

import { Project, AcceptanceReport, Customer } from '@/types'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { formatDate, formatCurrency } from '@/lib/utils/format'

// Register Roboto font for better Vietnamese support in PDF
Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
    fontWeight: 'normal',
})

Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
    fontWeight: 'bold',
})

const styles = StyleSheet.create({
    page: {
        padding: 50,
        fontFamily: 'Roboto',
        fontSize: 11,
        lineHeight: 1.5,
    },
    header: {
        marginBottom: 30,
        textAlign: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        textTransform: 'none',
    },
    subTitle: {
        fontSize: 12,
        marginBottom: 20,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
        textDecoration: 'underline',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    label: {
        width: 120,
        fontWeight: 'bold',
    },
    value: {
        flex: 1,
    },
    table: {
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        minHeight: 25,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#f3f4f6',
        fontWeight: 'bold',
    },
    col1: { width: '40%', paddingLeft: 5 },
    col2: { width: '40%', paddingLeft: 5 },
    col3: { width: '20%', textAlign: 'center' },
    footer: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: '45%',
        textAlign: 'center',
    },
    signatureSpace: {
        height: 80,
    },
})

interface AcceptanceReportPDFProps {
    project: Project
    report: AcceptanceReport
    customer: Customer
}

export function AcceptanceReportPDF({ project, report, customer }: AcceptanceReportPDFProps) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>BIÊN BẢN NGHIỆM THU VÀ BÀN GIAO</Text>
                    <Text style={styles.subTitle}>Số: {report.report_number}</Text>
                </View>

                <View style={styles.section}>
                    <Text>Hôm nay, ngày {formatDate(report.created_at || new Date())}, chúng tôi gồm:</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>BÊN A: BÊN GIAO (TULIE AGENCY)</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Đại diện:</Text>
                        <Text style={styles.value}>{project.assigned_user?.full_name || 'Tulie CRM Representative'}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>BÊN B: BÊN NHẬN (KHÁCH HÀNG)</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Công ty:</Text>
                        <Text style={styles.value}>{customer.company_name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Địa chỉ:</Text>
                        <Text style={styles.value}>{customer.address || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>NỘI DUNG NGHIỆM THU</Text>
                    <Text>Hai bên cùng tiến hành nghiệm thu và bàn giao các hạng mục thuộc dự án: {project.title}</Text>

                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={styles.col1}>Hạng mục / Dịch vụ</Text>
                            <Text style={styles.col2}>Thông tin tài nguyên</Text>
                            <Text style={styles.col3}>Trạng thái</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.col1}>Dự án: {project.title}</Text>
                            <Text style={styles.col2}>{project.metadata?.source_link || 'Link Source'}</Text>
                            <Text style={styles.col3}>Hoàn thành</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.col1}>Dữ liệu hình ảnh/Video</Text>
                            <Text style={styles.col2}>{project.metadata?.ai_folder_link || 'AI Folder'}</Text>
                            <Text style={styles.col3}>Bàn giao</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>KẾT LUẬN</Text>
                    <Text>- Bên A đã bàn giao đầy đủ các tài nguyên và hướng dẫn sử dụng cho Bên B.</Text>
                    <Text>- Bên B xác nhận các hạng mục đạt yêu cầu như cam kết trong hợp đồng.</Text>
                    <Text>- Biên bản này làm cơ sở để tiến hành thanh lý hợp đồng và thanh toán đợt cuối.</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.signatureBox}>
                        <Text style={{ fontWeight: 'bold' }}>ĐẠI DIỆN BÊN A</Text>
                        <Text style={{ fontStyle: 'italic', fontSize: 9 }}>(Ký và ghi rõ họ tên)</Text>
                        <View style={styles.signatureSpace} />
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={{ fontWeight: 'bold' }}>ĐẠI DIỆN BÊN B</Text>
                        <Text style={{ fontStyle: 'italic', fontSize: 9 }}>(Ký và ghi rõ họ tên)</Text>
                        <View style={styles.signatureSpace} />
                    </View>
                </View>
            </Page>
        </Document>
    )
}
