/**
 * Hợp đồng kinh tế - HTML Template
 * Layout chuẩn theo bộ thủ tục Tulie (Google Sheets export)
 * Biến tự động: {{variable_name}}
 */
export const contractTemplate = `
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
      <td style="width:50%; text-align:center; font-size:10pt;">Số: {{contract_number}}</td>
      <td style="width:50%; text-align:right; font-style:italic; font-size:10pt;">Hà Nội, ngày {{day}} tháng {{month}} năm {{year}}</td>
    </tr>
  </table>

  <!-- Title -->
  <div style="text-align:center; font-weight:bold; font-size:18pt; margin: 12px 0;">
    HỢP ĐỒNG KINH TẾ
  </div>

  <!-- Căn cứ pháp luật -->
  <div style="font-style:italic; margin-bottom: 8px;">
    <p style="margin:2px 0;">- Căn cứ Bộ luật Dân sự nước Cộng hòa Xã hội Chủ nghĩa Việt Nam số 91/2015/QH13 được Quốc hội thông qua ngày 24/11/2015 có hiệu lực thi hành từ ngày 01/01/2017;</p>
    <p style="margin:2px 0;">- Căn cứ Luật Thương mại số 36/2005/QH11 của Quốc hội nước Cộng hòa Xã hội Chủ nghĩa Việt Nam thông qua ngày 14/6/2005 và các văn bản hướng dẫn thi hành từ ngày 01/01/2006;</p>
    <p style="margin:2px 0;">- Căn cứ vào Luật doanh nghiệp số 68/2014/QH13 do quốc hội ban hành ngày 26/11/2014 có hiệu lực thi hành từ ngày 01/07/2015;</p>
    <p style="margin:2px 0;">- Căn cứ vào khả năng cung cầu của hai bên.</p>
  </div>

  <!-- Bên A -->
  <div style="margin-bottom: 8px;">
    <div style="font-weight:bold; border-bottom:1px solid #000; padding-bottom:2px; margin-bottom:4px;">Bên sử dụng dịch vụ (Bên A)</div>
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
    <div style="font-weight:bold; border-bottom:1px solid #000; padding-bottom:2px; margin-bottom:4px;">Bên cung cấp dịch vụ (Bên B) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</div>
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
    <p style="font-weight:bold; margin:4px 0;"><span style="margin-right:8px;">1</span> Điều 1: Nội dung hợp đồng và giá trị hợp đồng</p>
    <p style="margin:2px 0; border-bottom:1px solid #000; padding-bottom:4px;">
      <span style="margin-right:8px;">1.1</span> Theo đề nghị của Bên A, Bên B thực hiện cung cấp cho Bên A những sản phẩm như sau:
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
    <p style="margin:2px 0;">2.3. Phương thức thanh toán</p>
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
    <p style="font-weight:bold; margin:4px 0;"><span style="margin-right:8px;">3</span> Điều 3: Thời gian thực hiện và chuyển giao sản phẩm</p>
    <p style="margin:2px 0;">3.1. Bên A thực hiện hợp đồng theo quy định tại điều 1 của hợp đồng này trong thời gian cụ thể như sau:</p>
    <p style="margin:2px 0;">3.1.1. Thời gian giao hàng: {{delivery_time}}</p>
    <p style="margin:2px 0;">3.1.2. Địa chỉ giao hàng: {{delivery_address}}</p>
    <p style="margin:2px 0;">3.2. Trường hợp Bên B bổ sung, thay đổi thông tin cần thể hiện trên sản phẩm, Bên B phải thông báo cho Bên A theo qui tắc quy định tại điều 06 của hợp đồng này. Việc bổ sung, thay đổi thông tin của Bên B và thời điểm Bên A nhận được thông tin cần thay đổi chỉ được diễn ra trước khi Bên A tiến hành thực hiện sản phẩm. Mọi sự thay đổi cần thông báo cho các Bên Bằng văn bản hoặc các phương thức giao dịch được quy định tại điều 06 của hợp đồng này.</p>
    <p style="margin:2px 0;">3.3. Trường hợp có sự thay đổi, bổ sung thông tin của Bên A lên sản phẩm, thời gian và tiến độ thực hiện hợp đồng sẽ được điều chỉnh để phù hợp với năng lực của Bên B. Bên A và Bên B thống nhất về tiến độ thực hiện mới (nếu có).</p>
    <p style="margin:2px 0;">3.4. Trường hợp Bên B nhận được thanh toán không đúng thời hạn như điều hai của bản hợp đồng này, Bên B có quyền giao sản phẩm trễ hơn lịch trình bằng tổng số ngày Bên A thanh toán trễ của các đợt thanh toán qui định tại điều 2 của hợp đồng này.</p>
    <p style="margin:2px 0;">3.5. Trong trường hợp bất khả kháng như thiên tai, lũ lụt, hỏa hoạn..., Bên B được phép chuyển giao sản phẩm trễ hơn lịch trình.</p>
  </div>

  <!-- Điều 4 -->
  <div style="margin-bottom: 8px;">
    <p style="font-weight:bold; margin:4px 0;"><span style="margin-right:8px;">4</span> Điều 4: Quyền lợi, trách nhiệm, và nghĩa vụ của Bên B</p>
    <p style="margin:2px 0;">4.1. Quyền của Bên B</p>
    <p style="margin:2px 0;">4.1.1. Nhận được thanh toán theo điều 2 của hợp đồng này.</p>
    <p style="margin:2px 0;">4.1.2. Được quyền bảo lưu sản phẩm mẫu (tối thiểu 01 đơn vị tính) hoặc sản phẩm dư cho việc đối chiếu và lưu mẫu.</p>
    <p style="margin:2px 0;">4.1.3. Được quyền từ chối việc bổ sung, thay đổi thông tin của Bên A thể hiện trên sản phẩm khi đã tiến hành thực hiện sản phẩm.</p>
    <p style="margin:2px 0;">4.2. Nghĩa vụ và trách nhiệm của Bên B</p>
    <p style="margin:2px 0;">4.2.1. Thực hiện hợp đồng như điều 1 của hợp đồng này.</p>
    <p style="margin:2px 0;">4.2.2. Đảm bảo quản lý, theo dõi và thực hiện hợp đồng theo tiến độ như điều 3 của hợp đồng này.</p>
    <p style="margin:2px 0;">4.2.3. Báo cáo tiến độ thực hiện hợp đồng khi Bên A có yêu cầu.</p>
    <p style="margin:2px 0;">4.2.4. Thông báo những phát sinh, các trường hợp bất khả kháng và phối hợp với Bên A trong việc thực hiện hợp đồng.</p>
    <p style="margin:2px 0;">4.2.5. Sử dụng thông tin và sản phẩm của Bên A cho việc thiết kế, sản xuất, thực hiện và chuyển giao sản phẩm theo như bản hợp đồng này.</p>
  </div>

  <!-- Điều 5 -->
  <div style="margin-bottom: 8px;">
    <p style="font-weight:bold; margin:4px 0;"><span style="margin-right:8px;">5</span> Điều 5: Quyền, trách nhiệm, và nghĩa vụ của Bên A</p>
    <p style="margin:2px 0;">5.1. Quyền của Bên A</p>
    <p style="margin:2px 0;">5.1.1. Nhận được dịch vụ và sản phẩm đầy đủ do Bên B cung cấp.</p>
    <p style="margin:2px 0;">5.1.2. Quản lý, giám sát tiến độ thực hiện hợp đồng của Bên B.</p>
    <p style="margin:2px 0;">5.1.3. Thay đổi thông tin thể hiện trên sản phẩm trước khi Bên B tiến hành thực hiện sản phẩm.</p>
    <p style="margin:2px 0;">5.2. Nghĩa vụ và Trách nhiệm của Bên A</p>
    <p style="margin:2px 0;">5.2.1. Đảm bảo tính hợp pháp của các thông tin liên quan đến sản phẩm theo luật định: Tên thương hiệu, đăng ký sản phẩm, nhãn mác hàng hóa, bản quyền thông tin, đăng ký chất lượng, giấy phép lưu hành sản phẩm, giấy phép quảng cáo theo qui định và các thông tin khác liên quan đến sản phẩm.</p>
    <p style="margin:2px 0;">5.2.2. Đảm bảo tính hợp pháp của dữ liệu được chép vào thiết bị nếu sử dụng dịch vụ chép dữ liệu lên sản phẩm do Bên A thực hiện.</p>
    <p style="margin:2px 0;">5.2.3. Kiểm tra, phản hồi và ký duyệt trên sản phẩm mẫu do Bên B cung cấp (nếu có).</p>
    <p style="margin:2px 0;">5.2.4. Kiểm tra và ký biên bản giao hàng của Bên B, nếu hàng hóa có vấn đề phát sinh Bên A phải ghi xác nhận vào biên bản, và Bên A không được sử dụng hàng hóa được giao đưa ra thị trường trước khi 2 bên thống nhất về tình trạng đơn hàng. Trường hợp, Bên A chưa được sự chấp nhận của Bên B mà đã sử dụng sản phẩm của Bên B thì xem như Bên A đã chấp nhận sản phẩm và phải thanh toán đúng với tiến độ hợp đồng.</p>
    <p style="margin:2px 0;">5.2.5. Kiểm tra và ký biên bản nghiệm thu sản phẩm trong vòng ba (03) ngày kể từ lúc Bên A chuyển giao sản phẩm. Quá thời gian nêu trên, tất cả sản phẩm Bên B đã chuyển giao cho Bên A được xem như đã nghiệm thu hoàn chỉnh và đầy đủ mà không cần bất kỳ giấy tờ xác nhận nào khác.</p>
    <p style="margin:2px 0;">5.2.6. Thanh toán đầy đủ cho Bên B như điều 2 của bản hợp đồng này. Bên A phải đảm bảo về cơ sở vật chất, cơ sở hạ tầng và nhân sự có thẩm quyền để thanh toán đúng hạn. Việc thanh toán không đúng hạn vì bất cứ lý do gì sẽ chiếu theo điều 8 của hợp đồng này để thực hiện.</p>
  </div>

  <!-- Điều 6 -->
  <div style="margin-bottom: 8px;">
    <p style="font-weight:bold; margin:4px 0;"><span style="margin-right:8px;">6</span> Điều 6: Quy tắc làm việc chung</p>
    <p style="margin:2px 0;">6.1. Bên A thông báo cho Bên B bằng văn bản khi muốn thay đổi bất kỳ điều khoản nào của bản hợp đồng này và phải được sự đồng ý của Bên B.</p>
    <p style="margin:2px 0;">6.2. Bên B thông báo cho Bên A bằng văn bản khi muốn thay đổi bất kỳ điều khoản nào của bản hợp đồng này và phải được sự đồng ý của Bên A.</p>
  </div>

  <!-- Điều 7 -->
  <div style="margin-bottom: 8px;">
    <p style="font-weight:bold; margin:4px 0;"><span style="margin-right:8px;">7</span> Điều 7: Vi phạm và bồi thường</p>
    <p style="margin:2px 0;">7.1. Bên B phải chịu phạt 1% tổng giá trị hợp đồng cho mỗi một (01) ngày chậm giao sản phẩm theo tiến độ quy định tại điều 3 của hợp đồng này.</p>
    <p style="margin:2px 0;">7.2. Khi Bên A chậm thanh toán cho Bên B vì bất cứ lý do gì, thì Bên A phải chịu phạt cho Bên B số tiền tương ứng với 1% tổng giá trị hợp đồng cho mỗi một (01) ngày chậm thanh toán so với thời hạn thanh toán quy định tại điều 2 của hợp đồng này.</p>
  </div>

  <!-- Điều 8 -->
  <div style="margin-bottom: 8px;">
    <p style="font-weight:bold; margin:4px 0;"><span style="margin-right:8px;">8</span> Điều 8: Hiệu lực và chấm dứt hợp đồng</p>
    <p style="margin:2px 0;">8.1. Tất cả sửa đổi và bổ sung hợp đồng phải được thông báo bằng văn bản và có sự đồng ý của các bên.</p>
    <p style="margin:2px 0;">8.2. Hai bên không được đơn phương chấm dứt hợp đồng này. Nếu trường hợp Bên B đơn phương hủy hợp đồng, thì Bên A sẽ được nhận lại số tiền đã thanh toán cho Bên B theo điều 2 của hợp đồng và chịu phạt 8% giá trị hợp đồng. Nếu trường hợp Bên A đơn phương hủy hợp đồng, thì Bên B sẽ không phải hoàn trả số tiền Bên B đã thanh toán theo điều 2 của hợp đồng.</p>
    <p style="margin:2px 0;">8.3. Trong quá trình thực hiện hợp đồng, nếu phát sinh tranh chấp, hai bên thương lượng trên tinh thần hợp tác và tôn trọng lẫn nhau. Trường hợp các bên không tự giải quyết được thì tranh chấp sẽ được đưa ra tòa án có thẩm quyền theo luật định tại Thành phố Hà Nội để giải quyết. Quyết định của tòa án là quyết định cuối cùng các bên phải thi hành. Mọi án phí liên quan đến vụ kiện sẽ do bên thua chịu trách nhiệm thanh toán.</p>
    <p style="margin:2px 0;">8.4. Những vấn đề không qui định hoặc quy định không đầy đủ trong Hợp đồng này, hai Bên sẽ tuân thủ theo pháp luật hiện hành của nước Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam.</p>
    <p style="margin:2px 0;">8.5. Hợp đồng này bằng tiếng Việt, có tám (08) điều, ba (03) trang, được lập thành hai (02) bản, có giá trị pháp lý như nhau, mỗi bên giữ một (01) bản.</p>
    <p style="margin:2px 0;">8.6. Hợp đồng này có hiệu lực kể từ ngày đại diện hợp pháp của hai bên ký và đóng dấu. Khi hai Bên đã thực hiện đầy đủ quyền và nghĩa vụ ghi trong hợp đồng này và không có khiếu nại gì thì coi như hợp đồng đã được thanh lý.</p>
  </div>

  <p style="margin:8px 0;">Hai bên đã đọc kỹ tất cả các điều khoản của hợp đồng, hiểu rõ quyền lợi và trách nhiệm pháp lý của việc giao kết Hợp đồng này. Tại thời điểm ký kết, đại diện hai bên đều có năng lực pháp luật và năng lực hành vi dân sự đầy đủ.</p>

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
