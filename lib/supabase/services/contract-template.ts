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
            <td style="width: 60%; text-align: right; font-style: italic;">Hà Nội, ngày {{contract_date}}</td>
        </tr>
    </table>

    <!-- TITLE -->
    <h1 style="text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 20px;">Hợp đồng kinh tế</h1>

    <!-- CĂN CỨ -->
    <div style="font-style: italic; margin-bottom: 20px;">
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
    <p style="margin-top: 5px;">1.1 Theo đề nghị của Bên A, Bên B thực hiện cung cấp cho Bên A những sản phẩm dịch vụ như sau:</p>
    
    {{contract_items_table}}

    <h3 style="font-size: 13pt; font-weight: bold; margin-top: 20px;">Điều 2: Giá trị hợp đồng và phương thức thanh toán</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
            <td style="width: 5%; vertical-align: top;">2.1.</td>
            <td>
                Tổng giá trị của hợp đồng này là:<br/>
                Bằng số: <strong>{{total_amount_number}} VNĐ</strong><br/>
                Bằng chữ: <em>{{amount_in_words}}</em>
            </td>
        </tr>
        <tr>
            <td style="vertical-align: top;">2.2.</td>
            <td>Bên A thanh toán giá trị hợp đồng cho Bên B theo tiến độ sau: <br/> {{payment_schedule}}</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">2.3.</td>
            <td>Phương thức thanh toán: Bằng tiền mặt hoặc chuyển khoản vào tài khoản của Bên B như thông tin đã nêu ở phần đầu Hợp đồng.</td>
        </tr>
    </table>

    <h3 style="font-size: 13pt; font-weight: bold;">Điều 3: Thời gian thực hiện và chuyển giao sản phẩm</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
            <td style="width: 5%; vertical-align: top;">3.1.</td>
            <td>Thời gian thực hiện dự kiến theo kế hoạch đã thống nhất giữa hai bên. Thời gian bắt đầu: {{start_date}}.</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">3.2.</td>
            <td>Trường hợp Bên B bổ sung, thay đổi thông tin cần thể hiện, Bên B phải thông báo cho Bên A bằng văn bản. Việc bổ sung, thay đổi thông tin có thể làm thay đổi thời gian hoàn thành.</td>
        </tr>
    </table>

    <h3 style="font-size: 13pt; font-weight: bold;">Điều 4: Quyền lợi, trách nhiệm và nghĩa vụ của Bên B</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
            <td style="width: 5%; vertical-align: top;">4.1.</td>
            <td><strong>Quyền của Bên B:</strong> Nhận được thanh toán đúng như Điều 2. Được quyền từ chối các yêu cầu phát sinh không có trong hợp đồng nếu hai bên chưa thỏa thuận về chi phí và thời gian bổ sung.</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">4.2.</td>
            <td><strong>Nghĩa vụ và trách nhiệm của Bên B:</strong> Đảm bảo thực hiện dịch vụ đúng chất lượng, tiến độ. Báo cáo tiến độ khi Bên A yêu cầu.</td>
        </tr>
    </table>

    <h3 style="font-size: 13pt; font-weight: bold;">Điều 5: Quyền lợi, trách nhiệm và nghĩa vụ của Bên A</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
            <td style="width: 5%; vertical-align: top;">5.1.</td>
            <td><strong>Quyền của Bên A:</strong> Nhận được dịch vụ và sản phẩm đầy đủ do Bên B cung cấp. Được quyền giám sát tiến độ thực hiện.</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">5.2.</td>
            <td><strong>Nghĩa vụ và Trách nhiệm của Bên A:</strong> Cung cấp thông tin, tài liệu đầy đủ và chính xác kịp thời cho Bên B. Thanh toán đầy đủ và đúng hạn theo Điều 2. Kiểm tra và nghiệm thu sản phẩm.</td>
        </tr>
    </table>

    <h3 style="font-size: 13pt; font-weight: bold;">Điều 6: Vi phạm và bồi thường</h3>
    <p style="margin-top: 5px;">Bên nào vi phạm các điều khoản trong hợp đồng sẽ phải chịu trách nhiệm bồi thường thiệt hại cho bên còn lại theo quy định của pháp luật hiện hành và các thỏa thuận phát sinh bằng văn bản giữa hai bên.</p>

    <h3 style="font-size: 13pt; font-weight: bold;">Điều 7: Hiệu lực và chấm dứt hợp đồng</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
            <td style="width: 5%; vertical-align: top;">7.1.</td>
            <td>Hợp đồng này có hiệu lực kể từ ngày đại diện hợp pháp của hai bên ký và đóng dấu. Khi hai bên đã thực hiện đầy đủ quyền và nghĩa vụ ghi trong hợp đồng này và không có khiếu nại gì thì coi như hợp đồng đã được thanh lý.</td>
        </tr>
        <tr>
            <td style="vertical-align: top;">7.2.</td>
            <td>Hợp đồng này được lập thành hai (02) bản có giá trị pháp lý như nhau, mỗi bên giữ một (01) bản. Hai bên đã đọc kỹ tất cả các điều khoản, hiểu rõ quyền lợi và trách nhiệm pháp lý.</td>
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
