/**
 * Đơn đặt hàng - HTML Template
 * Layout chuẩn theo bộ thủ tục Tulie (Google Sheets export)
 */
export const orderTemplate = `
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
      <td style="width:50%; text-align:center; font-size:10pt;">Số: {{order_number}}</td>
      <td style="width:50%; text-align:right; font-style:italic; font-size:10pt;">Hà Nội, ngày {{day}} tháng {{month}} năm {{year}}</td>
    </tr>
  </table>

  <!-- Title -->
  <div style="text-align:center; font-weight:bold; font-size:18pt; margin: 12px 0;">
    ĐƠN ĐẶT HÀNG
  </div>

  <!-- Bên A -->
  <div style="margin-bottom: 8px;">
    <div style="font-weight:bold; border-bottom:1px solid #000; padding-bottom:2px; margin-bottom:4px;">Bên đặt hàng (Bên A)</div>
    <table style="width:100%; border-collapse:collapse;">
      <tr><td style="width:160px;">Người đại diện pháp luật:</td><td style="font-weight:bold;">{{customer_representative}}</td><td style="width:80px;">Chức vụ:</td><td>{{customer_position}}</td></tr>
      <tr><td>Địa chỉ liên hệ:</td><td colspan="3">{{customer_address}}</td></tr>
      <tr><td>Điện thoại:</td><td>{{customer_phone}}</td><td>Di động:</td><td>{{customer_mobile}}</td></tr>
      <tr><td>Mã số thuế:</td><td>{{customer_tax_code}}</td><td>Email:</td><td>{{customer_email}}</td></tr>
      <tr><td>Số tài khoản:</td><td>{{customer_bank_account}}</td><td>tại</td><td>{{customer_bank_name}}</td></tr>
    </table>
  </div>

  <!-- Bên B -->
  <div style="margin-bottom: 12px;">
    <div style="font-weight:bold; border-bottom:1px solid #000; padding-bottom:2px; margin-bottom:4px;">Bên nhận đặt hàng (Bên B) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</div>
    <table style="width:100%; border-collapse:collapse;">
      <tr><td style="width:160px;">Người đại diện pháp luật:</td><td style="font-weight:bold;">Ông Nguyễn Thanh Tùng</td><td style="width:80px;">Chức vụ:</td><td>Giám đốc</td></tr>
      <tr><td>Địa chỉ liên hệ:</td><td colspan="3">Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam</td></tr>
      <tr><td>Điện thoại:</td><td></td><td>Di động:</td><td>+84 98 898 4554</td></tr>
      <tr><td>Mã số thuế:</td><td>0110163102</td><td>Email:</td><td>info@tulie.vn</td></tr>
      <tr><td>Số tài khoản:</td><td>86683979</td><td>tại</td><td>Ngân hàng Techcombank - CN Hội sở</td></tr>
    </table>
  </div>

  <!-- Điều 1 -->
  <div style="margin-bottom: 8px;">
    <p style="font-weight:bold; margin:4px 0;"><span style="margin-right:8px;">1</span> Điều 1: Nội dung và giá trị đơn đặt hàng</p>
    <p style="margin:2px 0; border-bottom:1px solid #000; padding-bottom:4px;">
      <span style="margin-right:8px;">1.1</span> Bên A cam kết đặt hàng các sản phẩm, dịch vụ như sau:
    </p>
  </div>

  <!-- Bảng hàng hóa -->
  <table style="width:100%; border-collapse:collapse; margin-bottom: 8px;">
    <tr>
      <th style="border:1px solid #000; padding:6px; text-align:center; font-weight:bold;">STT</th>
      <th style="border:1px solid #000; padding:6px; text-align:left; font-weight:bold;" colspan="3">Tên hàng hoá, dịch vụ</th>
      <th style="border:1px solid #000; padding:6px; text-align:center; font-weight:bold;">Đơn vị tính</th>
      <th style="border:1px solid #000; padding:6px; text-align:center; font-weight:bold;">Số lượng</th>
      <th style="border:1px solid #000; padding:6px; text-align:center; font-weight:bold;">Đơn giá</th>
      <th style="border:1px solid #000; padding:6px; text-align:center; font-weight:bold;">Thành tiền</th>
    </tr>
    {{contract_items_table}}
    <tr>
      <td style="border:1px solid #000; padding:6px;"></td>
      <td style="border:1px solid #000; padding:6px; font-weight:bold;" colspan="6">Cộng tiền hàng</td>
      <td style="border:1px solid #000; padding:6px; text-align:right;">{{subtotal}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;"></td>
      <td style="border:1px solid #000; padding:6px;">Thuế suất GTGT</td>
      <td style="border:1px solid #000; padding:6px; text-align:center;">{{vat_rate}}</td>
      <td style="border:1px solid #000; padding:6px;" colspan="4"></td>
      <td style="border:1px solid #000; padding:6px; text-align:right;">{{vat_amount}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;"></td>
      <td style="border:1px solid #000; padding:6px; font-weight:bold;" colspan="6">Tổng tiền thanh toán</td>
      <td style="border:1px solid #000; padding:6px; text-align:right; font-weight:bold;">{{total_amount_number}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:6px;"></td>
      <td style="border:1px solid #000; padding:6px;" colspan="2">Số tiền viết bằng chữ</td>
      <td style="border:1px solid #000; padding:6px;" colspan="5">{{amount_in_words}}</td>
    </tr>
  </table>

  <!-- Điều 2 -->
  <div style="margin-bottom: 8px;">
    <p style="font-weight:bold; margin:4px 0;"><span style="margin-right:8px;">2</span> Điều 2: Giá trị hợp đồng và phương thức thanh toán</p>
    <p style="margin:2px 0;">2.1. Tổng giá trị của hợp đồng này là:</p>
    <p style="margin:2px 0;">&nbsp;&nbsp;&nbsp;&nbsp;Bằng số: <strong>{{total_amount_number}}</strong></p>
    <p style="margin:2px 0;">&nbsp;&nbsp;&nbsp;&nbsp;Bằng chữ: {{amount_in_words}}</p>
    <p style="margin:2px 0;">2.2. Hình thức thanh toán:</p>
    <p style="margin:2px 0;">{{payment_terms}}</p>
    <p style="margin:2px 0;">2.3. Phương thức thanh toán:</p>
    <p style="margin:2px 0;">2.3.1. Bên A có quyền thanh toán bằng tiền mặt, chuyển khoản.</p>
    <p style="margin:2px 0;">2.3.2. Thông tin chuyển khoản:</p>
    <table style="margin-left:20px; margin-bottom:8px;">
      <tr><td>Tên tài khoản thụ hưởng:</td><td style="font-weight:bold;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</td></tr>
      <tr><td>Số tài khoản:</td><td style="font-weight:bold;">86683979</td></tr>
      <tr><td>Ngân hàng</td><td style="font-weight:bold;">TMCP Kỹ Thương Việt Nam (Techcombank)</td></tr>
      <tr><td>Chi nhánh:</td><td style="font-weight:bold;">Trung tâm giao dịch Hội Sở</td></tr>
    </table>
  </div>

  <!-- Điều 3 -->
  <div style="margin-bottom: 8px;">
    <p style="font-weight:bold; margin:4px 0;"><span style="margin-right:8px;">3</span> Điều 3: Thời gian và địa điểm giao hàng</p>
    <p style="margin:2px 0;">3.1. Thời gian giao hàng: {{delivery_time}}</p>
    <p style="margin:2px 0;">3.2. Địa điểm giao hàng: {{delivery_address}}</p>
  </div>

  <!-- Điều 4 -->
  <div style="margin-bottom: 8px;">
    <p style="font-weight:bold; margin:4px 0;"><span style="margin-right:8px;">4</span> Điều 4: Trách nhiệm các Bên</p>
    <p style="margin:2px 0;">4.1. Các bên cam kết thực hiện đầy đủ các điều khoản đã ghi trong đơn đặt hàng.</p>
    <p style="margin:2px 0;">4.2. Bên B cam kết đảm bảo chất lượng và thời gian giao hàng theo yêu cầu của bên A.</p>
    <p style="margin:2px 0;">4.3. Bên A cam kết đảm bảo thanh toán đúng giá trị hợp đồng và đúng thời hạn tại điều 2 của đơn đặt hàng này.</p>
    <p style="margin:2px 0;">4.4. Đơn đặt hàng này được lập thành hai (02) bản có giá trị pháp lý như nhau, Bên A giữ một (01) bản, Bên B giữ một (01) bản để làm cơ sở thực hiện.</p>
  </div>

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
