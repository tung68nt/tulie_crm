/**
 * Hợp đồng kinh tế - HTML Template
 * Layout chuẩn theo bộ thủ tục Tulie (Google Sheets export)
 * Biến tự động: {{variable_name}}
 */
export const contractTemplate = `
<div style="font-family: Arial, sans-serif; font-size: 10pt; color: #000; max-width: 210mm; margin: 0 auto; padding: 20mm 15mm 20mm 25mm; line-height: 1.5; text-align: justify;">
  <!-- Header: 2 cột căn thẳng hàng -->
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

  <!-- Số HĐ và ngày -->
  <table style="width:100%; border-collapse:collapse; margin: 6px 0 4px 0;">
    <tr>
      <td style="width:50%; text-align:center; font-size:10pt; padding:0;">Số: {{contract_number}}</td>
      <td style="width:50%; text-align:right; font-style:italic; font-size:10pt; padding:0;">Hà Nội, ngày {{day}} tháng {{month}} năm {{year}}</td>
    </tr>
  </table>

  <!-- Tiêu đề -->
  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 16px 0 20px 0;">HỢP ĐỒNG KINH TẾ</p>

  <!-- Căn cứ pháp luật - IN NGHIÊNG -->
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Bộ luật Dân sự nước Cộng hòa Xã hội Chủ nghĩa Việt Nam số 91/2015/QH13 được Quốc hội thông qua ngày 24/11/2015 có hiệu lực thi hành từ ngày 01/01/2017;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ Luật Thương mại số 36/2005/QH11 của Quốc hội nước Cộng hòa Xã hội Chủ nghĩa Việt Nam thông qua ngày 14/6/2005 và các văn bản hướng dẫn thi hành từ ngày 01/01/2006;</p>
  <p style="font-style:italic; margin: 0 0 3px 0; text-align:justify;">- Căn cứ vào Luật doanh nghiệp số 68/2014/QH13 do quốc hội ban hành ngày 26/11/2014 có hiệu lực thi hành từ ngày 01/07/2015;</p>
  <p style="font-style:italic; margin: 0 0 10px 0; text-align:justify;">- Căn cứ vào khả năng cung cầu của hai bên.</p>

  <!-- ===== BÊN A + BÊN B (cùng 1 bảng để căn thẳng lề) ===== -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:14px; font-size:10pt;" cellpadding="2">
    <colgroup>
      <col style="width:160px">
      <col style="width:auto">
      <col style="width:70px">
      <col style="width:auto">
    </colgroup>

    <!-- BÊN A -->
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 10px 4px 0; vertical-align:top; white-space:nowrap; font-size:9pt;">Bên sử dụng dịch vụ (Bên A)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top; text-transform:uppercase;">{{customer_company}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top; white-space:nowrap;">Người đại diện pháp luật:</td>
      <td style="font-weight:bold; vertical-align:top; white-space:nowrap;">{{customer_representative_title}} {{customer_representative}}</td>
      <td style="vertical-align:top; white-space:nowrap;">Chức vụ:</td>
      <td style="vertical-align:top; white-space:nowrap;">{{customer_position}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Địa chỉ liên hệ:</td>
      <td colspan="3" style="vertical-align:top;">{{customer_address}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Điện thoại:</td>
      <td style="vertical-align:top;">{{customer_phone}}</td>
      <td style="vertical-align:top;">Di động:</td>
      <td style="vertical-align:top;">{{customer_mobile}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Mã số thuế:</td>
      <td style="vertical-align:top;">{{customer_tax_code}}</td>
      <td style="vertical-align:top;">Email:</td>
      <td style="vertical-align:top;">{{customer_email}}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Số tài khoản:</td>
      <td style="vertical-align:top;">{{customer_bank_account}}</td>
      <td style="vertical-align:top;">tại</td>
      <td style="vertical-align:top;">{{customer_bank_name}}</td>
    </tr>

    <!-- Spacer -->
    <tr><td colspan="4" style="padding:6px 0;"></td></tr>

    <!-- BÊN B -->
    <tr style="border-bottom:1px solid #000;">
      <td style="font-weight:bold; padding:4px 10px 4px 0; vertical-align:top; white-space:nowrap; font-size:9pt;">Bên cung cấp dịch vụ (Bên B)</td>
      <td colspan="3" style="font-weight:bold; padding:4px 0; vertical-align:top;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</td>
    </tr>
    <tr>
      <td style="vertical-align:top; white-space:nowrap;">Người đại diện pháp luật:</td>
      <td style="font-weight:bold; vertical-align:top; white-space:nowrap;">Ông Nguyễn Thanh Tùng</td>
      <td style="vertical-align:top; white-space:nowrap;">Chức vụ:</td>
      <td style="vertical-align:top; white-space:nowrap;">Người đại diện</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Địa chỉ liên hệ:</td>
      <td colspan="3" style="vertical-align:top;">Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Điện thoại:</td>
      <td style="vertical-align:top;"></td>
      <td style="vertical-align:top;">Di động:</td>
      <td style="vertical-align:top;">+84 98 898 4554</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Mã số thuế:</td>
      <td style="vertical-align:top;">0110163102</td>
      <td style="vertical-align:top;">Email:</td>
      <td style="vertical-align:top;">info@tulie.vn</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">Số tài khoản:</td>
      <td style="vertical-align:top;">86683979</td>
      <td style="vertical-align:top;">tại</td>
      <td style="vertical-align:top;">Ngân hàng Techcombank - CN Hội sở</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 1 ========== -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:6px;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top; padding:6px 0;">1</td>
      <td style="font-weight:bold; vertical-align:top; padding:6px 0;">Điều 1: Nội dung hợp đồng và giá trị hợp đồng</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Theo đề nghị của Bên A, Bên B thực hiện cung cấp cho Bên A sản phẩm/dịch vụ theo nội dung chi tiết tại <strong>Phụ lục 01</strong> (Bảng báo giá chi tiết) đính kèm hợp đồng này.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Phạm vi công việc, phương pháp triển khai, sản phẩm bàn giao và lộ trình thực hiện được quy định chi tiết tại <strong>Phụ lục 02</strong> (Đề xuất giải pháp) đính kèm hợp đồng này.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Tổng giá trị hợp đồng:</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:12px; margin-left:50px;">
    <tr><td style="width:80px;">Bằng số:</td><td style="font-weight:bold;">{{total_amount_number}} VND</td></tr>
    <tr><td>Bằng chữ:</td><td><em>{{amount_in_words}}</em></td></tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">1.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Các phụ lục đính kèm là bộ phận không tách rời của hợp đồng này và có giá trị pháp lý tương đương.</td>
    </tr>
  </table>

  <!-- ========== ĐIỀU 2 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">2</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 2: Giá trị hợp đồng và phương thức thanh toán</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:4px;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">2.1.</td><td style="vertical-align:top; padding:2px 0;">Tổng giá trị của hợp đồng này là:</td></tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin-bottom:4px; margin-left:50px;">
    <tr><td style="width:80px;">Bằng số:</td><td style="font-weight:bold;">{{total_amount_number}}</td></tr>
    <tr><td>Bằng chữ:</td><td>{{amount_in_words}}</td></tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">2.2.</td><td style="vertical-align:top; padding:2px 0;">Hình thức thanh toán:</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;"></td><td style="vertical-align:top; padding:2px 0;">{{payment_terms}}</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">2.3.</td><td style="vertical-align:top; padding:2px 0;">Phương thức thanh toán</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">2.3.1.</td><td style="vertical-align:top; padding:2px 0;">Bên A có quyền thanh toán bằng tiền mặt, chuyển khoản.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">2.3.2.</td><td style="vertical-align:top; padding:2px 0;">Thông tin chuyển khoản:</td></tr>
  </table>
  <table style="width:100%; border-collapse:collapse; margin: 4px 0 10px 50px;">
    <tr><td style="width:200px; padding:2px 0;">Tên tài khoản thụ hưởng:</td><td style="font-weight:bold; padding:2px 0;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</td></tr>
    <tr><td style="padding:2px 0;">Số tài khoản:</td><td style="font-weight:bold; padding:2px 0;">86683979</td></tr>
    <tr><td style="padding:2px 0;">Ngân hàng:</td><td style="font-weight:bold; padding:2px 0;">TMCP Kỹ Thương Việt Nam (Techcombank)</td></tr>
    <tr><td style="padding:2px 0;">Chi nhánh:</td><td style="font-weight:bold; padding:2px 0;">Trung tâm giao dịch Hội Sở</td></tr>
  </table>

  <!-- ========== ĐIỀU 3 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">3</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 3: Thời gian thực hiện và chuyển giao sản phẩm</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.1.</td><td style="vertical-align:top; padding:2px 0;">Bên A thực hiện hợp đồng theo quy định tại điều 1 của hợp đồng này trong thời gian cụ thể như sau:</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.1.1.</td><td style="vertical-align:top; padding:2px 0;">Thời gian giao hàng: {{delivery_time}}</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.1.2.</td><td style="vertical-align:top; padding:2px 0;">Địa chỉ giao hàng: {{delivery_address}}</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.2.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Trường hợp Bên B bổ sung, thay đổi thông tin cần thể hiện trên sản phẩm, Bên B phải thông báo cho Bên A theo qui tắc quy định tại điều 06 của hợp đồng này. Việc bổ sung, thay đổi thông tin của Bên B và thời điểm Bên A nhận được thông tin cần thay đổi chỉ được diễn ra trước khi Bên A tiến hành thực hiện sản phẩm. Mọi sự thay đổi cần thông báo cho các Bên Bằng văn bản hoặc các phương thức giao dịch được quy định tại điều 06 của hợp đồng này.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.3.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Trường hợp có sự thay đổi, bổ sung thông tin của Bên A lên sản phẩm, thời gian và tiến độ thực hiện hợp đồng sẽ được điều chỉnh để phù hợp với năng lực của Bên B. Bên A và Bên B thống nhất về tiến độ thực hiện mới (nếu có).</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.4.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Trường hợp Bên B nhận được thanh toán không đúng thời hạn như điều hai của bản hợp đồng này, Bên B có quyền giao sản phẩm trễ hơn lịch trình bằng tổng số ngày Bên A thanh toán trễ của các đợt thanh toán qui định tại điều 2 của hợp đồng này.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.5.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Trong trường hợp bất khả kháng như thiên tai, lũ lụt, hỏa hoạn..., Bên B được phép chuyển giao sản phẩm trễ hơn lịch trình.</td></tr>
  </table>

  <!-- ========== ĐIỀU 4 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">4</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 4: Quyền lợi, trách nhiệm, và nghĩa vụ của Bên B</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">4.1.</td><td style="vertical-align:top; padding:2px 0;">Quyền của Bên B</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">4.1.1.</td><td style="vertical-align:top; padding:2px 0;">Nhận được thanh toán theo điều 2 của hợp đồng này.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">4.1.2.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Được quyền bảo lưu sản phẩm mẫu (tối thiểu 01 đơn vị tính) hoặc sản phẩm dư cho việc đối chiếu và lưu mẫu.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">4.1.3.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Được quyền từ chối việc bổ sung, thay đổi thông tin của Bên A thể hiện trên sản phẩm khi đã tiến hành thực hiện sản phẩm.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">4.2.</td><td style="vertical-align:top; padding:2px 0;">Nghĩa vụ và trách nhiệm của Bên B</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">4.2.1.</td><td style="vertical-align:top; padding:2px 0;">Thực hiện hợp đồng như điều 1 của hợp đồng này.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">4.2.2.</td><td style="vertical-align:top; padding:2px 0;">Đảm bảo quản lý, theo dõi và thực hiện hợp đồng theo tiến độ như điều 3 của hợp đồng này.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">4.2.3.</td><td style="vertical-align:top; padding:2px 0;">Báo cáo tiến độ thực hiện hợp đồng khi Bên A có yêu cầu.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">4.2.4.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Thông báo những phát sinh, các trường hợp bất khả kháng và phối hợp với Bên A trong việc thực hiện hợp đồng.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">4.2.5.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Sử dụng thông tin và sản phẩm của Bên A cho việc thiết kế, sản xuất, thực hiện và chuyển giao sản phẩm theo như bản hợp đồng này.</td></tr>
  </table>

  <!-- ========== ĐIỀU 5 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">5</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 5: Quyền, trách nhiệm, và nghĩa vụ của Bên A</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">5.1.</td><td style="vertical-align:top; padding:2px 0;">Quyền của Bên A</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">5.1.1.</td><td style="vertical-align:top; padding:2px 0;">Nhận được dịch vụ và sản phẩm đầy đủ do Bên B cung cấp.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">5.1.2.</td><td style="vertical-align:top; padding:2px 0;">Quản lý, giám sát tiến độ thực hiện hợp đồng của Bên B.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">5.1.3.</td><td style="vertical-align:top; padding:2px 0;">Thay đổi thông tin thể hiện trên sản phẩm trước khi Bên B tiến hành thực hiện sản phẩm.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">5.2.</td><td style="vertical-align:top; padding:2px 0;">Nghĩa vụ và Trách nhiệm của Bên A</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">5.2.1.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Đảm bảo tính hợp pháp của các thông tin liên quan đến sản phẩm theo luật định: Tên thương hiệu, đăng ký sản phẩm, nhãn mác hàng hóa, bản quyền thông tin, đăng ký chất lượng, giấy phép lưu hành sản phẩm, giấy phép quảng cáo theo qui định và các thông tin khác liên quan đến sản phẩm.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">5.2.2.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Đảm bảo tính hợp pháp của dữ liệu được chép vào thiết bị nếu sử dụng dịch vụ chép dữ liệu lên sản phẩm do Bên A thực hiện.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">5.2.3.</td><td style="vertical-align:top; padding:2px 0;">Kiểm tra, phản hồi và ký duyệt trên sản phẩm mẫu do Bên B cung cấp (nếu có).</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">5.2.4.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Kiểm tra và ký biên bản giao hàng của Bên B, nếu hàng hóa có vấn đề phát sinh Bên A phải ghi xác nhận vào biên bản, và Bên A không được sử dụng hàng hóa được giao đưa ra thị trường trước khi 2 bên thống nhất về tình trạng đơn hàng. Trường hợp, Bên A chưa được sự chấp nhận của Bên B mà đã sử dụng sản phẩm của Bên B thì xem như Bên A đã chấp nhận sản phẩm và phải thanh toán đúng với tiến độ hợp đồng.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">5.2.5.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Kiểm tra và ký biên bản nghiệm thu sản phẩm trong vòng ba (03) ngày kể từ lúc Bên A chuyển giao sản phẩm. Quá thời gian nêu trên, tất cả sản phẩm Bên B đã chuyển giao cho Bên A được xem như đã nghiệm thu hoàn chỉnh và đầy đủ mà không cần bất kỳ giấy tờ xác nhận nào khác.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">5.2.6.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Thanh toán đầy đủ cho Bên B như điều 2 của bản hợp đồng này. Bên A phải đảm bảo về cơ sở vật chất, cơ sở hạ tầng và nhân sự có thẩm quyền để thanh toán đúng hạn. Việc thanh toán không đúng hạn vì bất cứ lý do gì sẽ chiếu theo điều 8 của hợp đồng này để thực hiện.</td></tr>
  </table>

  <!-- ========== ĐIỀU 6 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">6</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 6: Quy tắc làm việc chung</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">6.1.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên A thông báo cho Bên B bằng văn bản khi muốn thay đổi bất kỳ điều khoản nào của bản hợp đồng này và phải được sự đồng ý của Bên B.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">6.2.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B thông báo cho Bên A bằng văn bản khi muốn thay đổi bất kỳ điều khoản nào của bản hợp đồng này và phải được sự đồng ý của Bên A.</td></tr>
  </table>

  <!-- ========== ĐIỀU 7 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">7</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 7: Vi phạm và bồi thường</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">7.1.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B phải chịu phạt 1% tổng giá trị hợp đồng cho mỗi một (01) ngày chậm giao sản phẩm theo tiến độ quy định tại điều 3 của hợp đồng này.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">7.2.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Khi Bên A chậm thanh toán cho Bên B vì bất cứ lý do gì, thì Bên A phải chịu phạt cho Bên B số tiền tương ứng với 1% tổng giá trị hợp đồng cho mỗi một (01) ngày chậm thanh toán so với thời hạn thanh toán quy định tại điều 2 của hợp đồng này.</td></tr>
  </table>

  <!-- ========== ĐIỀU 8 ========== -->
  <table style="width:100%; border-collapse:collapse; margin: 14px 0 6px 0;">
    <tr>
      <td style="width:30px; font-weight:bold; vertical-align:top;">8</td>
      <td style="font-weight:bold; vertical-align:top;">Điều 8: Hiệu lực và chấm dứt hợp đồng</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">8.1.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Tất cả sửa đổi và bổ sung hợp đồng phải được thông báo bằng văn bản và có sự đồng ý của các bên.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">8.2.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Hai bên không được đơn phương chấm dứt hợp đồng này. Nếu trường hợp Bên B đơn phương hủy hợp đồng, thì Bên A sẽ được nhận lại số tiền đã thanh toán cho Bên B theo điều 2 của hợp đồng và chịu phạt 8% giá trị hợp đồng. Nếu trường hợp Bên A đơn phương hủy hợp đồng, thì Bên B sẽ không phải hoàn trả số tiền Bên B đã thanh toán theo điều 2 của hợp đồng.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">8.3.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Trong quá trình thực hiện hợp đồng, nếu phát sinh tranh chấp, hai bên thương lượng trên tinh thần hợp tác và tôn trọng lẫn nhau. Trường hợp các bên không tự giải quyết được thì tranh chấp sẽ được đưa ra tòa án có thẩm quyền theo luật định tại Thành phố Hà Nội để giải quyết. Quyết định của tòa án là quyết định cuối cùng các bên phải thi hành. Mọi án phí liên quan đến vụ kiện sẽ do bên thua chịu trách nhiệm thanh toán.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">8.4.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Những vấn đề không qui định hoặc quy định không đầy đủ trong Hợp đồng này, hai Bên sẽ tuân thủ theo pháp luật hiện hành của nước Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">8.5.</td><td style="vertical-align:top; padding:2px 0;">Hợp đồng này bằng tiếng Việt, có tám (08) điều và các phụ lục đính kèm, được lập thành hai (02) bản, có giá trị pháp lý như nhau, mỗi bên giữ một (01) bản.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">8.6.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Hợp đồng này có hiệu lực kể từ ngày đại diện hợp pháp của hai bên ký và đóng dấu. Khi hai Bên đã thực hiện đầy đủ quyền và nghĩa vụ ghi trong hợp đồng này và không có khiếu nại gì thì coi như hợp đồng đã được thanh lý.</td></tr>
  </table>

  <p style="margin:12px 0; text-align:justify;">Hai bên đã đọc kỹ tất cả các điều khoản của hợp đồng, hiểu rõ quyền lợi và trách nhiệm pháp lý của việc giao kết Hợp đồng này. Tại thời điểm ký kết, đại diện hai bên đều có năng lực pháp luật và năng lực hành vi dân sự đầy đủ.</p>

  <!-- Chữ ký -->
  <table style="width:100%; margin-top: 30px;">
    <tr>
      <td style="width:50%; text-align:center; font-weight:bold; vertical-align:top;">Đại diện Bên A</td>
      <td style="width:50%; text-align:center; font-weight:bold; vertical-align:top;">Đại diện Bên B</td>
    </tr>
    <tr>
      <td style="height:100px;"></td>
      <td style="height:100px;"></td>
    </tr>
  </table>

  <!-- ========== PHỤ LỤC 01: BẢNG BÁO GIÁ CHI TIẾT ========== -->
  <div style="page-break-before: always;"></div>
  <p style="text-align:center; font-weight:bold; font-size:13pt; margin: 20px 0 10px 0;">PHỤ LỤC 01 — BẢNG BÁO GIÁ CHI TIẾT</p>
  <p style="text-align:center; font-style:italic; margin-bottom:16px; font-size:9pt;">(Đính kèm Hợp đồng kinh tế số {{contract_number}} ngày {{day}}/{{month}}/{{year}})</p>

  <table style="width:100%; border-collapse:collapse; margin-bottom:12px; font-size:8pt;">
    <tr style="background:#f5f5f5;">
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; width:25px;">STT<br><span style="font-weight:normal; font-size:7pt;">No.</span></th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold;">Hạng mục & Mô tả chi tiết<br><span style="font-weight:normal; font-size:7pt;">Items & Description</span></th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; width:35px;">ĐVT<br><span style="font-weight:normal; font-size:7pt;">Unit</span></th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; width:22px;">SL<br><span style="font-weight:normal; font-size:7pt;">Qty</span></th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; width:68px;">Đơn giá<br><span style="font-weight:normal; font-size:7pt;">Unit Price</span></th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; width:32px;">CK(%)<br><span style="font-weight:normal; font-size:7pt;">Disc.</span></th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; width:55px;">Giảm giá<br><span style="font-weight:normal; font-size:7pt;">Discount</span></th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; width:68px;">Thành tiền<br><span style="font-weight:normal; font-size:7pt;">Amount</span></th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; width:45px;">Thuế VAT<br><span style="font-weight:normal; font-size:7pt;">VAT</span></th>
      <th style="border:1px solid #000; padding:4px 2px; text-align:center; font-weight:bold; width:80px;">Thành tiền sau thuế<br><span style="font-weight:normal; font-size:7pt;">Total</span></th>
    </tr>
    {{contract_items_table}}
    <tr style="background:#f5f5f5;">
      <td style="border:1px solid #000; padding:4px;" colspan="7"><strong>Tạm tính / Subtotal</strong></td>
      <td style="border:1px solid #000; padding:4px; text-align:right; font-weight:bold; white-space:nowrap;">{{gross_total}}</td>
      <td style="border:1px solid #000; padding:4px;"></td>
      <td style="border:1px solid #000; padding:4px;"></td>
    </tr>
    {{discount_row_html}}
    <tr style="background:#f5f5f5;">
      <td style="border:1px solid #000; padding:4px;" colspan="7"><strong>Tổng chiết khấu / Total Discount</strong></td>
      <td style="border:1px solid #000; padding:4px; text-align:right; white-space:nowrap;">-{{total_discount}}</td>
      <td style="border:1px solid #000; padding:4px;"></td>
      <td style="border:1px solid #000; padding:4px;"></td>
    </tr>
    <tr style="background:#f5f5f5;">
      <td style="border:1px solid #000; padding:4px;" colspan="7"><strong>Cộng tiền hàng / Net Amount</strong></td>
      <td style="border:1px solid #000; padding:4px; text-align:right; font-weight:bold; white-space:nowrap;">{{subtotal}}</td>
      <td style="border:1px solid #000; padding:4px;"></td>
      <td style="border:1px solid #000; padding:4px;"></td>
    </tr>
    <tr style="background:#f5f5f5;">
      <td style="border:1px solid #000; padding:4px;" colspan="7"><strong>Tổng thuế VAT / Total VAT</strong></td>
      <td style="border:1px solid #000; padding:4px;"></td>
      <td style="border:1px solid #000; padding:4px; text-align:right; white-space:nowrap;">{{vat_total}}</td>
      <td style="border:1px solid #000; padding:4px;"></td>
    </tr>
    <tr style="background:#e8e8e8;">
      <td style="border:1px solid #000; padding:6px; font-size:9pt;" colspan="8"><strong>Tổng cộng thanh toán / Grand Total</strong></td>
      <td style="border:1px solid #000; padding:6px; text-align:right; font-weight:bold; font-size:9pt; white-space:nowrap;" colspan="2">{{total_amount_number}} VND</td>
    </tr>
    <tr>
      <td style="border:1px solid #000; padding:4px;" colspan="3">Số tiền viết bằng chữ</td>
      <td style="border:1px solid #000; padding:4px;" colspan="7"><em>{{amount_in_words}}</em></td>
    </tr>
  </table>

  <!-- ========== PHỤ LỤC 02: ĐỀ XUẤT GIẢI PHÁP ========== -->
  {{proposal_appendix_html}}

</div>
`;
