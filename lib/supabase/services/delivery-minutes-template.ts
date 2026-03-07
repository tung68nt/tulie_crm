export const deliveryMinutesTemplate = `
<div style="font-family: 'Arial', sans-serif; padding: 40px; color: #333;">
    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
        <div>
            <h2 style="margin: 0; color: #000;">CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</h2>
            <p style="margin: 5px 0; font-size: 14px;">Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Q. Hà Đông, Hà Nội</p>
            <p style="margin: 5px 0; font-size: 14px;">Mã số thuế: 0110163102</p>
        </div>
        <div style="text-align: right;">
            <h1 style="margin: 0; font-size: 28px; color: #000;">BIÊN BẢN NGHIỆM THU</h1>
            <p style="margin: 5px 0; color: #666;">Số: {{report_number}}</p>
        </div>
    </div>

    <div style="margin-bottom: 30px;">
        <p>Hôm nay, ngày {{day}} tháng {{month}} năm {{year}}, chúng tôi gồm:</p>
        
        <div style="margin-top: 20px;">
            <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">BÊN A: {{customer_company}}</h3>
            <p><strong>Người đại diện:</strong> {{customer_representative}}</p>
            <p><strong>Địa chỉ:</strong> {{customer_address}}</p>
        </div>

        <div style="margin-top: 20px;">
            <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">BÊN B: CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE</h3>
            <p><strong>Người đại diện:</strong> Nguyễn Thanh Tùng</p>
            <p><strong>Chức vụ:</strong> Giám đốc</p>
        </div>
    </div>

    <div style="margin-bottom: 30px;">
        <p>Hai bên cùng tiến hành nghiệm thu và bàn giao các nội dung công việc thuộc hợp đồng số: {{contract_number}}</p>
        <div style="margin-top: 15px;">
            {{delivery_items_table}}
        </div>
    </div>

    <div style="margin-bottom: 30px;">
        <h3 style="font-size: 16px;">Kết luận:</h3>
        <p>- Các công việc đã được hoàn thành đúng tiến độ và chất lượng yêu cầu.</p>
        <p>- Bên A đồng ý nghiệm thu và đưa vào sử dụng.</p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-top: 60px;">
        <div style="text-align: center; width: 45%;">
            <p style="font-weight: bold; margin-bottom: 80px;">ĐẠI DIỆN BÊN A</p>
            <p>{{customer_representative}}</p>
        </div>
        <div style="text-align: center; width: 45%;">
            <p style="font-weight: bold; margin-bottom: 80px;">ĐẠI DIỆN BÊN B</p>
            <p>Nguyễn Thanh Tùng</p>
        </div>
    </div>
</div>
`;
