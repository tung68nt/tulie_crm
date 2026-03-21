export const LATEX_SHARED_PREAMBLE = `
\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T5]{fontenc}
\\usepackage[vietnamese]{babel}
\\usepackage{amsmath, amsfonts, amssymb}
\\usepackage{graphicx}
\\usepackage{tabularx}
\\usepackage{geometry}
\\geometry{a4paper, margin=2cm}
\\usepackage{setspace}
\\setstretch{1.3}
\\usepackage{hyperref}
\\usepackage{booktabs}
\\usepackage{enumitem}
\\usepackage{longtable}
\\usepackage{calc}
\\usepackage{array}

\\newcolumntype{L}[1]{>{\\raggedright\\arraybackslash}p{#1}}
\\newcolumntype{C}[1]{>{\\centering\\arraybackslash}p{#1}}
\\newcolumntype{R}[1]{>{\\raggedleft\\arraybackslash}p{#1}}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{6pt}

\\newcommand{\\companyHeader}{
    \\begin{tabular}{@{}p{0.45\\textwidth} C{0.55\\textwidth}@{}}
        \\centering\\textbf{CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP} & \\centering\\textbf{CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM} \\\\
        \\centering\\textbf{\\underline{CÔNG NGHỆ TULIE}} & \\centering\\textbf{Độc lập - Tự do - Hạnh phúc} \\\\
        \\centering & \\centering\\rule{4cm}{0.4pt}
    \\end{tabular}
}
`;

export const LATEX_CONTRACT_TEMPLATE = `
{{shared_preamble}}

\\begin{document}

\\companyHeader

\\vspace{10pt}
\\begin{tabular}{@{}p{0.5\\textwidth} R{0.5\\textwidth}@{}}
    Số: {{contract_number}} & Hà Nội, ngày {{contract_date_day}} tháng {{contract_date_month}} năm {{contract_date_year}}
\\end{tabular}

\\vspace{20pt}
\\begin{center}
    {\\Large \\textbf{HỢP ĐỒNG KINH TẾ}}
\\end{center}

\\vspace{10pt}
\\textit{- Căn cứ Bộ luật Dân sự nước Cộng hòa Xã hội Chủ nghĩa Việt Nam số 91/2015/QH13;} \\\\
\\textit{- Căn cứ Luật Thương mại số 36/2005/QH11;} \\\\
\\textit{- Căn cứ Luật Doanh nghiệp số 68/2014/QH13;} \\\\
\\textit{- Căn cứ vào khả năng và nhu cầu của hai bên.}

\\vspace{10pt}
\\textbf{Bên sử dụng dịch vụ (Bên A): {{customer_company}}} \\\\
\\begin{tabular}{@{}L{0.25\\textwidth} L{0.45\\textwidth} L{0.1\\textwidth} L{0.2\\textwidth}@{}}
    Người đại diện: & \\textbf{ {{customer_representative}} } & Chức vụ: & {{customer_position}} \\\\
    Địa chỉ: & \\multicolumn{3}{l}{ {{customer_address}} } \\\\
    Điện thoại: & {{customer_phone}} & Email: & {{customer_email}} \\\\
    Mã số thuế: & \\multicolumn{3}{l}{ {{customer_tax_code}} }
\\end{tabular}

\\vspace{10pt}
\\textbf{Bên cung cấp dịch vụ (Bên B): CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE} \\\\
\\begin{tabular}{@{}L{0.25\\textwidth} L{0.45\\textwidth} L{0.1\\textwidth} L{0.2\\textwidth}@{}}
    Người đại diện: & \\textbf{Ông Nguyễn Thanh Tùng} & Chức vụ: & Giám đốc \\\\
    Địa chỉ: & \\multicolumn{3}{L{0.75\\textwidth}}{Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Quận Hà Đông, TP. Hà Nội} \\\\
    Mã số thuế: & \\multicolumn{3}{l}{0110163102} \\\\
    Số tài khoản: & 86683979 & Tại: & Techcombank
\\end{tabular}

\\vspace{15pt}
\\textbf{Điều 1: Nội dung và giá trị hợp đồng} \\\\
1.1. Bên B thực hiện cung cấp cho Bên A những sản phẩm, dịch vụ sau:

\\vspace{10pt}
{{items_table_latex}}

\\vspace{15pt}
\\textbf{Điều 2: Giá trị hợp đồng và phương thức thanh toán} \\\\
2.1. Tổng giá trị hợp đồng (đã bao gồm VAT): \\textbf{ {{total_amount_number}} VND} \\\\
(Bằng chữ: \\textit{ {{amount_in_words}} }) \\\\
2.2. Hình thức thanh toán: Chuyển khoản hoặc tiền mặt. \\\\
2.3. Thời hạn thanh toán: Bên A thanh toán cho Bên B trong vòng 05 ngày làm việc kể từ ngày nghiệm thu bàn giao và nhận đầy đủ hóa đơn chứng từ.

\\vspace{15pt}
\\textbf{Điều 3: Thời gian và địa điểm thực hiện} \\\\
3.1. Thời gian bắt đầu: {{start_date}}. \\\\
3.2. Địa điểm bàn giao: {{delivery_location}}.

\\vspace{15pt}
\\textbf{Điều 4: Quyền và nghĩa vụ của các bên} \\\\
(Nội dung chi tiết theo mẫu Google Sheets...)

\\vspace{60pt}
\\begin{tabular}{C{0.5\\textwidth} C{0.5\\textwidth}}
    \\textbf{ĐẠI DIỆN BÊN A} & \\textbf{ĐẠI DIỆN BÊN B} \\\\
    \\textit{(Ký và đóng dấu)} & \\textit{(Ký và đóng dấu)} \\\\
    & \\\\
    & \\\\
    & \\\\
    \\textbf{ {{customer_representative}} } & \\textbf{Nguyễn Thanh Tùng}
\\end{tabular}

\\end{document}
`;

export const LATEX_PURCHASE_ORDER_TEMPLATE = `
{{shared_preamble}}

\\begin{document}

\\companyHeader

\\vspace{10pt}
\\begin{tabular}{@{}p{0.5\\textwidth} R{0.5\\textwidth}@{}}
    Số: {{order_number}} & Hà Nội, ngày {{date_day}} tháng {{date_month}} năm {{date_year}}
\\end{tabular}

\\vspace{20pt}
\\begin{center}
    {\\Large \\textbf{ĐƠN ĐẶT HÀNG}}
\\end{center}

\\vspace{10pt}
\\textbf{Bên đặt hàng (Bên A): {{customer_company}}} \\\\
\\begin{tabular}{@{}L{0.25\\textwidth} L{0.45\\textwidth} L{0.1\\textwidth} L{0.2\\textwidth}@{}}
    Người đại diện: & \\textbf{ {{customer_representative}} } & Chức vụ: & {{customer_position}} \\\\
    Địa chỉ: & \\multicolumn{3}{l}{ {{customer_address}} } \\\\
    Điện thoại: & {{customer_phone}} & Email: & {{customer_email}} \\\\
    Mã số thuế: & \\multicolumn{3}{l}{ {{customer_tax_code}} }
\\end{tabular}

\\vspace{10pt}
\\textbf{Bên nhận đặt hàng (Bên B): CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE} \\\\
\\begin{tabular}{@{}L{0.25\\textwidth} L{0.45\\textwidth} L{0.1\\textwidth} L{0.2\\textwidth}@{}}
    Người đại diện: & \\textbf{Ông Nguyễn Thanh Tùng} & Chức vụ: & Giám đốc \\\\
    Địa chỉ: & \\multicolumn{3}{L{0.75\\textwidth}}{Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Quận Hà Đông, TP. Hà Nội} \\\\
    Mã số thuế: & \\multicolumn{3}{l}{0110163102}
\\end{tabular}

\\vspace{15pt}
\\textbf{Nội dung đặt hàng:} \\\\
Bên A cam kết đặt hàng các sản phẩm sau:

\\vspace{10pt}
{{items_table_latex}}

\\vspace{15pt}
\\textbf{Thông tin thanh toán:} \\\\
- Tổng cộng: \\textbf{ {{total_amount_number}} VND} \\\\
- Bằng chữ: \\textit{ {{amount_in_words}} } \\\\
- Hình thức: {{payment_method}}

\\vspace{60pt}
\\begin{tabular}{C{0.5\\textwidth} C{0.5\\textwidth}}
    \\textbf{ĐẠI DIỆN BÊN A} & \\textbf{ĐẠI DIỆN BÊN B} \\\\
    \\textit{(Ký tên)} & \\textit{(Ký tên)} \\\\
    & \\\\
    & \\\\
    & \\\\
    \\textbf{ {{customer_representative}} } & \\textbf{Nguyễn Thanh Tùng}
\\end{tabular}

\\end{document}
`;

export const LATEX_PAYMENT_REQUEST_TEMPLATE = `
{{shared_preamble}}

\\begin{document}

\\companyHeader

\\vspace{10pt}
\\begin{tabular}{@{}p{0.5\\textwidth} R{0.5\\textwidth}@{}}
    Số: {{request_number}} & Hà Nội, ngày {{date_day}} tháng {{date_month}} năm {{date_year}}
\\end{tabular}

\\vspace{20pt}
\\begin{center}
    {\\Large \\textbf{CÔNG VĂN ĐỀ NGHỊ THANH TOÁN CÔNG NỢ}}
\\end{center}

\\vspace{10pt}
\\textbf{Kính gửi: {{customer_company}}}

\\vspace{10pt}
Thực hiện Hợp đồng kinh tế số \\textbf{ {{contract_number}} } ký ngày {{contract_date_day}}/{{contract_date_month}}/{{contract_date_year}} giữa {{customer_company}} và Công ty TNHH Dịch vụ và Giải pháp Công nghệ Tulie về việc cung cấp hàng hóa/dịch vụ, chúng tôi đã hoàn thành việc bàn giao sản phẩm.

Theo điều khoản thanh toán, chúng tôi kính đề nghị Quý khách hàng thanh toán số tiền:
\\begin{center}
    \\textbf{\\Large {{payment_amount}} VND} \\\\
    (Bằng chữ: \\textit{ {{amount_in_words}} })
\\end{center}

\\vspace{10pt}
\\textbf{Thông tin chuyển khoản:} \\\\
- Tên chủ tài khoản: \\textbf{CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE} \\\\
- Số tài khoản: \\textbf{86683979} \\\\
- Ngân hàng: \\textbf{Techcombank - Chi nhánh Hội sở} \\\\
- Nội dung: \\textbf{Thanh toán HĐ {{contract_number}} }

\\vspace{10pt}
Rất mong nhận được sự hợp tác từ Quý khách hàng. \\\\
Trân trọng cảm ơn!

\\vspace{40pt}
\\begin{flushright}
    \\textbf{CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE} \\\\
    \\textit{(Ký tên và đóng dấu)} \\\\
    \\vspace{60pt}
    \\textbf{Nguyễn Thanh Tùng}
\\end{flushright}

\\end{document}
`;

export const LATEX_DELIVERY_MINUTES_TEMPLATE = `
{{shared_preamble}}

\\begin{document}

\\companyHeader

\\vspace{10pt}
\\begin{tabular}{@{}p{0.5\\textwidth} R{0.5\\textwidth}@{}}
    Số: {{minutes_number}} & Hà Nội, ngày {{date_day}} tháng {{date_month}} năm {{date_year}}
\\end{tabular}

\\vspace{20pt}
\\begin{center}
    {\\Large \\textbf{BIÊN BẢN GIAO NHẬN VÀ NGHIỆM THU}}
\\end{center}

\\vspace{10pt}
\\textit{- Căn cứ Hợp đồng số {{contract_number}} ký ngày {{contract_date}}.}

\\vspace{10pt}
Hôm nay, ngày {{date_day}} tháng {{date_month}} năm {{date_year}}, chúng tôi gồm có:

\\textbf{Bên nhận (Bên A): {{customer_company}}} \\\\
Đại diện: \\textbf{ {{customer_representative}} } --- Chức vụ: {{customer_position}}

\\textbf{Bên giao (Bên B): CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE} \\\\
Đại diện: \\textbf{Ông Nguyễn Thanh Tùng} --- Chức vụ: Giám đốc

\\vspace{10pt}
Hai bên thống nhất nghiệm thu và bàn giao các sản phẩm sau:

\\vspace{10pt}
{{items_table_latex}}

\\vspace{10pt}
\\textbf{Ý kiến nhận xét:} \\\\
- Chất lượng sản phẩm: Đạt yêu cầu. \\\\
- Số lượng: Đầy đủ theo hợp đồng.

\\vspace{10pt}
Biên bản được lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau.

\\vspace{60pt}
\\begin{tabular}{C{0.5\\textwidth} C{0.5\\textwidth}}
    \\textbf{ĐẠI DIỆN BÊN A} & \\textbf{ĐẠI DIỆN BÊN B} \\\\
    \\textit{(Ký và ghi rõ họ tên)} & \\textit{(Ký và ghi rõ họ tên)} \\\\
    & \\\\
    & \\\\
    & \\\\
    \\textbf{ {{customer_representative}} } & \\textbf{Nguyễn Thanh Tùng}
\\end{tabular}

\\end{document}
`;
