/**
 * Đề nghị thanh toán - HTML Template
 * Layout chuẩn theo bộ thủ tục Tulie (Google Sheets export)
 */
export const paymentTemplate = `
<div style="font-family: Arial, sans-serif; font-size: 10pt; color: #000; max-width: 210mm; margin: 0 auto; padding: 20mm 15mm; line-height: 1.8;">
  <!-- Header -->
  <table style="width:100%; border-collapse:collapse; margin-bottom: 4px;">
    <tr>
      <td style="width:50%; text-align:center; font-weight:bold; font-size:10pt; vertical-align:middle;">
        CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP<br>
        <span style="text-decoration:underline;">CÔNG NGHỆ TULIE</span>
      </td>
      <td style="width:50%; text-align:center; font-weight:bold; font-size:10pt; vertical-align:middle;">
        CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM
      </td>
    </tr>
    <tr>
      <td></td>
      <td style="text-align:center; font-weight:bold; text-decoration:underline; font-size:10pt;">
        Độc lập - Tự do - Hạnh phúc
      </td>
    </tr>
  </table>

  <table style="width:100%; border-collapse:collapse; margin-bottom: 8px;">
    <tr>
      <td style="width:50%; text-align:center; font-size:10pt;">Số: {{payment_number}}</td>
      <td style="width:50%; text-align:right; font-style:italic; font-size:10pt;">Hà Nội, ngày {{day}} tháng {{month}} năm {{year}}</td>
    </tr>
  </table>

  <!-- Title -->
  <div style="text-align:center; font-weight:bold; font-size:16pt; margin: 12px 0;">
    CÔNG VĂN ĐỀ NGHỊ THANH TOÁN CÔNG NỢ
  </div>

  <!-- Kính gửi -->
  <p style="margin:8px 0; font-weight:bold;">Kính gửi: {{customer_company}}</p>

  <!-- Nội dung -->
  <p style="margin:8px 0; text-align:justify;">
    Thực hiện Hợp đồng kinh tế số {{contract_number}} ký ngày {{contract_date}} giữa {{customer_company}} và Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie về việc {{service_description}}, chúng tôi đã bàn giao đầy đủ hàng hoá và giấy tờ quy định tại Điều 1 của hợp đồng. Đại diện hai bên đã ký Biên bản bàn giao và nghiệm thu thiết bị ngày {{delivery_date}}.
  </p>

  <p style="margin:8px 0; text-align:justify;">
    Theo điều khoản Thanh toán hợp đồng (Điều 2), Bên sử dụng dịch vụ sẽ thanh toán cho Bên cung cấp dịch vụ {{payment_percentage}} giá trị hợp đồng trong vòng năm (05) ngày kể từ ngày ký Biên bản bàn giao và nghiệm thu hàng hóa.
  </p>

  <p style="margin:8px 0; text-align:justify;">
    Vậy, chúng tôi kính đề nghị quý cơ quan thanh toán {{payment_percentage}} giá trị hợp đồng tương đương số tiền: {{payment_amount}} (Bằng chữ: {{amount_in_words}}) theo đúng quy định trong hợp đồng.
  </p>

  <!-- Thông tin thanh toán -->
  <p style="margin:12px 0 4px 0; font-weight:bold;">Thông tin thanh toán:</p>
  <table style="margin-left:8px; margin-bottom:12px;">
    <tr><td style="padding:2px 8px;">- Số tiền cần thanh toán:</td><td style="font-weight:bold;">{{payment_amount}}</td></tr>
    <tr><td style="padding:2px 8px;">- Tên tài khoản thụ hưởng:</td><td style="font-weight:bold;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</td></tr>
    <tr><td style="padding:2px 8px;">- Số tài khoản:</td><td style="font-weight:bold;">86683979</td></tr>
    <tr><td style="padding:2px 8px;">- Ngân hàng</td><td style="font-weight:bold;">TMCP Kỹ Thương Việt Nam (Techcombank)</td></tr>
    <tr><td style="padding:2px 8px;">- Chi nhánh:</td><td style="font-weight:bold;">Trung tâm giao dịch Hội Sở</td></tr>
  </table>

  <p style="margin:12px 0;">Rất mong nhận được sự hợp tác từ quý cơ quan.</p>
  <p style="margin:4px 0; font-weight:bold;">Xin trân trọng cảm ơn!</p>

  <!-- Chữ ký -->
  <div style="text-align:right; margin-top: 24px;">
    <p style="font-weight:bold; margin:4px 0;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</p>
    <div style="height:80px;"></div>
  </div>
</div>
`;
