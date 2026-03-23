/**
 * Đơn đặt hàng - HTML Template
 * Layout chuẩn theo bộ thủ tục Tulie
 */
export const orderTemplate = `
<div style="font-family: Arial, sans-serif; font-size: 10pt; color: #000; max-width: 210mm; margin: 0 auto; padding: 20mm 15mm 20mm 25mm; line-height: 1.5; text-align: justify;">
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
      <td style="width:50%; text-align:center; font-size:10pt; padding:0;">Số: {{order_number}}</td>
      <td style="width:50%; text-align:right; font-style:italic; font-size:10pt; padding:0;">Hà Nội, ngày {{day}} tháng {{month}} năm {{year}}</td>
    </tr>
  </table>

  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 16px 0 20px 0;">ĐƠN ĐẶT HÀNG</p>

  <!-- Bên A + Bên B (cùng 1 bảng) -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:14px; font-size:10pt;" cellpadding="2">
    <colgroup><col style="width:210px"><col style="width:auto"><col style="width:80px"><col style="width:auto"></colgroup>
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 20px 4px 0; vertical-align:top; white-space:nowrap;">Bên đặt hàng (Bên A)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top; text-transform:uppercase;">{{customer_company}}</td>
    </tr>
    <tr><td style="vertical-align:top;">Người đại diện pháp luật:</td><td style="font-weight:bold; vertical-align:top;">{{customer_representative}}</td><td style="vertical-align:top;">Chức vụ:</td><td style="vertical-align:top;">{{customer_position}}</td></tr>
    <tr><td style="vertical-align:top;">Địa chỉ liên hệ:</td><td colspan="3" style="vertical-align:top;">{{customer_address}}</td></tr>
    <tr><td style="vertical-align:top;">Điện thoại:</td><td style="vertical-align:top;">{{customer_phone}}</td><td style="vertical-align:top;">Di động:</td><td style="vertical-align:top;">{{customer_mobile}}</td></tr>
    <tr><td style="vertical-align:top;">Mã số thuế:</td><td style="vertical-align:top;">{{customer_tax_code}}</td><td style="vertical-align:top;">Email:</td><td style="vertical-align:top;">{{customer_email}}</td></tr>
    <tr><td style="vertical-align:top;">Số tài khoản:</td><td style="vertical-align:top;">{{customer_bank_account}}</td><td style="vertical-align:top;">tại</td><td style="vertical-align:top;">{{customer_bank_name}}</td></tr>
    <tr><td colspan="4" style="padding:6px 0;"></td></tr>
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 20px 4px 0; vertical-align:top; white-space:nowrap;">Bên nhận đặt hàng (Bên B)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</td>
    </tr>
    <tr><td style="vertical-align:top;">Địa chỉ liên hệ:</td><td colspan="3" style="vertical-align:top;">Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam</td></tr>
    <tr><td style="vertical-align:top;">Điện thoại:</td><td style="vertical-align:top;"></td><td style="vertical-align:top;">Di động:</td><td style="vertical-align:top;">+84 98 898 4554</td></tr>
    <tr><td style="vertical-align:top;">Mã số thuế:</td><td style="vertical-align:top;">0110163102</td><td style="vertical-align:top;">Email:</td><td style="vertical-align:top;">info@tulie.vn</td></tr>
    <tr><td style="vertical-align:top;">Số tài khoản:</td><td style="vertical-align:top;">86683979</td><td style="vertical-align:top;">tại</td><td style="vertical-align:top;">Ngân hàng Techcombank - CN Hội sở</td></tr>
  </table>

  <!-- Điều 1 -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:6px;">
    <tr><td style="width:30px; font-weight:bold; vertical-align:top; padding:6px 0;">1</td><td style="font-weight:bold; vertical-align:top; padding:6px 0;">Điều 1: Nội dung và giá trị đơn đặt hàng</td></tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr><td style="width:30px; vertical-align:top; padding:2px 0;">1.1</td><td style="vertical-align:top; padding:2px 0;">Bên A cam kết đặt hàng các sản phẩm, dịch vụ như sau:</td></tr>
  </table>

  <!-- Bảng hàng hóa -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:12px;">
    <tr>
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold; width:40px;">STT</th>
      <th style="border:1px solid #000; padding:5px; text-align:left; font-weight:bold;" colspan="3">Tên hàng hoá, dịch vụ</th>
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold; width:80px;">Đơn vị tính</th>
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold; width:60px;">Số lượng</th>
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold; width:90px;">Đơn giá</th>
      <th style="border:1px solid #000; padding:5px; text-align:center; font-weight:bold; width:100px;">Thành tiền</th>
    </tr>
    {{contract_items_table}}
    <tr>
      <td style="border:1px solid #000; padding:5px;"></td>
      <td style="border:1px solid #000; padding:5px;" colspan="6"><strong>Cộng tiền hàng</strong></td>
      <td style="border:1px solid #000; padding:5px; text-align:right;">{{subtotal}}</td>
    </tr>
    {{discount_row_html}}
    <tr>
      <td style="border:1px solid #000; padding:5px;"></td>
      <td style="border:1px solid #000; padding:5px;">Thuế suất GTGT</td>
      <td style="border:1px solid #000; padding:5px; text-align:center;">{{vat_rate}}</td>
      <td style="border:1px solid #000; padding:5px;" colspan="4"></td>
      <td style="border:1px solid #000; padding:5px; text-align:right;">{{vat_amount}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:5px;"></td>
      <td style="border:1px solid #000; padding:5px;" colspan="6"><strong>Tổng tiền thanh toán</strong></td>
      <td style="border:1px solid #000; padding:5px; text-align:right; font-weight:bold;">{{total_amount_number}}</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:5px;"></td>
      <td style="border:1px solid #000; padding:5px;" colspan="2">Số tiền viết bằng chữ</td>
      <td style="border:1px solid #000; padding:5px;" colspan="5">{{amount_in_words}}</td>
    </tr>
  </table>

  <!-- Điều 2 -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr><td style="width:30px; font-weight:bold; vertical-align:top;">2</td><td style="font-weight:bold; vertical-align:top;">Điều 2: Giá trị hợp đồng và phương thức thanh toán</td></tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">2.1.</td><td style="vertical-align:top; padding:2px 0;">Tổng giá trị của hợp đồng này là:</td></tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:4px; margin-left:50px;">
    <tr><td style="width:80px;">Bằng số:</td><td style="font-weight:bold;">{{total_amount_number}}</td></tr>
    <tr><td>Bằng chữ:</td><td>{{amount_in_words}}</td></tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">2.2.</td><td style="vertical-align:top; padding:2px 0;">Hình thức thanh toán:</td></tr>
    <tr><td></td><td style="vertical-align:top; padding:2px 0;">{{payment_terms}}</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">2.3.</td><td style="vertical-align:top; padding:2px 0;">Phương thức thanh toán:</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">2.3.1.</td><td style="vertical-align:top; padding:2px 0;">Bên A có quyền thanh toán bằng tiền mặt, chuyển khoản.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">2.3.2.</td><td style="vertical-align:top; padding:2px 0;">Thông tin chuyển khoản:</td></tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin: 4px 0 10px 50px;">
    <tr><td style="width:200px; padding:2px 0;">Tên tài khoản thụ hưởng:</td><td style="font-weight:bold; padding:2px 0;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</td></tr>
    <tr><td style="padding:2px 0;">Số tài khoản:</td><td style="font-weight:bold; padding:2px 0;">86683979</td></tr>
    <tr><td style="padding:2px 0;">Ngân hàng:</td><td style="font-weight:bold; padding:2px 0;">TMCP Kỹ Thương Việt Nam (Techcombank)</td></tr>
    <tr><td style="padding:2px 0;">Chi nhánh:</td><td style="font-weight:bold; padding:2px 0;">Trung tâm giao dịch Hội Sở</td></tr>
  </table>

  <!-- Điều 3 -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr><td style="width:30px; font-weight:bold; vertical-align:top;">3</td><td style="font-weight:bold; vertical-align:top;">Điều 3: Thời gian và địa điểm giao hàng</td></tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.1.</td><td style="vertical-align:top; padding:2px 0;">Thời gian giao hàng: {{delivery_time}}</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.2.</td><td style="vertical-align:top; padding:2px 0;">Địa điểm giao hàng: {{delivery_address}}</td></tr>
  </table>

  <!-- Điều 4 -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr><td style="width:30px; font-weight:bold; vertical-align:top;">4</td><td style="font-weight:bold; vertical-align:top;">Điều 4: Trách nhiệm các Bên</td></tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">4.1.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Các bên cam kết thực hiện đầy đủ các điều khoản đã ghi trong đơn đặt hàng.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">4.2.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B cam kết đảm bảo chất lượng và thời gian giao hàng theo yêu cầu của bên A.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">4.3.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên A cam kết đảm bảo thanh toán đúng giá trị hợp đồng và đúng thời hạn tại điều 2 của đơn đặt hàng này.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">4.4.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Đơn đặt hàng này được lập thành hai (02) bản có giá trị pháp lý như nhau, Bên A giữ một (01) bản, Bên B giữ một (01) bản để làm cơ sở thực hiện.</td></tr>
  </table>

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
