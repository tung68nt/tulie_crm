/**
 * Đề nghị thanh toán - HTML Template
 * Chuẩn format văn bản hành chính Việt Nam
 * - Font: Times New Roman 13pt (chuẩn TCVN)
 * - Line-height: 1.5 (giãn dòng 1.5)
 * - Text-indent: 1.27cm cho đoạn văn (thụt đầu dòng chuẩn)
 * - Margin: 2cm trái, 2cm phải, 2cm trên, 2cm dưới
 */
export const paymentTemplate = `
<div style="font-family: Arial, sans-serif; font-size: 10pt; color: #000; max-width: 210mm; margin: 0 auto; padding: 15mm 20mm; line-height: 1.5; text-align: justify;">

  <!-- Header: Tên cơ quan / Quốc hiệu tiêu ngữ -->
  <table style="width:100%; border-collapse:collapse; margin-bottom: 4px;">
    <tr>
      <td style="width:45%; text-align:center; font-size:10pt; vertical-align:top; padding:0;">
        <span style="font-weight:bold;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP</span><br>
        <span style="font-weight:bold; text-decoration:underline;">CÔNG NGHỆ TULIE</span>
      </td>
      <td style="width:10%;"></td>
      <td style="width:45%; text-align:center; font-size:10pt; vertical-align:top; padding:0;">
        <span style="font-weight:bold;">CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</span><br>
        <span style="font-weight:bold; text-decoration:underline;">Độc lập - Tự do - Hạnh phúc</span>
      </td>
    </tr>
  </table>

  <!-- Số văn bản / Ngày tháng -->
  <table style="width:100%; border-collapse:collapse; margin: 8px 0 12px 0;">
    <tr>
      <td style="width:45%; text-align:center; font-size:10pt; padding:0;">
        <span style="font-style:italic;">Số: {{payment_number}}</span>
      </td>
      <td style="width:10%;"></td>
      <td style="width:45%; text-align:center; font-style:italic; font-size:10pt; padding:0;">
        <i>Hà Nội, ngày {{day}} tháng {{month}} năm {{year}}</i>
      </td>
    </tr>
  </table>

  <!-- Tiêu đề văn bản -->
  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 20px 0 24px 0; text-transform:uppercase;">
    ĐỀ NGHỊ THANH TOÁN
  </p>

  <!-- Kính gửi -->
  <p style="margin:12px 0; text-indent: 1.27cm;">
    <b>Kính gửi:</b> {{customer_company}}
  </p>

  <!-- Nội dung đề nghị -->
  <p style="margin:6px 0; text-indent: 1.27cm;">
    Căn cứ Hợp đồng kinh tế số <b>{{contract_number}}</b> ký ngày <b>{{contract_date}}</b> giữa <b>{{customer_company}}</b> và <b>Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie</b> về việc <i>{{service_description}}</i>;
  </p>

  <p style="margin:6px 0; text-indent: 1.27cm;">
    Căn cứ Biên bản bàn giao và nghiệm thu ngày {{delivery_date}}, hai bên xác nhận Bên cung cấp dịch vụ đã hoàn thành đầy đủ phạm vi công việc quy định tại Hợp đồng;
  </p>

  <p style="margin:6px 0; text-indent: 1.27cm;">
    Theo điều khoản thanh toán tại Điều 2 của Hợp đồng, Bên sử dụng dịch vụ thanh toán cho Bên cung cấp dịch vụ <b>{{payment_percentage}}</b> giá trị hợp đồng trong vòng 05 (năm) ngày làm việc kể từ ngày ký Biên bản bàn giao và nghiệm thu.
  </p>

  <p style="margin:6px 0; text-indent: 1.27cm;">
    Vậy, chúng tôi kính đề nghị Quý Công ty thanh toán <b>{{payment_percentage}}</b> giá trị hợp đồng, tương đương số tiền:
  </p>

  <p style="margin:6px 0; text-indent: 1.27cm;">
    <b>{{payment_amount}}</b> (Bằng chữ: <i>{{amount_in_words}}</i>)
  </p>

  <!-- Thông tin thanh toán -->
  <p style="margin:16px 0 8px 0; font-weight:bold;">Thông tin chuyển khoản:</p>
  <table style="margin-left: 1.27cm; margin-bottom:16px; border-collapse:collapse; font-size:10pt;">
    <tr>
      <td style="padding:4px 12px 4px 0; white-space:nowrap;">- Đơn vị thụ hưởng:</td>
      <td style="font-weight:bold; padding:4px 0;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</td>
    </tr>
    <tr>
      <td style="padding:4px 12px 4px 0; white-space:nowrap;">- Số tài khoản:</td>
      <td style="font-weight:bold; padding:4px 0;">86683979</td>
    </tr>
    <tr>
      <td style="padding:4px 12px 4px 0; white-space:nowrap;">- Ngân hàng:</td>
      <td style="font-weight:bold; padding:4px 0;">TMCP Kỹ Thương Việt Nam (Techcombank)</td>
    </tr>
    <tr>
      <td style="padding:4px 12px 4px 0; white-space:nowrap;">- Chi nhánh:</td>
      <td style="font-weight:bold; padding:4px 0;">Trung tâm giao dịch Hội Sở</td>
    </tr>
    <tr>
      <td style="padding:4px 12px 4px 0; white-space:nowrap;">- Số tiền:</td>
      <td style="font-weight:bold; padding:4px 0;">{{payment_amount}}</td>
    </tr>
  </table>

  <!-- Kết thúc -->
  <p style="margin:12px 0 4px 0; text-indent: 1.27cm;">
    Kính mong Quý Công ty sắp xếp thanh toán đúng hạn theo hợp đồng đã ký.
  </p>
  <p style="margin:4px 0 0 0; text-indent: 1.27cm;">Trân trọng cảm ơn./.</p>

  <!-- Ký tên -->
  <table style="width:100%; margin-top: 24px;">
    <tr>
      <td style="width:50%;"></td>
      <td style="width:50%; text-align:center;">
        <p style="font-weight:bold; margin:0; font-size:10pt;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP</p>
        <p style="font-weight:bold; margin:0; font-size:10pt;">CÔNG NGHỆ TULIE</p>
        <p style="font-style:italic; margin:4px 0; font-size:10pt;">(Ký, ghi rõ họ tên, đóng dấu)</p>
        <div style="height:80px;"></div>
      </td>
    </tr>
  </table>

</div>
`;
