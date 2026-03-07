export const quotationTemplate = `
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
            <td style="width: 40%; text-align: left;">Số: {{quotation_number}}</td>
            <td style="width: 60%; text-align: right; font-style: italic;">Hà Nội, ngày {{quotation_date}}</td>
        </tr>
    </table>

    <!-- TITLE -->
    <h1 style="text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 20px;">Báo giá / Đơn đặt hàng</h1>

    <!-- CÁC BÊN -->
    <h3 style="font-size: 13pt; font-weight: bold;">Bên đặt hàng (Bên A): {{customer_company}}</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <tr><td style="width: 25%;">Người đại diện pháp luật:</td><td style="width: 45%;"><strong>{{customer_representative}}</strong></td><td style="width: 10%;">Chức vụ:</td><td>{{customer_position}}</td></tr>
        <tr><td>Địa chỉ liên hệ:</td><td colspan="3">{{customer_address}}</td></tr>
        <tr><td>Điện thoại:</td><td>{{customer_phone}}</td><td>Email:</td><td>{{customer_email}}</td></tr>
        <tr><td>Mã số thuế:</td><td colspan="3">{{customer_tax_code}}</td></tr>
    </table>

    <h3 style="font-size: 13pt; font-weight: bold;">Bên nhận đặt hàng (Bên B): Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr><td style="width: 25%;">Người đại diện pháp luật:</td><td style="width: 45%;"><strong>Ông Nguyễn Thanh Tùng</strong></td><td style="width: 10%;">Chức vụ:</td><td>Giám đốc</td></tr>
        <tr><td>Địa chỉ liên hệ:</td><td colspan="3">Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam</td></tr>
        <tr><td>Điện thoại:</td><td>+84 98 898 4554</td><td>Email:</td><td>info@tulie.vn</td></tr>
        <tr><td>Mã số thuế:</td><td colspan="3">0110163102</td></tr>
        <tr><td>Số tài khoản:</td><td>86683979</td><td colspan="2">tại TMCP Kỹ Thương Việt Nam (Techcombank) - Chi nhánh Trung tâm giao dịch Hội Sở</td></tr>
    </table>

    <!-- ĐIỀU KHOẢN -->
    <h3 style="font-size: 13pt; font-weight: bold;">Điều 1: Nội dung và giá trị đơn đặt hàng</h3>
    <p style="margin-top: 5px;">1.1 Bên A cam kết đặt hàng các sản phẩm, dịch vụ như sau:</p>
    
    {{quotation_items_table}}

    <h3 style="font-size: 13pt; font-weight: bold; margin-top: 20px;">Điều 2: Giá trị hợp đồng và phương thức thanh toán</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
            <td style="width: 5%; vertical-align: top;">2.1.</td>
            <td>
                Tổng giá trị thanh toán:<br/>
                Bằng số: <strong>{{total_amount_number}} VNĐ</strong><br/>
                Bằng chữ: <em>{{amount_in_words}}</em>
            </td>
        </tr>
        <tr>
            <td style="vertical-align: top;">2.2.</td>
            <td>Bên A thanh toán giá trị đơn hàng cho Bên B theo tiến độ sau:<br/> {{payment_schedule}}</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">2.3.</td>
            <td>Phương thức thanh toán: Bằng tiền mặt hoặc chuyển khoản vào tài khoản của Bên B như thông tin đã nêu ở phần đầu.</td>
        </tr>
    </table>

    <h3 style="font-size: 13pt; font-weight: bold;">Điều 3: Thời gian và địa điểm giao hàng</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
            <td style="width: 5%; vertical-align: top;">3.1.</td>
            <td><strong>Thời gian giao hàng:</strong> Thời gian thực hiện dự kiến theo kế hoạch đã thống nhất giữa hai bên.</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">3.2.</td>
            <td><strong>Địa điểm giao hàng:</strong> {{customer_address}} hoặc theo thỏa thuận khác.</td>
        </tr>
    </table>

    <h3 style="font-size: 13pt; font-weight: bold;">Điều 4: Trách nhiệm các Bên</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
            <td style="width: 5%; vertical-align: top;">4.1.</td>
            <td>Các bên cam kết thực hiện đầy đủ các điều khoản đã ghi trong đơn đặt hàng.</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">4.2.</td>
            <td>Bên B cam kết đảm bảo chất lượng và thời gian giao hàng theo yêu cầu của Bên A.</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">4.3.</td>
            <td>Bên A cam kết đảm bảo thanh toán đúng giá trị theo tiến độ ở điều 2.</td>
        </tr>
    </table>

    <!-- CHỮ KÝ -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 40px; text-align: center; page-break-inside: avoid;">
        <tr>
            <td style="width: 50%;">
                <p style="font-weight: bold; margin: 0;">Đại diện Bên A</p>
                <p style="margin: 0;">(Ký, ghi rõ họ tên và đóng dấu)</p>
            </td>
            <td style="width: 50%;">
                <p style="font-weight: bold; margin: 0;">Đại diện Bên B</p>
                <p style="margin: 0;">(Ký, ghi rõ họ tên và đóng dấu)</p>
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
                <p style="font-weight: bold; margin: 0;">Ông Nguyễn Thanh Tùng</p>
            </td>
        </tr>
    </table>

</div>
`
