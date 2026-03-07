export const contractTemplate = `
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
            <td style="width: 40%; text-align: left;">Số: {{contract_number}}</td>
            <td style="width: 60%; text-align: right;">Hà Nội, ngày {{contract_date}}</td>
        </tr>
    </table>

    <!-- TITLE -->
    <h1 style="text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 20px;">Hợp đồng kinh tế</h1>

    <!-- CĂN CỨ -->
    <div style="margin-bottom: 20px;">
        <p style="margin: 0;">- Căn cứ Bộ luật Dân sự nước Cộng hòa Xã hội Chủ nghĩa Việt Nam số 91/2015/QH13 được Quốc hội thông qua ngày 24/11/2015 có hiệu lực thi hành từ ngày 01/01/2017;</p>
        <p style="margin: 0;">- Căn cứ Luật Thương mại số 36/2005/QH11 của Quốc hội nước Cộng hòa Xã hội Chủ nghĩa Việt Nam thông qua ngày 14/6/2005 và các văn bản hướng dẫn thi hành từ ngày 01/01/2006;</p>
        <p style="margin: 0;">- Căn cứ Luật Doanh nghiệp số 68/2014/QH13 do Quốc hội ban hành ngày 26/11/2014 có hiệu lực thi hành từ ngày 01/07/2015;</p>
        <p style="margin: 0;">- Căn cứ vào khả năng và nhu cầu của hai bên.</p>
    </div>

    <!-- CÁC BÊN -->
    <h3 style="font-size: 13pt; font-weight: bold;">Bên sử dụng dịch vụ (Bên A): {{customer_company}}</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <tr><td style="width: 25%;">Người đại diện pháp luật:</td><td style="width: 45%;"><strong>{{customer_representative}}</strong></td><td style="width: 10%;">Chức vụ:</td><td>{{customer_position}}</td></tr>
        <tr><td>Địa chỉ liên hệ:</td><td colspan="3">{{customer_address}}</td></tr>
        <tr><td>Điện thoại:</td><td>{{customer_phone}}</td><td>Email:</td><td>{{customer_email}}</td></tr>
        <tr><td>Mã số thuế:</td><td colspan="3">{{customer_tax_code}}</td></tr>
    </table>

    <h3 style="font-size: 13pt; font-weight: bold;">Bên cung cấp dịch vụ (Bên B): Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr><td style="width: 25%;">Người đại diện pháp luật:</td><td style="width: 45%;"><strong>Ông Nguyễn Thanh Tùng</strong></td><td style="width: 10%;">Chức vụ:</td><td>Giám đốc</td></tr>
        <tr><td>Địa chỉ liên hệ:</td><td colspan="3">Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam</td></tr>
        <tr><td>Điện thoại:</td><td>+84 98 898 4554</td><td>Email:</td><td>info@tulie.vn</td></tr>
        <tr><td>Mã số thuế:</td><td colspan="3">0110163102</td></tr>
        <tr><td>Số tài khoản:</td><td>86683979</td><td colspan="2">tại TMCP Kỹ Thương Việt Nam (Techcombank) - Chi nhánh Trung tâm giao dịch Hội Sở</td></tr>
    </table>

    <!-- ĐIỀU KHOẢN -->
    <h3 style="font-size: 13pt; font-weight: bold;">Điều 1: Nội dung hợp đồng và giá trị hợp đồng</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
            <td style="width: 5%; vertical-align: top;">1.1</td>
            <td>Theo đề nghị của Bên A, Bên B thực hiện cung cấp cho Bên A những sản phẩm như sau:</td>
        </tr>
    </table>
    
    {{contract_items_table}}

    <h3 style="font-size: 13pt; font-weight: bold; margin-top: 20px;">Điều 2: Giá trị hợp đồng và phương thức thanh toán</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
            <td style="width: 5%; vertical-align: top;">2.1.</td>
            <td>
                Tổng giá trị của hợp đồng này là:<br/>
                Bằng số: <strong>{{total_amount_number}} VNĐ</strong><br/>
                Bằng chữ: <strong>{{amount_in_words}}</strong>
            </td>
        </tr>
        <tr>
            <td style="vertical-align: top;">2.2.</td>
            <td>Bên A thanh toán giá trị hợp đồng cho Bên B theo tiến độ sau:<br/> {{payment_schedule}}</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">2.3.</td>
            <td>
                <p style="margin: 0; font-weight: bold;">Phương thức thanh toán:</p>
                <p style="margin: 0;">2.3.1. Bên A có quyền thanh toán bằng tiền mặt, chuyển khoản.</p>
                <p style="margin: 0;">2.3.2. Thông tin chuyển khoản:</p>
                <ul style="margin: 0; padding-left: 20px;">
                    <li>Tên tài khoản thụ hưởng: CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</li>
                    <li>Số tài khoản: 86683979</li>
                    <li>Ngân hàng: TMCP Kỹ Thương Việt Nam (Techcombank)</li>
                    <li>Chi nhánh: Trung tâm giao dịch Hội Sở</li>
                </ul>
            </td>
        </tr>
    </table>

    <h3 style="font-size: 13pt; font-weight: bold;">Điều 3: Thời gian thực hiện và chuyển giao sản phẩm</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
            <td style="width: 5%; vertical-align: top;">3.1.</td>
            <td>Bên A thực hiện hợp đồng theo quy định tại điều 1 của hợp đồng này trong thời gian cụ thể như sau:<br/>
                <p style="margin: 0;">3.1.1. Thời gian giao hàng: Theo tiến độ thoả thuận.</p>
                <p style="margin: 0;">3.1.2. Địa chỉ giao hàng: Đóng gói và chuyển phát theo địa chỉ Bên A chỉ định.</p>
            </td>
        </tr>
        <tr>
            <td style="vertical-align: top;">3.2.</td>
            <td>Trường hợp Bên B bổ sung, thay đổi thông tin cần thể hiện trên sản phẩm, Bên B phải thông báo cho Bên A. Việc bổ sung, thay đổi thông tin của Bên B và thời điểm Bên A nhận được thông tin cần thay đổi chỉ được diễn ra trước khi Bên A tiến hành thực hiện sản phẩm.</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">3.3.</td>
            <td>Trường hợp có sự thay đổi, bổ sung thông tin của Bên A lên sản phẩm, thời gian và tiến độ thực hiện hợp đồng sẽ được điều chỉnh để phù hợp với năng lực của Bên B.</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">3.4.</td>
            <td>Trường hợp Bên B nhận được thanh toán không đúng thời hạn như điều 2 của bản hợp đồng này, Bên B có quyền giao sản phẩm trễ hơn lịch trình bằng tổng số ngày Bên A thanh toán trễ.</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">3.5.</td>
            <td>Trong trường hợp bất khả kháng như thiên tai, lũ lụt, hỏa hoạn..., Bên B được phép chuyển giao sản phẩm trễ hơn lịch trình.</td>
        </tr>
    </table>

    <h3 style="font-size: 13pt; font-weight: bold;">Điều 4: Quyền, trách nhiệm, và nghĩa vụ của Bên B</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
            <td style="width: 5%; vertical-align: top;">4.1.</td>
            <td><strong>Quyền của Bên B:</strong><br/>
                4.1.1. Nhận được thanh toán theo điều 2 của hợp đồng.<br/>
                4.1.2. Được quyền bảo lưu sản phẩm mẫu hoặc sản phẩm dư.<br/>
                4.1.3. Được quyền từ chối việc bổ sung, thay đổi thông tin của Bên A khi đã tiến hành làm thực hiện sản phẩm.
            </td>
        </tr>
        <tr>
            <td style="vertical-align: top;">4.2.</td>
            <td><strong>Nghĩa vụ và trách nhiệm của Bên B:</strong><br/>
                4.2.1. Thực hiện hợp đồng như điều 1.<br/>
                4.2.2. Đảm bảo quản lý, theo dõi hợp đồng theo tiến độ như điều 3.<br/>
                4.2.3. Báo cáo tiến độ khi Bên A có yêu cầu.<br/>
                4.2.4. Thông báo phát sinh và phối hợp với Bên A.<br/>
                4.2.5. Sử dụng thông tin của Bên A cho việc thiết kế, sản xuất sản phẩm như hợp đồng.
            </td>
        </tr>
    </table>

    <h3 style="font-size: 13pt; font-weight: bold;">Điều 5: Quyền, trách nhiệm, và nghĩa vụ của Bên A</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
            <td style="width: 5%; vertical-align: top;">5.1.</td>
            <td><strong>Quyền của Bên A:</strong><br/>
                5.1.1. Nhận được dịch vụ và sản phẩm đầy đủ.<br/>
                5.1.2. Quản lý, giám sát tiến độ thực hiện.<br/>
                5.1.3. Thay đổi thông tin thể hiện trên sản phẩm trước khi Bên B tiến hành thực hiện.
            </td>
        </tr>
        <tr>
            <td style="vertical-align: top;">5.2.</td>
            <td><strong>Nghĩa vụ và Trách nhiệm của Bên A:</strong><br/>
                5.2.1. Đảm bảo tính hợp pháp của các thông tin, nhãn mác, bản quyền.<br/>
                5.2.2. Đảm bảo tính hợp pháp của dữ liệu nếu sử dụng dịch vụ chép dữ liệu.<br/>
                5.2.3. Kiểm tra, phản hồi và ký duyệt trên sản phẩm mẫu.<br/>
                5.2.4. Kiểm tra và ký biên bản giao hàng. Nếu sử dụng sản phẩm chưa được chấp nhận xem như chấp nhận thanh toán đúng tiến độ.<br/>
                5.2.5. Kiểm tra và ký biên bản nghiệm thu trong vòng 03 ngày.<br/>
                5.2.6. Thanh toán đầy đủ cho Bên B như điều 2.
            </td>
        </tr>
    </table>

    <h3 style="font-size: 13pt; font-weight: bold;">Điều 6: Quy tắc làm việc chung</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
            <td style="width: 5%; vertical-align: top;">6.1.</td>
            <td>Bên A thông báo cho Bên B bằng văn bản khi muốn thay đổi bất kỳ điều khoản nào của hợp đồng này và phải được sự đồng ý của Bên B.</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">6.2.</td>
            <td>Bên B thông báo cho Bên A bằng văn bản khi muốn thay đổi bất kỳ điều khoản nào của hợp đồng này và phải được sự đồng ý của Bên A.</td>
        </tr>
    </table>

    <h3 style="font-size: 13pt; font-weight: bold;">Điều 7: Vi phạm và bồi thường</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
            <td style="width: 5%; vertical-align: top;">7.1.</td>
            <td>Bên B phải chịu phạt 1% tổng giá trị hợp đồng cho mỗi một (01) ngày chậm giao sản phẩm theo tiến độ quy định tại điều 3 của hợp đồng.</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">7.2.</td>
            <td>Khi Bên A chậm thanh toán cho Bên B vì bất cứ lý do gì, Bên A phải chịu phạt 1% tổng giá trị hợp đồng cho mỗi một (01) ngày chậm thanh toán.</td>
        </tr>
    </table>

    <h3 style="font-size: 13pt; font-weight: bold;">Điều 8: Hiệu lực và chấm dứt hợp đồng</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
            <td style="width: 5%; vertical-align: top;">8.1.</td>
            <td>Tất cả sửa đổi bổ sung phải thông báo bằng văn bản và có sự đồng ý của các bên.</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">8.2.</td>
            <td>Hai bên không được đơn phương chấm dứt hợp đồng này. Trường hợp đơn phương sẽ chịu phạt 8% giá trị hợp đồng hoặc không được hoàn trả tiền đã thanh toán.</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">8.3.</td>
            <td>Tranh chấp không tự giải quyết được sẽ được đưa ra tòa án có thẩm quyền tại Thành phố Hà Nội. Mọi án phí liên quan sẽ do bên thua chịu trách nhiệm thanh toán.</td>
        </tr>
         <tr>
            <td style="vertical-align: top;">8.4.</td>
            <td>Những vấn đề chưa quy định sẽ tuân thủ pháp luật hiện hành của Việt Nam.</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">8.5.</td>
            <td>Hợp đồng lập thành hai (02) bản có giá trị pháp lý như nhau, mỗi bên giữ một (01) bản.</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">8.6.</td>
            <td>Hợp đồng có hiệu lực kể từ ngày đại diện hợp pháp hai bên ký và đóng dấu. Khi hai Bên đã thực hiện đầy đủ quyền và nghĩa vụ thì coi như hợp đồng đã được thanh lý.</td>
        </tr>
        <tr>
            <td></td>
            <td>Hai bên đã đọc kỹ tất cả các điều khoản, hiểu rõ quyền lợi và trách nhiệm pháp lý.</td>
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
