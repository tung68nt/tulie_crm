export const quotationTemplate = `
<div style="font-family: 'Inter', -apple-system, sans-serif; font-size: 11pt; line-height: 1.6; color: #000; max-width: 800px; margin: 0 auto; padding: 20mm 15mm 20mm 25mm; text-align: justify;">
    
    <!-- HEADER -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr>
            <td style="width: 45%; text-align: left; vertical-align: top;">
                <p style="margin: 0; font-weight: 800; font-size: 10pt; text-transform: uppercase; border-bottom: 2px solid #000; display: inline-block; padding-bottom: 2px;">CÔNG TY TNHH TULIE AGENCY</p>
                <div style="font-size: 8pt; margin-top: 8px; font-weight: 500;">
                    <p style="margin: 2px 0;">MST: 0110163102</p>
                    <p style="margin: 2px 0;">Hotline: 098.898.4554</p>
                    <p style="margin: 2px 0;">Email: info@tulie.vn | Website: tulie.vn</p>
                </div>
            </td>
            <td style="width: 55%; text-align: right; vertical-align: top;">
                <p style="margin: 0; font-weight: 800; font-size: 9pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p style="margin: 2px 0; font-weight: 700; font-size: 9pt; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</p>
                <p style="margin: 20px 0 0 0; font-size: 8.5pt; font-style: italic; color: #666;">Hà Nội, ngày {{day}} tháng {{month}} năm {{year}}</p>
            </td>
        </tr>
    </table>

    <!-- TITLE -->
    <div style="text-align: center; margin-bottom: 40px; border-top: 1px solid #eee; pt-20px;">
        <h1 style="font-size: 18pt; font-weight: 900; text-transform: uppercase; margin: 20px 0 5px 0; letter-spacing: -0.5px;">Báo giá / Đơn đặt hàng</h1>
        <p style="font-size: 10pt; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 2px;">QUOTATION & PURCHASE ORDER</p>
        <p style="font-size: 9pt; font-weight: 800; margin-top: 10px;">Số: {{quotation_number}}</p>
    </div>

    <!-- CÁC BÊN -->
    <div style="margin-bottom: 25px;">
        <h3 style="font-size: 11pt; font-weight: 800; text-transform: uppercase; border-left: 4px solid #000; padding-left: 10px; margin-bottom: 15px;">Bên đặt hàng (Client): {{customer_company}}</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 10pt; margin-left: 14px;">
            <tr><td style="width: 25%; padding: 4px 0;">Người đại diện:</td><td style="width: 45%; padding: 4px 0;"><strong>{{customer_representative}}</strong></td><td style="width: 10%; padding: 4px 0;">Chức vụ:</td><td style="padding: 4px 0;">{{customer_position}}</td></tr>
            <tr><td style="padding: 4px 0;">Địa chỉ:</td><td colspan="3" style="padding: 4px 0;">{{customer_address}}</td></tr>
            <tr><td style="padding: 4px 0;">Điện thoại:</td><td style="padding: 4px 0;">{{customer_phone}}</td><td style="padding: 4px 0;">Email:</td><td style="padding: 4px 0;">{{customer_email}}</td></tr>
            <tr><td style="padding: 4px 0;">Mã số thuế:</td><td colspan="3" style="padding: 4px 0;">{{customer_tax_code}}</td></tr>
        </table>
    </div>

    <div style="margin-bottom: 35px;">
        <h3 style="font-size: 11pt; font-weight: 800; text-transform: uppercase; border-left: 4px solid #000; padding-left: 10px; margin-bottom: 15px;">Bên nhận đặt hàng (Provider): TULIE AGENCY</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 10pt; margin-left: 14px;">
            <tr><td style="width: 25%; padding: 4px 0;">Người đại diện:</td><td style="width: 45%; padding: 4px 0;"><strong>Ông Nguyễn Thanh Tùng</strong></td><td style="width: 10%; padding: 4px 0;">Chức vụ:</td><td style="padding: 4px 0;">Giám đốc</td></tr>
            <tr><td style="padding: 4px 0;">Địa chỉ:</td><td colspan="3" style="padding: 4px 0;">Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Q. Hà Đông, TP. Hà Nội</td></tr>
            <tr><td style="padding: 4px 0;">MST:</td><td colspan="3" style="padding: 4px 0;">0110163102</td></tr>
        </table>
    </div>

    <!-- ĐIỀU KHOẢN -->
    <h3 style="font-size: 11pt; font-weight: 800; text-transform: uppercase; margin-bottom: 15px;">Điều 1: Nội dung và giá trị đơn đặt hàng</h3>
    <p style="font-size: 10pt; margin-bottom: 15px;">1.1 Bên A cam kết đặt hàng các sản phẩm, dịch vụ như sau:</p>
    
    <table style="width:100%; border-collapse:collapse; margin-bottom:12px; font-size:8.5pt;">
      <tr style="background:#f5f5f5;">
        <th style="border:1px solid #000; padding:4px; text-align:center; font-weight:bold; width:25px;">STT</th>
        <th style="border:1px solid #000; padding:4px; text-align:center; font-weight:bold;">Tên hàng hoá, dịch vụ</th>
        <th style="border:1px solid #000; padding:4px; text-align:center; font-weight:bold; width:40px;">ĐVT</th>
        <th style="border:1px solid #000; padding:4px; text-align:center; font-weight:bold; width:25px;">SL</th>
        <th style="border:1px solid #000; padding:4px; text-align:center; font-weight:bold; width:70px;">Đơn giá</th>
        <th style="border:1px solid #000; padding:4px; text-align:center; font-weight:bold; width:60px;">Giảm giá</th>
        <th style="border:1px solid #000; padding:4px; text-align:center; font-weight:bold; width:70px;">Thành tiền</th>
        <th style="border:1px solid #000; padding:4px; text-align:center; font-weight:bold; width:55px;">Thuế VAT</th>
        <th style="border:1px solid #000; padding:4px; text-align:center; font-weight:bold; width:70px;">Thành tiền sau thuế</th>
      </tr>
      {{quotation_items_table}}
      <tr style="background:#f5f5f5;">
        <td style="border:1px solid #000; padding:4px;" colspan="6"><strong>Cộng tiền hàng</strong></td>
        <td style="border:1px solid #000; padding:4px; text-align:right; font-weight:bold;">{{subtotal}}</td>
        <td style="border:1px solid #000; padding:4px; text-align:right;">{{vat_total}}</td>
        <td style="border:1px solid #000; padding:4px; text-align:right; font-weight:bold;">{{total_after_vat}}</td>
      </tr>
      {{discount_row_html}}
      <tr style="background:#f5f5f5;">
        <td style="border:1px solid #000; padding:4px;" colspan="8"><strong>Tổng tiền thanh toán</strong></td>
        <td style="border:1px solid #000; padding:4px; text-align:right; font-weight:bold;">{{total_amount_number}}</td>
      </tr>
    </table>

    <h3 style="font-size: 11pt; font-weight: 800; text-transform: uppercase; margin-top: 30px; margin-bottom: 15px;">Điều 2: Giá trị hợp đồng và thanh toán</h3>
    <div style="font-size: 10pt; border: 1px solid #000; padding: 20px; background-color: #fafafa;">
        <p style="margin: 0 0 10px 0;">2.1. Tổng giá trị: <strong>{{total_amount_number}} VND</strong></p>
        <p style="margin: 0 0 15px 0;">(Bằng chữ: <em>{{amount_in_words}} đồng.</em>)</p>
        <p style="margin: 0;">2.2. Phương thức thanh toán: Chuyển khoản qua ngân hàng:</p>
        <div style="margin-top: 10px; padding-left: 15px; border-left: 2px solid #ddd;">
            <p style="margin: 5px 0;">- Chủ tài khoản: <strong>CÔNG TY TNHH TULIE</strong></p>
            <p style="margin: 5px 0;">- Số tài khoản: <strong>0110163102</strong> tại Techcombank</p>
        </div>
    </div>

    <!-- CHỮ KÝ -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 60px; text-align: center; font-size: 10pt; page-break-inside: avoid;">
        <tr>
            <td style="width: 50%;">
                <p style="font-weight: 800; text-transform: uppercase; margin: 0;">Đại diện Bên A</p>
                <p style="margin: 5px 0 80px 0; font-size: 8pt; font-style: italic; color: #666;">(Ký và ghi rõ họ tên)</p>
                <p style="font-weight: 800;">{{customer_representative}}</p>
            </td>
            <td style="width: 50%;">
                <p style="font-weight: 800; text-transform: uppercase; margin: 0;">Đại diện Bên B</p>
                <p style="margin: 5px 0 80px 0; font-size: 8pt; font-style: italic; color: #666;">(Ký và đóng dấu)</p>
                <p style="font-weight: 800;">NGUYỄN THANH TÙNG</p>
            </td>
        </tr>
    </table>
</div>
`
