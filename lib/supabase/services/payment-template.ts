export const paymentTemplate = `
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
            <td style="width: 40%; text-align: left;">Số: {{payment_number}}</td>
            <td style="width: 60%; text-align: right;">Hà Nội, ngày {{payment_date}}</td>
        </tr>
    </table>

    <!-- TITLE -->
    <h1 style="text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 20px;">CÔNG VĂN ĐỀ NGHỊ THANH TOÁN CÔNG NỢ</h1>

    <!-- KÍNH GỬI -->
    <div style="margin-bottom: 15px;">
        <p style="margin: 0;"><span style="font-weight: bold; text-decoration: underline;">Kính gửi:</span> <strong>{{customer_company}}</strong></p>
    </div>

    <!-- NỘI DUNG -->
    <p style="margin-bottom: 15px;">Thực hiện Hợp đồng kinh tế số <strong>{{contract_number}}</strong> ký ngày {{contract_date}} giữa {{customer_company}} và Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie về việc {{service_description}}, chúng tôi đã bàn giao đầy đủ hàng hoá và giấy tờ quy định tại Điều 1 của hợp đồng. Đại diện hai bên đã ký Biên bản bàn giao và nghiệm thu ngày {{date_day}} tháng {{date_month}} năm {{date_year}}.</p>

    <p style="margin-bottom: 15px;">Theo điều khoản Thanh toán hợp đồng (Điều 2), Bên sử dụng dịch vụ sẽ thanh toán cho Bên cung cấp dịch vụ 100% giá trị hợp đồng trong vòng năm (05) ngày kể từ ngày ký Biên bản bàn giao và nghiệm thu hàng hóa.</p>

    <p style="margin-bottom: 20px;">Vậy, chúng tôi kính đề nghị quý cơ quan thanh toán 100% giá trị hợp đồng tương đương số tiền: <strong>{{payment_amount}} VND</strong> (Bằng chữ: <strong>{{amount_in_words}}</strong>) theo đúng quy định trong hợp đồng.</p>

    <p style="margin-bottom: 10px; font-weight: bold;">Thông tin thanh toán:</p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr><td style="width: 35%; padding: 2px 0;">- Số tiền cần thanh toán:</td><td style="font-weight: bold;">{{payment_amount}}</td></tr>
        <tr><td style="padding: 2px 0;">- Tên tài khoản thụ hưởng:</td><td style="font-weight: bold;">Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie</td></tr>
        <tr><td style="padding: 3px 0;">- Số tài khoản:</td><td style="font-weight: bold;">86683979</td></tr>
        <tr><td style="padding: 3px 0;">- Ngân hàng:</td><td style="font-weight: bold;">TMCP Kỹ Thương Việt Nam (Techcombank)</td></tr>
        <tr><td style="padding: 3px 0;">- Chi nhánh:</td><td style="font-weight: bold;">Trung tâm giao dịch Hội Sở</td></tr>
    </table>

    <p style="margin-bottom: 10px;">Rất mong nhận được sự hợp tác từ quý cơ quan.</p>
    <p style="margin-bottom: 40px;">Xin trân trọng cảm ơn!</p>

    <!-- CHỮ KÝ -->
    <table style="width: 100%; border-collapse: collapse; text-align: center; page-break-inside: avoid;">
        <tr>
            <td style="width: 40%;"></td>
            <td style="width: 60%;">
                <p style="font-weight: bold; margin: 0;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</p>
                <p style="margin: 0; font-size: 10pt;">(Ký, ghi rõ họ tên và đóng dấu)</p>
            </td>
        </tr>
        <tr>
            <td style="height: 100px;"></td>
            <td style="height: 100px;"></td>
        </tr>
        <tr>
            <td></td>
            <td>
                <p style="font-weight: bold; margin: 0;">Ông Nguyễn Thanh Tùng</p>
            </td>
        </tr>
    </table>

</div>
`
