export const deliveryMinutesTemplate = `
<div style="font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.5; color: #000; max-width: 800px; margin: 0 auto; padding: 40px 20px; text-align: justify;">
    
    <!-- HEADER -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
            <td style="width: 40%; text-align: center; vertical-align: top;">
                <p style="margin: 0; font-weight: bold;">Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie</p>
                <hr style="width: 50%; border: 0.5px solid #000; margin: 5px auto;" />
            </td>
            <td style="width: 60%; text-align: center; vertical-align: top;">
                <p style="margin: 0; font-weight: bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p style="margin: 0; font-weight: bold; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</p>
            </td>
        </tr>
    </table>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr>
            <td style="width: 40%; text-align: left;">Số: {{report_number}}</td>
            <td style="width: 60%; text-align: right;">Hà Nội, ngày {{day}} tháng {{month}} năm {{year}}</td>
        </tr>
    </table>

    <!-- TITLE -->
    <h1 style="text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 20px;">BIÊN BẢN NGHIỆM THU VÀ BÀN GIAO</h1>

    <div style="margin-bottom: 20px;">
        <p>Hôm nay, ngày {{day}} tháng {{month}} năm {{year}}, tại văn phòng khách hàng, chúng tôi gồm:</p>
    </div>

    <!-- CÁC BÊN -->
    <div style="margin-bottom: 20px;">
        <p style="margin: 0; font-weight: bold;">BÊN A (BÊN NHẬN): {{customer_company}}</p>
        <p style="margin: 0;">Người đại diện: <strong>{{customer_representative}}</strong></p>
        <p style="margin: 0;">Địa chỉ: {{customer_address}}</p>
    </div>

    <div style="margin-bottom: 20px;">
        <p style="margin: 0; font-weight: bold;">BÊN B (BÊN GIAO): CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</p>
        <p style="margin: 0;">Người đại diện: <strong>Ông Nguyễn Thanh Tùng</strong></p>
        <p style="margin: 0;">Chức vụ: Giám đốc</p>
    </div>

    <div style="margin-bottom: 20px;">
        <p>Hai bên cùng tiến hành nghiệm thu và bàn giao các nội dung công việc thuộc hợp đồng số: <strong>{{contract_number}}</strong></p>
    </div>

    <div style="margin-bottom: 20px;">
        {{delivery_items_table}}
    </div>

    <div style="margin-bottom: 30px;">
        <p style="font-weight: bold;">Kết luận:</p>
        <p style="margin: 2px 0;">- Các công việc đã được hoàn thành đúng tiến độ và chất lượng yêu cầu.</p>
        <p style="margin: 2px 0;">- Bên A đồng ý nghiệm thu và đưa vào sử dụng các hạng mục trên.</p>
    </div>

    <!-- CHỮ KÝ -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 40px; text-align: center; page-break-inside: avoid;">
        <tr>
            <td style="width: 50%;">
                <p style="font-weight: bold; margin: 0;">ĐẠI DIỆN BÊN A</p>
                <p style="margin: 0; font-size: 10pt;">(Ký, ghi rõ họ tên)</p>
            </td>
            <td style="width: 50%;">
                <p style="font-weight: bold; margin: 0;">ĐẠI DIỆN BÊN B</p>
                <p style="margin: 0; font-size: 10pt;">(Ký, ghi rõ họ tên và đóng dấu)</p>
            </td>
        </tr>
        <tr>
            <td style="height: 120px;"></td>
            <td style="height: 120px;"></td>
        </tr>
        <tr>
            <td>
                <p style="font-weight: bold; margin: 0;">{{customer_representative}}</p>
            </td>
            <td>
                <p style="font-weight: bold; margin: 0;">Nguyễn Thanh Tùng</p>
            </td>
        </tr>
    </table>

</div>
`;
