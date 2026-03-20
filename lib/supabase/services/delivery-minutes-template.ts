/**
 * Biên bản giao nhận - HTML Template
 * Layout chuẩn theo bộ thủ tục Tulie
 */
export const deliveryMinutesTemplate = `
<div style="font-family: Arial, sans-serif; font-size: 10pt; color: #000; max-width: 210mm; margin: 0 auto; padding: 15mm 20mm; line-height: 1.5; text-align: justify;">
  <!-- Header -->
  <table style="width:100%; border-collapse:collapse; margin-bottom: 0;">
    <tr>
      <td style="width:50%; text-align:center; font-weight:bold; font-size:10pt; vertical-align:top; padding:0;">
        CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP<br>
        <span style="text-decoration:underline;">CÔNG NGHỆ TULIE</span>
      </td>
      <td style="width:50%; text-align:center; font-weight:bold; font-size:10pt; vertical-align:top; padding:0;">
        CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>
        <span style="font-weight:bold; text-decoration:underline;">Độc lập - Tự do - Hạnh phúc</span>
      </td>
    </tr>
  </table>

  <table style="width:100%; border-collapse:collapse; margin: 6px 0 4px 0;">
    <tr>
      <td style="width:50%; text-align:center; font-size:10pt; padding:0;">Số: {{report_number}}</td>
      <td style="width:50%; text-align:right; font-style:italic; font-size:10pt; padding:0;">Hà Nội, ngày {{day}} tháng {{month}} năm {{year}}</td>
    </tr>
  </table>

  <p style="text-align:center; font-weight:bold; font-size:18pt; margin: 16px 0 20px 0;">BIÊN BẢN GIAO NHẬN</p>

  <!-- Căn cứ -->
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ vào hợp đồng kinh tế số {{contract_number}} giữa {{customer_company}} và Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie;</p>
  <p style="font-style:italic; margin: 0 0 10px 0; text-align:justify;">- Căn cứ đơn đặt hàng số {{order_number}} ngày {{order_date}} của {{customer_company}}.</p>

  <p style="margin:10px 0;">Hôm nay, ngày {{day}} tháng {{month}} năm {{year}}, tại {{customer_company}}, chúng tôi gồm có:</p>

  <!-- Bên A -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:10px; font-size:10pt;" cellpadding="2">
    <colgroup>
      <col style="width:25%">
      <col style="width:32%">
      <col style="width:13%">
      <col style="width:30%">
    </colgroup>
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 0;">Bên nhận hàng (Bên A)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0;">{{customer_company}}</td>
    </tr>
    <tr><td style="white-space:nowrap; padding-right:8px;">Người đại diện pháp luật:</td><td style="font-weight:bold; padding-right:16px;">{{customer_representative}}</td><td style="white-space:nowrap; padding-right:8px;">Chức vụ:</td><td style="">{{customer_position}}</td></tr>
    <tr><td>Địa chỉ liên hệ:</td><td colspan="3">{{customer_address}}</td></tr>
    <tr><td>Điện thoại:</td><td>{{customer_phone}}</td><td>Di động:</td><td>{{customer_mobile}}</td></tr>
    <tr><td>Mã số thuế:</td><td>{{customer_tax_code}}</td><td>Email:</td><td>{{customer_email}}</td></tr>
    <tr><td style="white-space:nowrap; vertical-align:top;">Số tài khoản:</td><td style="vertical-align:top;">{{customer_bank_account}}</td><td style="white-space:nowrap; vertical-align:top;">tại</td><td style="vertical-align:top;">{{customer_bank_name}}</td></tr>
  </table>

  <!-- Bên B -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:14px; font-size:10pt;" cellpadding="2">
    <colgroup>
      <col style="width:25%">
      <col style="width:32%">
      <col style="width:13%">
      <col style="width:30%">
    </colgroup>
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 0;">Bên giao hàng (Bên B)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</td>
    </tr>
    <tr><td>Địa chỉ liên hệ:</td><td colspan="3">Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam</td></tr>
    <tr><td>Điện thoại:</td><td></td><td>Di động:</td><td>+84 98 898 4554</td></tr>
    <tr><td>Mã số thuế:</td><td>0110163102</td><td>Email:</td><td>info@tulie.vn</td></tr>
    <tr><td style="white-space:nowrap; vertical-align:top;">Số tài khoản:</td><td style="vertical-align:top;">86683979</td><td style="white-space:nowrap; vertical-align:top;">tại</td><td style="vertical-align:top;">Ngân hàng Techcombank - CN Hội sở</td></tr>
  </table>

  <p style="margin:10px 0; font-weight:bold;">Hai bên cùng thống nhất số lượng giao hàng như sau:</p>

  <!-- Bảng giao nhận -->
  <table style="width:100%; border-collapse:collapse; margin-bottom: 14px;">
    <tr>
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold; width:40px;">STT</th>
      <th style="border:1px solid #000; padding:5px; text-align:left; font-weight:bold;" colspan="3">Tên hàng hoá, dịch vụ</th>
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold; width:80px;">Đơn vị tính</th>
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold; width:60px;">Số lượng</th>
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold;" colspan="2">Ghi chú</th>
    </tr>
    {{delivery_items_table}}
  </table>

  <p style="margin:10px 0; text-align:justify;">Bên A xác nhận Bên B đã giao cho Bên A đúng chủng loại và số lượng như trên.</p>
  <p style="margin:10px 0; text-align:justify;">Biên bản Giao nhận được lập thành hai (02) bản có giá trị pháp lý như nhau, mỗi Bên giữ một (01) bản.</p>

  <!-- Chữ ký -->
  <table style="width:100%; margin-top: 30px;">
    <tr>
      <td style="width:50%; text-align:center; font-weight:bold;">Đại diện Bên A</td>
      <td style="width:50%; text-align:center; font-weight:bold;">Đại diện Bên B</td>
    </tr>
    <tr><td style="height:100px;"></td><td style="height:100px;"></td></tr>
  </table>
</div>
`;
