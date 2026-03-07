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
            <td style="width: 60%; text-align: right; font-style: italic;">Hà Nội, ngày {{payment_date}}</td>
        </tr>
    </table>

    <!-- TITLE -->
    <h1 style="text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 20px;">Công văn đề nghị thanh toán công nợ</h1>

    <!-- KÍNH GỬI -->
    <div style="margin-bottom: 20px;">
        <p style="margin: 0; font-weight: bold; font-style: italic; text-decoration: underline; display: inline;">Kính gửi:</p> <span style="font-weight: bold;">{{customer_company}}</span>
    </div>

    <!-- NỘI DUNG -->
    <p style="margin-bottom: 15px;">Thực hiện Hợp đồng dịch vụ số <strong>{{contract_number}}</strong> ký ngày {{contract_date}} giữa {{customer_company}} và Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie về việc cung cấp dịch vụ, chúng tôi đã hoàn thành đầy đủ các hạng mục công việc đã thỏa thuận.</p>

    <p style="margin-bottom: 15px;">Theo điều khoản Thanh toán hợp đồng, Bên sử dụng dịch vụ sẽ thanh toán cho Bên cung cấp dịch vụ giá trị hợp đồng tương ứng với các hạng mục hoàn thành theo đúng tiến độ.</p>

    <p style="margin-bottom: 20px;">Vậy, chúng tôi kính đề nghị quý cơ quan thanh toán giá trị hợp đồng tương đương số tiền: <strong>{{payment_amount}} VNĐ</strong> (Bằng chữ: <em>{{amount_in_words}}</em>) theo đúng quy định trong hợp đồng.</p>

    <h3 style="font-size: 13pt; font-weight: bold; text-decoration: underline;">Thông tin thanh toán:</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr><td style="width: 35%; padding: 3px 0;">- Số tiền cần thanh toán:</td><td style="font-weight: bold;">{{payment_amount}} VNĐ</td></tr>
        <tr><td style="padding: 3px 0;">- Tên tài khoản thụ hưởng:</td><td style="font-weight: bold;">Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie</td></tr>
        <tr><td style="padding: 3px 0;">- Số tài khoản:</td><td style="font-weight: bold;">86683979</td></tr>
        <tr><td style="padding: 3px 0;">- Ngân hàng:</td><td style="font-weight: bold;">TMCP Kỹ Thương Việt Nam (Techcombank)</td></tr>
        <tr><td style="padding: 3px 0;">- Chi nhánh:</td><td style="font-weight: bold;">Trung tâm giao dịch Hội Sở</td></tr>
        <tr><td style="padding: 3px 0;">- Nội dung chuyển khoản:</td><td style="font-weight: bold;">{{transfer_content}}</td></tr>
    </table>

    <p style="margin-bottom: 10px;">Rất mong nhận được sự hợp tác từ quý cơ quan.</p>
    <p style="margin-bottom: 40px; font-weight: bold; font-style: italic;">Xin trân trọng cảm ơn!</p>

    <!-- CHỮ KÝ -->
    <table style="width: 100%; border-collapse: collapse; text-align: center; page-break-inside: avoid;">
        <tr>
            <td style="width: 50%;"></td>
            <td style="width: 50%;">
                <p style="font-weight: bold; margin: 0;">Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie</p>
                <p style="margin: 0; font-style: italic;">(Ký, ghi rõ họ tên và đóng dấu)</p>
            </td>
        </tr>
        <tr>
            <td style="height: 120px;"></td>
            <td style="height: 120px;"></td>
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
