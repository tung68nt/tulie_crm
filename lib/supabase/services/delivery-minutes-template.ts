/**
 * Biên bản giao nhận - HTML Template
 * Layout chuẩn theo bộ thủ tục Tulie (Google Sheets export)
 */
export const deliveryMinutesTemplate = `
<div style="font-family: Arial, sans-serif; font-size: 10pt; color: #000; max-width: 210mm; margin: 0 auto; padding: 20mm 15mm; line-height: 1.6;">
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
      <td style="width:50%; text-align:center; font-size:10pt;">Số: {{report_number}}</td>
      <td style="width:50%; text-align:right; font-style:italic; font-size:10pt;">Hà Nội, ngày {{day}} tháng {{month}} năm {{year}}</td>
    </tr>
  </table>

  <!-- Title -->
  <div style="text-align:center; font-weight:bold; font-size:18pt; margin: 12px 0;">
    BIÊN BẢN GIAO NHẬN
  </div>

  <!-- Căn cứ -->
  <div style="font-style:italic; margin-bottom: 8px;">
    <p style="margin:2px 0;">- Căn cứ vào hợp đồng kinh tế số {{contract_number}} giữa {{customer_company}} và Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie;</p>
    <p style="margin:2px 0;">- Căn cứ đơn đặt hàng số {{order_number}} ngày {{order_date}} của {{customer_company}}.</p>
  </div>

  <p style="margin:8px 0;">Hôm nay, ngày {{day}} tháng {{month}} năm {{year}}, tại {{customer_company}}, chúng tôi gồm có:</p>

  <!-- Bên A (Nhận hàng) -->
  <div style="margin-bottom: 8px;">
    <div style="font-weight:bold; border-bottom:1px solid #000; padding-bottom:2px; margin-bottom:4px;">Bên nhận hàng (Bên A)</div>
    <table style="width:100%; border-collapse:collapse;">
      <tr><td style="width:160px;">Người đại diện pháp luật:</td><td style="font-weight:bold;">{{customer_representative}}</td><td style="width:80px;">Chức vụ:</td><td>{{customer_position}}</td></tr>
      <tr><td>Địa chỉ liên hệ:</td><td colspan="3">{{customer_address}}</td></tr>
      <tr><td>Điện thoại:</td><td>{{customer_phone}}</td><td>Di động:</td><td>{{customer_mobile}}</td></tr>
      <tr><td>Mã số thuế:</td><td>{{customer_tax_code}}</td><td>Email:</td><td>{{customer_email}}</td></tr>
      <tr><td>Số tài khoản:</td><td>{{customer_bank_account}}</td><td>tại</td><td>{{customer_bank_name}}</td></tr>
    </table>
  </div>

  <!-- Bên B (Giao hàng) -->
  <div style="margin-bottom: 12px;">
    <div style="font-weight:bold; border-bottom:1px solid #000; padding-bottom:2px; margin-bottom:4px;">Bên giao hàng (Bên B) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</div>
    <table style="width:100%; border-collapse:collapse;">
      <tr><td style="width:160px;">Người đại diện pháp luật:</td><td style="font-weight:bold;">Ông Nguyễn Thanh Tùng</td><td style="width:80px;">Chức vụ:</td><td>Giám đốc</td></tr>
      <tr><td>Địa chỉ liên hệ:</td><td colspan="3">Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam</td></tr>
      <tr><td>Điện thoại:</td><td></td><td>Di động:</td><td>+84 98 898 4554</td></tr>
      <tr><td>Mã số thuế:</td><td>0110163102</td><td>Email:</td><td>info@tulie.vn</td></tr>
      <tr><td>Số tài khoản:</td><td>86683979</td><td>tại</td><td>Ngân hàng Techcombank - CN Hội sở</td></tr>
    </table>
  </div>

  <p style="margin:8px 0; font-weight:bold;">Hai bên cùng thống nhất số lượng giao hàng như sau:</p>

  <!-- Bảng giao nhận -->
  <table style="width:100%; border-collapse:collapse; margin-bottom: 12px;">
    <tr>
      <th style="border:1px solid #000; padding:6px; text-align:center; font-weight:bold;">STT</th>
      <th style="border:1px solid #000; padding:6px; text-align:left; font-weight:bold;" colspan="3">Tên hàng hoá, dịch vụ</th>
      <th style="border:1px solid #000; padding:6px; text-align:center; font-weight:bold;">Đơn vị tính</th>
      <th style="border:1px solid #000; padding:6px; text-align:center; font-weight:bold;">Số lượng</th>
      <th style="border:1px solid #000; padding:6px; text-align:center; font-weight:bold;" colspan="2">Ghi chú</th>
    </tr>
    {{delivery_items_table}}
  </table>

  <p style="margin:8px 0;">Bên A xác nhận Bên B đã giao cho Bên A đúng chủng loại và số lượng như trên.</p>
  <p style="margin:8px 0;">Biên bản Giao nhận được lập thành hai (02) bản có giá trị pháp lý như nhau, mỗi Bên giữ một (01) bản.</p>

  <!-- Chữ ký -->
  <table style="width:100%; margin-top: 24px;">
    <tr>
      <td style="width:50%; text-align:center; font-weight:bold; vertical-align:top;">Đại diện Bên A</td>
      <td style="width:50%; text-align:center; font-weight:bold; vertical-align:top;">Đại diện Bên B</td>
    </tr>
    <tr>
      <td style="height:80px;"></td>
      <td style="height:80px;"></td>
    </tr>
  </table>
</div>
`;
