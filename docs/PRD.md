# 📋 Product Requirements Document (PRD)
## Tulie Agency CRM System

---

### Document Information

| Field | Value |
|-------|-------|
| **Product Name** | Tulie CRM |
| **Version** | 1.0.0 |
| **Author** | Tulie Agency |
| **Created Date** | 10/01/2026 |
| **Last Updated** | 10/01/2026 |
| **Status** | Draft |

---

## 1. Executive Summary

### 1.1 Overview
Tulie CRM là hệ thống quản trị quan hệ khách hàng (CRM) toàn diện được thiết kế riêng cho Tulie Agency. Hệ thống cho phép quản lý toàn bộ vòng đời khách hàng, từ tiếp cận, báo giá, ký hợp đồng đến chăm sóc hậu mãi, đồng thời theo dõi sức khỏe tài chính doanh nghiệp.

### 1.2 Vision Statement
> "Xây dựng hệ thống CRM chuyên nghiệp, hiện đại, giúp Tulie Agency tối ưu hóa quy trình kinh doanh, nâng cao hiệu suất làm việc và đưa ra quyết định dựa trên dữ liệu."

### 1.3 Goals & Objectives

| Goal | Metric | Target |
|------|--------|--------|
| Tăng hiệu suất quản lý khách hàng | Thời gian xử lý/khách hàng | Giảm 50% |
| Cải thiện tỷ lệ chuyển đổi báo giá | Conversion rate | Tăng 30% |
| Giảm thời gian tạo báo giá | Thời gian/báo giá | < 5 phút |
| Theo dõi doanh thu real-time | Độ chính xác | 99.9% |
| Cảnh báo khách hàng inactive | Response time | < 24h |

---

## 2. Target Users & Personas

### 2.1 User Roles

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                      SUPER ADMIN                         │
│            (Toàn quyền hệ thống)                        │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌───────────────┐           ┌───────────────┐
│    LEADER     │           │   ACCOUNTANT  │
│ (Quản lý team)│           │   (Kế toán)   │
└───────┬───────┘           └───────────────┘
        │
        ▼
┌───────────────┐
│    STAFF      │
│  (Nhân viên)  │
└───────────────┘
\`\`\`

### 2.2 User Personas

#### Persona 1: Super Admin
| Attribute | Description |
|-----------|-------------|
| **Role** | Giám đốc / Chủ doanh nghiệp |
| **Responsibilities** | Quản lý toàn bộ hệ thống, xem báo cáo tổng quan, phân quyền |
| **Pain Points** | Cần overview nhanh, không có thời gian đi sâu chi tiết |
| **Needs** | Dashboard tổng quan, cảnh báo tự động, báo cáo nhanh |

#### Persona 2: Leader
| Attribute | Description |
|-----------|-------------|
| **Role** | Trưởng nhóm kinh doanh |
| **Responsibilities** | Quản lý team, theo dõi hiệu suất nhân viên, duyệt báo giá |
| **Pain Points** | Khó theo dõi tiến độ nhiều nhân viên cùng lúc |
| **Needs** | Bảng theo dõi team, báo cáo hiệu suất, gán việc |

#### Persona 3: Staff
| Attribute | Description |
|-----------|-------------|
| **Role** | Nhân viên kinh doanh |
| **Responsibilities** | Quản lý khách hàng, tạo báo giá, theo dõi hợp đồng |
| **Pain Points** | Quên follow-up khách hàng, mất thời gian tạo báo giá |
| **Needs** | Nhắc nhở tự động, template báo giá, lịch sử giao dịch |

#### Persona 4: Accountant
| Attribute | Description |
|-----------|-------------|
| **Role** | Kế toán |
| **Responsibilities** | Xuất hóa đơn, theo dõi thu chi, báo cáo tài chính |
| **Pain Points** | Thiếu thông tin từ sales, dữ liệu không đồng bộ |
| **Needs** | Export Excel/PDF, thông tin đầy đủ, tự động hóa |

---

## 3. Features & Requirements

### 3.1 Feature Overview Map

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                        TULIE CRM                                 │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤
│  CUSTOMERS  │  CONTRACTS  │  QUOTATIONS │  FINANCE    │ REPORTS │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────┤
│ • List      │ • List      │ • Create    │ • Revenue   │ • Sales │
│ • Profile   │ • Create    │ • Templates │ • Expenses  │ • Team  │
│ • History   │ • Status    │ • Send Link │ • Invoices  │ • KPIs  │
│ • Notes     │ • Tracking  │ • Track     │ • P&L       │ • Alerts│
│ • Alerts    │ • Documents │ • Convert   │ • Forecast  │ • Export│
└─────────────┴─────────────┴─────────────┴─────────────┴─────────┘
\`\`\`

### 3.2 Detailed Feature Specifications

---

#### 🏢 MODULE 1: CUSTOMER MANAGEMENT (Quản lý Khách hàng)

##### F1.1 Customer List
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F1.1.1 | Danh sách khách hàng | P0 | Hiển thị tất cả khách hàng với filter, search, sort |
| F1.1.2 | Phân loại khách hàng | P0 | Lead, Prospect, Customer, VIP, Churned |
| F1.1.3 | Gán nhân viên phụ trách | P0 | Assign/reassign khách hàng cho staff |
| F1.1.4 | Import/Export | P1 | Import từ Excel, Export ra Excel/CSV |
| F1.1.5 | Bulk actions | P1 | Chọn nhiều và thực hiện hành động hàng loạt |

##### F1.2 Customer Profile
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F1.2.1 | Thông tin cơ bản | P0 | Tên, email, phone, địa chỉ, MST |
| F1.2.2 | Thông tin công ty | P0 | Tên công ty, ngành nghề, quy mô |
| F1.2.3 | Người liên hệ | P0 | Nhiều contacts per company |
| F1.2.4 | Thông tin xuất hóa đơn | P0 | Đầy đủ info cho VAT invoice |
| F1.2.5 | Tags & Categories | P1 | Gắn nhãn phân loại tùy chỉnh |
| F1.2.6 | Custom fields | P2 | Thêm trường thông tin tùy chỉnh |

##### F1.3 Customer Timeline & History
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F1.3.1 | Activity timeline | P0 | Dòng thời gian tất cả hoạt động |
| F1.3.2 | Notes & Comments | P0 | Ghi chú khi làm việc với KH |
| F1.3.3 | Call logs | P1 | Lưu lịch sử cuộc gọi |
| F1.3.4 | Email history | P1 | Lưu lịch sử email gửi/nhận |
| F1.3.5 | Meeting notes | P1 | Ghi chú cuộc họp |
| F1.3.6 | File attachments | P1 | Đính kèm tài liệu liên quan |

##### F1.4 Customer Alerts
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F1.4.1 | Inactive alert | P0 | Cảnh báo KH lâu không tương tác (30, 60, 90 ngày) |
| F1.4.2 | No contract alert | P1 | Cảnh báo KH chưa phát sinh hợp đồng |
| F1.4.3 | Birthday reminder | P2 | Nhắc sinh nhật người liên hệ |
| F1.4.4 | Contract expiry | P0 | Nhắc hợp đồng sắp hết hạn |

---

#### 📄 MODULE 2: QUOTATION MANAGEMENT (Quản lý Báo giá)

##### F2.1 Quotation Creation
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F2.1.1 | Tạo báo giá mới | P0 | Form tạo báo giá với sản phẩm/dịch vụ |
| F2.1.2 | Templates | P0 | Mẫu báo giá có sẵn |
| F2.1.3 | Sản phẩm/Dịch vụ | P0 | Chọn từ catalog hoặc thêm mới |
| F2.1.4 | Pricing rules | P1 | Chiết khấu, VAT, điều khoản thanh toán |
| F2.1.5 | Multi-currency | P2 | Hỗ trợ nhiều loại tiền tệ |
| F2.1.6 | Validity period | P0 | Thời hạn hiệu lực báo giá |

##### F2.2 Quotation Sharing
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F2.2.1 | Public link | P0 | Tạo link công khai cho KH xem |
| F2.2.2 | Link expiration | P0 | Link tự hết hạn theo thời gian |
| F2.2.3 | Password protect | P1 | Bảo vệ link bằng mật khẩu |
| F2.2.4 | View tracking | P0 | Theo dõi KH đã xem chưa, xem bao lâu |
| F2.2.5 | Email notification | P1 | Gửi link qua email từ hệ thống |

##### F2.3 Public Quotation Page (Client-facing)
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F2.3.1 | Quotation view | P0 | Trang xem báo giá đẹp, responsive |
| F2.3.2 | Company branding | P0 | Logo, màu sắc, thông tin Tulie |
| F2.3.3 | Accept/Reject | P1 | Nút chấp nhận/từ chối báo giá |
| F2.3.4 | Comment/Question | P1 | KH có thể comment, hỏi thêm |
| F2.3.5 | Download PDF | P0 | Tải báo giá dạng PDF |
| F2.3.6 | Digital signature | P2 | Ký số chấp nhận báo giá |

##### F2.4 Quotation Management
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F2.4.1 | Status tracking | P0 | Draft, Sent, Viewed, Accepted, Rejected, Expired |
| F2.4.2 | Version control | P1 | Lưu các phiên bản chỉnh sửa |
| F2.4.3 | Convert to contract | P0 | Chuyển báo giá thành hợp đồng |
| F2.4.4 | Duplicate | P1 | Clone báo giá để tạo mới |
| F2.4.5 | Comparison | P2 | So sánh các version |

---

#### 📝 MODULE 3: CONTRACT MANAGEMENT (Quản lý Hợp đồng)

##### F3.1 Contract Creation
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F3.1.1 | Tạo hợp đồng | P0 | Từ báo giá hoặc tạo mới |
| F3.1.2 | Contract templates | P1 | Mẫu hợp đồng có sẵn |
| F3.1.3 | Terms & Conditions | P0 | Điều khoản, điều kiện |
| F3.1.4 | Payment terms | P0 | Đợt thanh toán, milestone |
| F3.1.5 | Attachments | P1 | Đính kèm phụ lục, tài liệu |

##### F3.2 Contract Lifecycle
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F3.2.1 | Status management | P0 | Draft, Active, Completed, Cancelled, Suspended |
| F3.2.2 | Start/End dates | P0 | Ngày bắt đầu, kết thúc |
| F3.2.3 | Auto-renewal | P2 | Tự động gia hạn |
| F3.2.4 | Amendment tracking | P1 | Theo dõi sửa đổi, phụ lục |
| F3.2.5 | Milestone tracking | P0 | Theo dõi tiến độ từng giai đoạn |

##### F3.3 Contract Alerts
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F3.3.1 | Expiry reminder | P0 | Nhắc trước 30, 15, 7 ngày |
| F3.3.2 | Payment due | P0 | Nhắc đến hạn thanh toán |
| F3.3.3 | Milestone due | P1 | Nhắc deadline milestone |
| F3.3.4 | Overdue alert | P0 | Cảnh báo quá hạn |

---

#### 💰 MODULE 4: FINANCIAL MANAGEMENT (Quản lý Tài chính)

##### F4.1 Revenue Tracking
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F4.1.1 | Revenue dashboard | P0 | Tổng quan doanh thu real-time |
| F4.1.2 | Revenue by period | P0 | Theo ngày, tuần, tháng, quý, năm |
| F4.1.3 | Revenue by source | P1 | Theo khách hàng, sản phẩm, nhân viên |
| F4.1.4 | Revenue forecast | P1 | Dự báo doanh thu từ pipeline |
| F4.1.5 | Recurring revenue | P1 | Doanh thu định kỳ (MRR, ARR) |

##### F4.2 Expense Tracking
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F4.2.1 | Expense categories | P0 | Phân loại chi phí |
| F4.2.2 | Expense entry | P0 | Nhập chi phí, đính kèm chứng từ |
| F4.2.3 | Vendor management | P1 | Quản lý nhà cung cấp |
| F4.2.4 | Recurring expenses | P1 | Chi phí định kỳ (lương, thuê, ...) |
| F4.2.5 | Budget tracking | P2 | Theo dõi ngân sách |

##### F4.3 Invoice Management
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F4.3.1 | Invoice creation | P0 | Tạo hóa đơn từ hợp đồng |
| F4.3.2 | Invoice status | P0 | Draft, Sent, Paid, Overdue, Cancelled |
| F4.3.3 | Payment tracking | P0 | Theo dõi thanh toán |
| F4.3.4 | Partial payment | P1 | Thanh toán nhiều đợt |
| F4.3.5 | Invoice reminder | P0 | Nhắc thanh toán tự động |
| F4.3.6 | Export for accounting | P0 | Xuất Excel/PDF cho kế toán |

##### F4.4 Input Invoices (Hóa đơn đầu vào)
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F4.4.1 | Record input invoices | P0 | Ghi nhận hóa đơn mua vào |
| F4.4.2 | Vendor linking | P0 | Liên kết với nhà cung cấp |
| F4.4.3 | Due date tracking | P0 | Theo dõi hạn thanh toán |
| F4.4.4 | Approval workflow | P1 | Quy trình duyệt chi |

##### F4.5 Profit & Loss
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F4.5.1 | P&L statement | P0 | Báo cáo lãi lỗ |
| F4.5.2 | Gross margin | P0 | Biên lợi nhuận gộp |
| F4.5.3 | Net profit | P0 | Lợi nhuận ròng |
| F4.5.4 | Trend analysis | P1 | Phân tích xu hướng |
| F4.5.5 | Alert thresholds | P0 | Cảnh báo khi lỗ/margin thấp |

---

#### 📦 MODULE 5: PRODUCTS & SERVICES (Sản phẩm & Dịch vụ)

##### F5.1 Product Catalog
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F5.1.1 | Product list | P0 | Danh sách sản phẩm/dịch vụ |
| F5.1.2 | Categories | P0 | Phân loại sản phẩm |
| F5.1.3 | Pricing | P0 | Giá bán, giá vốn |
| F5.1.4 | Description | P1 | Mô tả chi tiết |
| F5.1.5 | SKU/Code | P1 | Mã sản phẩm |
| F5.1.6 | Active/Inactive | P0 | Trạng thái hoạt động |

##### F5.2 Service Packages
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F5.2.1 | Package builder | P1 | Tạo gói dịch vụ combo |
| F5.2.2 | Bundle pricing | P1 | Giá gói ưu đãi |
| F5.2.3 | Scope of work | P1 | Phạm vi công việc |

---

#### 👥 MODULE 6: TEAM MANAGEMENT (Quản lý Nhân sự)

##### F6.1 User Management
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F6.1.1 | User list | P0 | Danh sách người dùng |
| F6.1.2 | Role assignment | P0 | Gán vai trò (Admin, Leader, Staff, Accountant) |
| F6.1.3 | Team structure | P0 | Cấu trúc team, leader-member |
| F6.1.4 | Active/Inactive | P0 | Kích hoạt/vô hiệu hóa |
| F6.1.5 | Profile management | P1 | Quản lý thông tin cá nhân |

##### F6.2 Permission System
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F6.2.1 | Role-based access | P0 | Phân quyền theo vai trò |
| F6.2.2 | Data visibility | P0 | Staff chỉ thấy data của mình |
| F6.2.3 | Action permissions | P0 | Quyền create, read, update, delete |
| F6.2.4 | Custom permissions | P2 | Tùy chỉnh quyền chi tiết |

##### F6.3 Performance Tracking
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F6.3.1 | Sales KPIs | P0 | Số khách hàng, hợp đồng, doanh thu |
| F6.3.2 | Activity metrics | P1 | Số calls, meetings, notes |
| F6.3.3 | Conversion rates | P1 | Tỷ lệ chuyển đổi |
| F6.3.4 | Target vs Actual | P1 | So sánh với mục tiêu |
| F6.3.5 | Leaderboard | P2 | Bảng xếp hạng nhân viên |

---

#### 📊 MODULE 7: REPORTS & ANALYTICS (Báo cáo & Phân tích)

##### F7.1 Dashboard
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F7.1.1 | Executive dashboard | P0 | Overview cho management |
| F7.1.2 | Sales dashboard | P0 | Dashboard cho sales team |
| F7.1.3 | Financial dashboard | P0 | Dashboard tài chính |
| F7.1.4 | Custom widgets | P2 | Widget tùy chỉnh |
| F7.1.5 | Real-time updates | P0 | Cập nhật real-time |

##### F7.2 Reports
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F7.2.1 | Sales report | P0 | Báo cáo bán hàng |
| F7.2.2 | Revenue report | P0 | Báo cáo doanh thu |
| F7.2.3 | Customer report | P0 | Báo cáo khách hàng |
| F7.2.4 | Team performance | P0 | Báo cáo hiệu suất team |
| F7.2.5 | P&L report | P0 | Báo cáo lãi lỗ |
| F7.2.6 | Pipeline report | P1 | Báo cáo pipeline |
| F7.2.7 | Custom reports | P2 | Báo cáo tùy chỉnh |

##### F7.3 Export & Sharing
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F7.3.1 | Export Excel | P0 | Xuất file Excel |
| F7.3.2 | Export PDF | P0 | Xuất file PDF |
| F7.3.3 | Schedule reports | P2 | Lên lịch gửi báo cáo tự động |
| F7.3.4 | Share via email | P1 | Gửi báo cáo qua email |

##### F7.4 Business Health Metrics
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F7.4.1 | Health score | P0 | Điểm sức khỏe doanh nghiệp |
| F7.4.2 | Cash flow status | P0 | Tình trạng dòng tiền |
| F7.4.3 | Customer health | P1 | Sức khỏe khách hàng |
| F7.4.4 | Growth metrics | P1 | Chỉ số tăng trưởng |
| F7.4.5 | Risk indicators | P0 | Chỉ số rủi ro |

---

#### 🔔 MODULE 8: NOTIFICATIONS & ALERTS (Thông báo & Cảnh báo)

##### F8.1 Notification System
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F8.1.1 | In-app notifications | P0 | Thông báo trong app |
| F8.1.2 | Email notifications | P0 | Thông báo qua email |
| F8.1.3 | Notification center | P0 | Trung tâm thông báo |
| F8.1.4 | Notification settings | P1 | Cài đặt nhận thông báo |

##### F8.2 Smart Alerts
| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| F8.2.1 | Overdue payments | P0 | Cảnh báo thanh toán quá hạn |
| F8.2.2 | Contract expiry | P0 | Cảnh báo hợp đồng hết hạn |
| F8.2.3 | Inactive customers | P0 | Cảnh báo KH không tương tác |
| F8.2.4 | Low margin deals | P0 | Cảnh báo deal margin thấp |
| F8.2.5 | Revenue targets | P1 | Cảnh báo về mục tiêu doanh thu |
| F8.2.6 | Cash flow alerts | P0 | Cảnh báo dòng tiền |

---

## 4. Technical Architecture

### 4.1 Technology Stack

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
├─────────────────────────────────────────────────────────────────┤
│  Framework    : Next.js 16 (App Router)                         │
│  Language     : TypeScript 5.x                                  │
│  Styling      : Tailwind CSS v4                                 │
│  Components   : shadcn/ui + Radix UI                            │
│  State        : SWR + React Context                             │
│  Charts       : Recharts                                        │
│  Forms        : React Hook Form + Zod                           │
│  Tables       : TanStack Table                                  │
│  PDF          : @react-pdf/renderer                             │
│  Excel        : xlsx                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                   │
├─────────────────────────────────────────────────────────────────┤
│  Runtime      : Node.js 22 LTS                                  │
│  Framework    : Next.js API Routes + Server Actions             │
│  Database     : Supabase (PostgreSQL)                           │
│  Auth         : Supabase Auth                                   │
│  Storage      : Supabase Storage / Vercel Blob                  │
│  Email        : Resend                                          │
│  Validation   : Zod                                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE                               │
├─────────────────────────────────────────────────────────────────┤
│  Hosting      : Vercel                                          │
│  Database     : Supabase                                        │
│  CDN          : Vercel Edge Network                             │
│  Monitoring   : Vercel Analytics                                │
│  Error Track  : Sentry                                          │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

### 4.2 System Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js Frontend (React)                      │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │Dashboard│ │Customers│ │Quotation│ │Contracts│ │ Reports │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                      │
│                                   ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     PUBLIC QUOTATION PAGE                        │   │
│  │              (Standalone page for customers)                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  Next.js API Routes / Server Actions             │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │   │
│  │  │    Auth    │ │  CRUD APIs │ │  Reports   │ │   Export   │   │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      MIDDLEWARE LAYER                            │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │   │
│  │  │   Auth   │ │   RBAC   │ │  Logging │ │  Rate    │           │   │
│  │  │  Check   │ │  Check   │ │          │ │  Limit   │           │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             DATA LAYER                                   │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                        Supabase                                 │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │    │
│  │  │  PostgreSQL  │  │     Auth     │  │   Storage    │         │    │
│  │  │   Database   │  │   Service    │  │   (Files)    │         │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │    │
│  │                                                                 │    │
│  │  ┌──────────────┐  ┌──────────────┐                           │    │
│  │  │     RLS      │  │   Realtime   │                           │    │
│  │  │   Policies   │  │   Updates    │                           │    │
│  │  └──────────────┘  └──────────────┘                           │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

### 4.3 Database Schema (ERD)

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATABASE SCHEMA                               │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      users       │       │      teams       │       │    customers     │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │───┐   │ id (PK)          │   ┌───│ id (PK)          │
│ email            │   │   │ name             │   │   │ company_name     │
│ full_name        │   │   │ leader_id (FK)   │───┘   │ tax_code         │
│ avatar_url       │   │   │ created_at       │       │ email            │
│ role             │   │   └──────────────────┘       │ phone            │
│ team_id (FK)     │───┘                              │ address          │
│ is_active        │           ┌──────────────────────│ assigned_to (FK) │
│ created_at       │           │                      │ status           │
└──────────────────┘           │                      │ last_contact_at  │
                               │                      │ created_at       │
                               │                      └──────────────────┘
                               │                              │
                               ▼                              │
┌──────────────────┐    ┌──────────────────┐                 │
│    contacts      │    │  customer_notes  │                 │
├──────────────────┤    ├──────────────────┤                 │
│ id (PK)          │    │ id (PK)          │                 │
│ customer_id (FK) │────│ customer_id (FK) │─────────────────┘
│ name             │    │ user_id (FK)     │
│ position         │    │ content          │
│ email            │    │ type             │
│ phone            │    │ created_at       │
│ is_primary       │    └──────────────────┘
└──────────────────┘

┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    quotations    │       │ quotation_items  │       │    products      │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │───────│ id (PK)          │       │ id (PK)          │
│ quote_number     │       │ quotation_id(FK) │       │ name             │
│ customer_id (FK) │       │ product_id (FK)  │───────│ sku              │
│ created_by (FK)  │       │ quantity         │       │ category         │
│ status           │       │ unit_price       │       │ unit_price       │
│ total_amount     │       │ discount         │       │ cost_price       │
│ valid_until      │       │ total            │       │ description      │
│ public_token     │       └──────────────────┘       │ is_active        │
│ viewed_at        │                                  └──────────────────┘
│ created_at       │
└──────────────────┘
         │
         ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    contracts     │       │ contract_items   │       │    invoices      │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │───────│ id (PK)          │   ┌───│ id (PK)          │
│ contract_number  │       │ contract_id (FK) │   │   │ invoice_number   │
│ customer_id (FK) │       │ product_id (FK)  │   │   │ contract_id (FK) │
│ quotation_id(FK) │       │ quantity         │   │   │ customer_id (FK) │
│ created_by (FK)  │       │ unit_price       │   │   │ type (IN/OUT)    │
│ status           │       │ total            │   │   │ amount           │
│ total_value      │       └──────────────────┘   │   │ status           │
│ start_date       │                              │   │ due_date         │
│ end_date         │──────────────────────────────┘   │ paid_at          │
│ created_at       │                                  │ created_at       │
└──────────────────┘                                  └──────────────────┘

┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    expenses      │       │    vendors       │       │ expense_category │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ category_id (FK) │───────│ name             │       │ name             │
│ vendor_id (FK)   │───────│ contact_name     │       │ description      │
│ invoice_id (FK)  │       │ email            │       │ parent_id        │
│ amount           │       │ phone            │       └──────────────────┘
│ description      │       │ address          │
│ date             │       │ tax_code         │
│ receipt_url      │       │ created_at       │
│ created_by (FK)  │       └──────────────────┘
│ created_at       │
└──────────────────┘

┌──────────────────┐       ┌──────────────────┐
│  notifications   │       │ activity_logs    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ user_id (FK)     │       │ user_id (FK)     │
│ type             │       │ entity_type      │
│ title            │       │ entity_id        │
│ message          │       │ action           │
│ is_read          │       │ metadata (JSON)  │
│ link             │       │ created_at       │
│ created_at       │       └──────────────────┘
└──────────────────┘
\`\`\`

### 4.4 Project Structure

\`\`\`
tulie-crm/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard home
│   │   │
│   │   ├── customers/
│   │   │   ├── page.tsx                # Customer list
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx            # Customer detail
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   │
│   │   ├── quotations/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   │
│   │   ├── contracts/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   │
│   │   ├── invoices/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── finance/
│   │   │   ├── page.tsx                # Overview
│   │   │   ├── revenue/
│   │   │   │   └── page.tsx
│   │   │   ├── expenses/
│   │   │   │   └── page.tsx
│   │   │   └── reports/
│   │   │       └── page.tsx
│   │   │
│   │   ├── team/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── page.tsx
│   │   │   ├── sales/
│   │   │   │   └── page.tsx
│   │   │   └── performance/
│   │   │       └── page.tsx
│   │   │
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── profile/
│   │       │   └── page.tsx
│   │       └── company/
│   │           └── page.tsx
│   │
│   ├── quote/
│   │   └── [token]/
│   │       └── page.tsx                # Public quotation view
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...supabase]/
│   │   │       └── route.ts
│   │   ├── customers/
│   │   │   └── route.ts
│   │   ├── quotations/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── contracts/
│   │   │   └── route.ts
│   │   ├── invoices/
│   │   │   └── route.ts
│   │   ├── export/
│   │   │   ├── excel/
│   │   │   │   └── route.ts
│   │   │   └── pdf/
│   │   │       └── route.ts
│   │   └── reports/
│   │       └── route.ts
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                             # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── nav-menu.tsx
│   │   └── user-menu.tsx
│   │
│   ├── dashboard/
│   │   ├── stats-cards.tsx
│   │   ├── revenue-chart.tsx
│   │   ├── recent-activities.tsx
│   │   └── alerts-panel.tsx
│   │
│   ├── customers/
│   │   ├── customer-form.tsx
│   │   ├── customer-list.tsx
│   │   ├── customer-card.tsx
│   │   └── customer-timeline.tsx
│   │
│   ├── quotations/
│   │   ├── quotation-form.tsx
│   │   ├── quotation-list.tsx
│   │   ├── quotation-preview.tsx
│   │   └── quotation-public.tsx
│   │
│   ├── contracts/
│   │   ├── contract-form.tsx
│   │   ├── contract-list.tsx
│   │   └── contract-status.tsx
│   │
│   ├── invoices/
│   │   ├── invoice-form.tsx
│   │   ├── invoice-list.tsx
│   │   └── invoice-template.tsx
│   │
│   ├── finance/
│   │   ├── revenue-overview.tsx
│   │   ├── expense-tracker.tsx
│   │   ├── profit-loss.tsx
│   │   └── cash-flow.tsx
│   │
│   ├── reports/
│   │   ├── sales-report.tsx
│   │   ├── team-performance.tsx
│   │   └── health-score.tsx
│   │
│   └── shared/
│       ├── data-table.tsx
│       ├── search-input.tsx
│       ├── date-range-picker.tsx
│       ├── status-badge.tsx
│       ├── export-button.tsx
│       └── notification-bell.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser client
│   │   ├── server.ts                   # Server client
│   │   └── middleware.ts               # Auth middleware
│   │
│   ├── utils/
│   │   ├── format.ts                   # Date, currency formatting
│   │   ├── export.ts                   # Excel, PDF export
│   │   ├── calculations.ts             # Financial calculations
│   │   └── permissions.ts              # RBAC helpers
│   │
│   └── constants/
│       ├── status.ts
│       ├── roles.ts
│       └── settings.ts
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-customers.ts
│   ├── use-quotations.ts
│   ├── use-contracts.ts
│   ├── use-invoices.ts
│   ├── use-notifications.ts
│   └── use-permissions.ts
│
├── types/
│   ├── database.ts                     # Supabase generated types
│   ├── customer.ts
│   ├── quotation.ts
│   ├── contract.ts
│   ├── invoice.ts
│   └── user.ts
│
├── scripts/
│   ├── 001_create_tables.sql
│   ├── 002_create_rls_policies.sql
│   ├── 003_seed_data.sql
│   └── 004_create_functions.sql
│
├── middleware.ts
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
\`\`\`

### 4.5 API Design

#### RESTful API Endpoints

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                           API ENDPOINTS                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  AUTHENTICATION                                                          │
│  ──────────────────────────────────────────────────────────────────────  │
│  POST   /api/auth/login              Login user                          │
│  POST   /api/auth/register           Register new user                   │
│  POST   /api/auth/logout             Logout user                         │
│  POST   /api/auth/reset-password     Request password reset              │
│                                                                          │
│  CUSTOMERS                                                               │
│  ──────────────────────────────────────────────────────────────────────  │
│  GET    /api/customers               List customers (with filters)       │
│  GET    /api/customers/:id           Get customer detail                 │
│  POST   /api/customers               Create customer                     │
│  PATCH  /api/customers/:id           Update customer                     │
│  DELETE /api/customers/:id           Delete customer                     │
│  GET    /api/customers/:id/timeline  Get customer activity timeline      │
│  POST   /api/customers/:id/notes     Add note to customer                │
│                                                                          │
│  QUOTATIONS                                                              │
│  ──────────────────────────────────────────────────────────────────────  │
│  GET    /api/quotations              List quotations                     │
│  GET    /api/quotations/:id          Get quotation detail                │
│  POST   /api/quotations              Create quotation                    │
│  PATCH  /api/quotations/:id          Update quotation                    │
│  DELETE /api/quotations/:id          Delete quotation                    │
│  POST   /api/quotations/:id/send     Send quotation to customer          │
│  POST   /api/quotations/:id/convert  Convert to contract                 │
│  GET    /api/quote/:token            Public quotation view               │
│                                                                          │
│  CONTRACTS                                                               │
│  ──────────────────────────────────────────────────────────────────────  │
│  GET    /api/contracts               List contracts                      │
│  GET    /api/contracts/:id           Get contract detail                 │
│  POST   /api/contracts               Create contract                     │
│  PATCH  /api/contracts/:id           Update contract                     │
│  DELETE /api/contracts/:id           Delete contract                     │
│  PATCH  /api/contracts/:id/status    Update contract status              │
│                                                                          │
│  INVOICES                                                                │
│  ──────────────────────────────────────────────────────────────────────  │
│  GET    /api/invoices                List invoices                       │
│  GET    /api/invoices/:id            Get invoice detail                  │
│  POST   /api/invoices                Create invoice                      │
│  PATCH  /api/invoices/:id            Update invoice                      │
│  DELETE /api/invoices/:id            Delete invoice                      │
│  POST   /api/invoices/:id/payment    Record payment                      │
│                                                                          │
│  PRODUCTS                                                                │
│  ──────────────────────────────────────────────────────────────────────  │
│  GET    /api/products                List products/services              │
│  GET    /api/products/:id            Get product detail                  │
│  POST   /api/products                Create product                      │
│  PATCH  /api/products/:id            Update product                      │
│  DELETE /api/products/:id            Delete product                      │
│                                                                          │
│  FINANCE                                                                 │
│  ──────────────────────────────────────────────────────────────────────  │
│  GET    /api/finance/revenue         Get revenue data                    │
│  GET    /api/finance/expenses        Get expenses data                   │
│  GET    /api/finance/profit-loss     Get P&L report                      │
│  GET    /api/finance/cash-flow       Get cash flow data                  │
│  POST   /api/expenses                Create expense entry                │
│                                                                          │
│  TEAM                                                                    │
│  ──────────────────────────────────────────────────────────────────────  │
│  GET    /api/team                    List team members                   │
│  GET    /api/team/:id                Get team member detail              │
│  POST   /api/team                    Add team member                     │
│  PATCH  /api/team/:id                Update team member                  │
│  GET    /api/team/:id/performance    Get performance metrics             │
│                                                                          │
│  REPORTS                                                                 │
│  ──────────────────────────────────────────────────────────────────────  │
│  GET    /api/reports/dashboard       Dashboard summary                   │
│  GET    /api/reports/sales           Sales report                        │
│  GET    /api/reports/customers       Customer report                     │
│  GET    /api/reports/team            Team performance report             │
│  GET    /api/reports/health          Business health metrics             │
│                                                                          │
│  EXPORT                                                                  │
│  ──────────────────────────────────────────────────────────────────────  │
│  POST   /api/export/excel            Export data to Excel                │
│  POST   /api/export/pdf              Export data to PDF                  │
│                                                                          │
│  NOTIFICATIONS                                                           │
│  ──────────────────────────────────────────────────────────────────────  │
│  GET    /api/notifications           List notifications                  │
│  PATCH  /api/notifications/:id/read  Mark as read                        │
│  POST   /api/notifications/read-all  Mark all as read                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 5. UI/UX Design Specifications

### 5.1 Design System

#### Color Palette

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                          COLOR PALETTE                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PRIMARY COLORS (Monochrome)                                             │
│  ──────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                │
│  │████████│ │████████│ │████████│ │████████│ │████████│                │
│  │ Black  │ │Gray 900│ │Gray 600│ │Gray 300│ │ White  │                │
│  │#000000 │ │#171717 │ │#525252 │ │#D4D4D4 │ │#FFFFFF │                │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘                │
│                                                                          │
│  SEMANTIC COLORS                                                         │
│  ──────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                            │
│  │████████│ │████████│ │████████│ │████████│                            │
│  │Success │ │Warning │ │ Error  │ │  Info  │                            │
│  │#22C55E │ │#F59E0B │ │#EF4444 │ │#3B82F6 │                            │
│  └────────┘ └────────┘ └────────┘ └────────┘                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

#### Typography

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                          TYPOGRAPHY                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FONT FAMILY                                                             │
│  ──────────────────────────────────────────────────────────────────────  │
│  Primary: Inter (sans-serif)                                             │
│  Monospace: JetBrains Mono (for numbers, codes)                          │
│                                                                          │
│  SCALE                                                                   │
│  ──────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  Display     48px / 3rem      font-bold     Page titles                  │
│  H1          36px / 2.25rem   font-bold     Section headers              │
│  H2          24px / 1.5rem    font-semibold Card headers                 │
│  H3          20px / 1.25rem   font-semibold Sub-sections                 │
│  Body        16px / 1rem      font-normal   Body text                    │
│  Small       14px / 0.875rem  font-normal   Secondary text               │
│  Caption     12px / 0.75rem   font-normal   Labels, captions             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

#### Spacing & Layout

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                          SPACING SYSTEM                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Base unit: 4px                                                          │
│                                                                          │
│  xs    4px     0.25rem    Inline spacing                                 │
│  sm    8px     0.5rem     Tight spacing                                  │
│  md    16px    1rem       Default spacing                                │
│  lg    24px    1.5rem     Section spacing                                │
│  xl    32px    2rem       Large gaps                                     │
│  2xl   48px    3rem       Page sections                                  │
│                                                                          │
│  LAYOUT                                                                  │
│  ──────────────────────────────────────────────────────────────────────  │
│  Sidebar width: 280px (collapsed: 72px)                                  │
│  Header height: 64px                                                     │
│  Content max-width: 1440px                                               │
│  Card padding: 24px                                                      │
│  Border radius: 8px (cards), 6px (buttons), 4px (inputs)                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

### 5.2 Key Screens Wireframes

#### Dashboard

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐                                           🔔  👤 John Doe  │
│ │  TULIE   │  Dashboard                                                  │
│ │   CRM    │─────────────────────────────────────────────────────────────│
│ ├──────────┤                                                             │
│ │ 📊 Dashboard  ◄──────────────────────────────────────────────────────│
│ │ 👥 Customers  │                                                       │
│ │ 📝 Quotations │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│ │ 📄 Contracts  │  │ Revenue │ │Customers│ │Contracts│ │Pending  │     │
│ │ 💰 Invoices   │  │ ▲ 15%   │ │ ▲ 8%    │ │ ▲ 12%   │ │Invoices │     │
│ │ 📦 Products   │  │$125,000 │ │   248   │ │   45    │ │   12    │     │
│ │ 💵 Finance    │  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │
│ │ 👤 Team       │                                                       │
│ │ 📈 Reports    │  ┌─────────────────────────┐ ┌───────────────────────┐│
│ │ ⚙️ Settings   │  │                         │ │ ⚠️ ALERTS            ││
│ │               │  │    REVENUE CHART        │ │                       ││
│ │               │  │    ════════════         │ │ • 3 inactive customers││
│ │               │  │    📈                   │ │ • 2 overdue invoices  ││
│ │               │  │                         │ │ • 1 contract expiring ││
│ │               │  └─────────────────────────┘ └───────────────────────┘│
│ │               │                                                       │
│ │               │  ┌─────────────────────────────────────────────────┐ │
│ │               │  │ RECENT ACTIVITIES                                │ │
│ │               │  │ ─────────────────────────────────────────────── │ │
│ │               │  │ • New quotation sent to ABC Corp      2 min ago │ │
│ │               │  │ • Contract #45 signed by XYZ Ltd      1 hour ago│ │
│ │               │  │ • Payment received from DEF Inc       3 hours   │ │
│ └───────────────┘  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

#### Customer List

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐                                           🔔  👤 John Doe  │
│ │  TULIE   │  Customers                                                  │
│ │   CRM    │─────────────────────────────────────────────────────────────│
│ ├──────────┤                                                             │
│ │          │  ┌─────────────────────────────────────────────────────┐   │
│ │ 📊 ...   │  │ 🔍 Search customers...    [Status ▼] [Assigned ▼]   │   │
│ │ 👥 ◄──── │  │                                          [+ New]    │   │
│ │ 📝 ...   │  └─────────────────────────────────────────────────────┘   │
│ │          │                                                             │
│ │          │  ┌─────────────────────────────────────────────────────┐   │
│ │          │  │ □  Company          Contact      Status    Assigned  │   │
│ │          │  ├─────────────────────────────────────────────────────┤   │
│ │          │  │ □  ABC Corporation  John Smith   🟢 Active  Sarah   │   │
│ │          │  │ □  XYZ Limited      Jane Doe     🟡 Lead    Mike    │   │
│ │          │  │ □  DEF Industries   Bob Wilson   🔴 Churned David   │   │
│ │          │  │ □  GHI Company      Alice Brown  🟢 Active  Sarah   │   │
│ │          │  │ □  JKL Partners     Tom Green    🟡 Lead    Mike    │   │
│ │          │  │                                                      │   │
│ │          │  │               < 1 2 3 ... 10 >                       │   │
│ │          │  └─────────────────────────────────────────────────────┘   │
│ │          │                                                             │
│ └──────────┘                                                             │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

#### Quotation Builder

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐                                           🔔  👤 John Doe  │
│ │  TULIE   │  New Quotation                                              │
│ │   CRM    │─────────────────────────────────────────────────────────────│
│ ├──────────┤                                                             │
│ │          │  ┌─────────────────────────────────────────────────────┐   │
│ │          │  │ Customer: [ABC Corporation        ▼]                │   │
│ │          │  │ Valid Until: [📅 2026-02-10]                        │   │
│ │          │  └─────────────────────────────────────────────────────┘   │
│ │          │                                                             │
│ │          │  ┌─────────────────────────────────────────────────────┐   │
│ │          │  │ ITEMS                                    [+ Add Item]│   │
│ │          │  ├─────────────────────────────────────────────────────┤   │
│ │          │  │ Product/Service      Qty    Price      Total        │   │
│ │          │  ├─────────────────────────────────────────────────────┤   │
│ │          │  │ Website Development   1    $5,000     $5,000   [🗑]│   │
│ │          │  │ SEO Package           1    $1,000     $1,000   [🗑]│   │
│ │          │  │ Maintenance (12m)     1    $2,400     $2,400   [🗑]│   │
│ │          │  ├─────────────────────────────────────────────────────┤   │
│ │          │  │                        Subtotal:      $8,400        │   │
│ │          │  │                        VAT (10%):       $840        │   │
│ │          │  │                        TOTAL:         $9,240        │   │
│ │          │  └─────────────────────────────────────────────────────┘   │
│ │          │                                                             │
│ │          │  ┌─────────────────────────────────────────────────────┐   │
│ │          │  │ [Preview]  [Save Draft]  [Send to Customer]         │   │
│ │          │  └─────────────────────────────────────────────────────┘   │
│ └──────────┘                                                             │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

#### Public Quotation Page

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                              ┌─────────┐                                 │
│                              │  TULIE  │                                 │
│                              │ AGENCY  │                                 │
│                              └─────────┘                                 │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │   QUOTATION #QT-2026-0142                                         │  │
│  │   ─────────────────────────────────────────────────────────────   │  │
│  │                                                                    │  │
│  │   Prepared for: ABC Corporation                                   │  │
│  │   Date: January 10, 2026                                          │  │
│  │   Valid Until: February 10, 2026                                  │  │
│  │                                                                    │  │
│  │   ┌────────────────────────────────────────────────────────────┐  │  │
│  │   │ Item                          Qty    Price       Total     │  │  │
│  │   ├────────────────────────────────────────────────────────────┤  │  │
│  │   │ Website Development            1    $5,000      $5,000     │  │  │
│  │   │ SEO Package                    1    $1,000      $1,000     │  │  │
│  │   │ Maintenance (12 months)        1    $2,400      $2,400     │  │  │
│  │   ├────────────────────────────────────────────────────────────┤  │  │
│  │   │                              Subtotal:          $8,400     │  │  │
│  │   │                              VAT (10%):           $840     │  │  │
│  │   │                              TOTAL:             $9,240     │  │  │
│  │   └────────────────────────────────────────────────────────────┘  │  │
│  │                                                                    │  │
│  │   Terms & Conditions:                                             │  │
│  │   • 50% deposit required upon acceptance                          │  │
│  │   • Remaining balance due upon project completion                 │  │
│  │                                                                    │  │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │   │ ✓ Accept     │  │ ✗ Decline    │  │ 📥 Download  │           │  │
│  │   └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  │                                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│                    Powered by Tulie CRM © 2026                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 6. Security Requirements

### 6.1 Authentication & Authorization

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                        SECURITY ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  AUTHENTICATION                                                          │
│  ──────────────────────────────────────────────────────────────────────  │
│  • Supabase Auth with email/password                                     │
│  • Session-based authentication with HTTP-only cookies                   │
│  • Token refresh via middleware                                          │
│  • Password requirements: min 8 chars, 1 uppercase, 1 number            │
│  • Rate limiting on auth endpoints                                       │
│                                                                          │
│  AUTHORIZATION (RBAC)                                                    │
│  ──────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Role          │ Permissions                                        │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │ Super Admin   │ Full system access, user management, settings      │ │
│  │ Leader        │ View team data, approve quotations, reports        │ │
│  │ Staff         │ Own customers, quotations, contracts only          │ │
│  │ Accountant    │ Invoices, expenses, financial reports              │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  DATA PROTECTION                                                         │
│  ──────────────────────────────────────────────────────────────────────  │
│  • Row Level Security (RLS) in Supabase                                  │
│  • Parameterized queries (no raw SQL)                                    │
│  • Input validation with Zod                                             │
│  • XSS protection via React's built-in escaping                         │
│  • CSRF protection via SameSite cookies                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

### 6.2 RLS Policies Example

\`\`\`sql
-- Users can only see their own data (Staff level)
CREATE POLICY "Staff can view own customers"
ON customers FOR SELECT
USING (
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'leader')
  )
);

-- Leaders can see team members' data
CREATE POLICY "Leaders can view team customers"
ON customers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN teams t ON u.team_id = t.id
    WHERE u.id = auth.uid()
    AND t.leader_id = auth.uid()
    AND customers.assigned_to IN (
      SELECT id FROM users WHERE team_id = t.id
    )
  )
);
\`\`\`

---

## 7. Performance Requirements

### 7.1 Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| First Contentful Paint (FCP) | < 1.5s | < 2.5s |
| Largest Contentful Paint (LCP) | < 2.5s | < 4.0s |
| Time to Interactive (TTI) | < 3.0s | < 5.0s |
| Cumulative Layout Shift (CLS) | < 0.1 | < 0.25 |
| API Response Time | < 200ms | < 500ms |
| Database Query Time | < 100ms | < 300ms |

### 7.2 Optimization Strategies

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                     PERFORMANCE OPTIMIZATION                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FRONTEND                                                                │
│  ──────────────────────────────────────────────────────────────────────  │
│  • Server Components by default (reduce client JS)                       │
│  • Dynamic imports for heavy components                                  │
│  • Image optimization with next/image                                    │
│  • Font optimization with next/font                                      │
│  • Virtualized lists for large datasets (TanStack Virtual)              │
│  • SWR for smart caching and revalidation                               │
│                                                                          │
│  BACKEND                                                                 │
│  ──────────────────────────────────────────────────────────────────────  │
│  • Database indexing on frequently queried columns                       │
│  • Pagination for list endpoints (default: 20 items)                    │
│  • Query optimization and N+1 prevention                                │
│  • Edge caching for public quotation pages                              │
│  • Connection pooling via Supabase                                       │
│                                                                          │
│  INFRASTRUCTURE                                                          │
│  ──────────────────────────────────────────────────────────────────────  │
│  • Vercel Edge Network for global CDN                                   │
│  • Static page generation where possible                                │
│  • ISR for semi-dynamic content                                         │
│  • Proper Cache-Control headers                                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 8. Development Roadmap

### 8.1 Phase Overview

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT PHASES                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PHASE 1: FOUNDATION (Week 1-2)                                         │
│  ──────────────────────────────────────────────────────────────────────  │
│  ✓ Project setup (Next.js, Supabase, Tailwind)                          │
│  ✓ Authentication system                                                 │
│  ✓ User management & RBAC                                                │
│  ✓ Base UI components & layout                                          │
│  ✓ Database schema & RLS policies                                        │
│                                                                          │
│  PHASE 2: CORE CRM (Week 3-4)                                           │
│  ──────────────────────────────────────────────────────────────────────  │
│  ✓ Customer management (CRUD, timeline, notes)                          │
│  ✓ Product/Service catalog                                               │
│  ✓ Quotation builder & management                                        │
│  ✓ Public quotation page                                                 │
│  ✓ Email notifications                                                   │
│                                                                          │
│  PHASE 3: CONTRACTS & INVOICES (Week 5-6)                               │
│  ──────────────────────────────────────────────────────────────────────  │
│  ✓ Contract management                                                   │
│  ✓ Invoice management (output)                                          │
│  ✓ Input invoices tracking                                               │
│  ✓ Payment tracking                                                      │
│  ✓ Export to Excel/PDF                                                   │
│                                                                          │
│  PHASE 4: FINANCE & REPORTS (Week 7-8)                                  │
│  ──────────────────────────────────────────────────────────────────────  │
│  ✓ Revenue tracking & dashboard                                         │
│  ✓ Expense management                                                    │
│  ✓ P&L reports                                                           │
│  ✓ Team performance reports                                              │
│  ✓ Business health metrics                                               │
│                                                                          │
│  PHASE 5: ALERTS & POLISH (Week 9-10)                                   │
│  ──────────────────────────────────────────────────────────────────────  │
│  ✓ Notification system                                                   │
│  ✓ Smart alerts (inactive, overdue, etc.)                               │
│  ✓ Dashboard widgets                                                     │
│  ✓ Performance optimization                                              │
│  ✓ Testing & bug fixes                                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

### 8.2 Milestone Deliverables

| Phase | Milestone | Deliverables |
|-------|-----------|--------------|
| 1 | Foundation Ready | Auth working, base layout, database setup |
| 2 | CRM Core | Customer & quotation management functional |
| 3 | Transactions | Contracts, invoices, exports working |
| 4 | Analytics | Financial dashboards, reports available |
| 5 | Production Ready | All features, optimized, tested |

---

## 9. Success Metrics

### 9.1 Key Performance Indicators (KPIs)

| Category | KPI | Target |
|----------|-----|--------|
| **Adoption** | Daily Active Users | 100% team |
| **Efficiency** | Quotation creation time | < 5 minutes |
| **Sales** | Quotation conversion rate | > 30% |
| **Customer** | Response time to leads | < 24 hours |
| **Financial** | Overdue invoice rate | < 10% |
| **System** | System uptime | > 99.5% |

### 9.2 Monitoring & Analytics

\`\`\`
┌─────────────────────────────────────────────────────────────────────────┐
│                        MONITORING STRATEGY                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  APPLICATION MONITORING                                                  │
│  • Vercel Analytics for Core Web Vitals                                 │
│  • Sentry for error tracking                                            │
│  • Custom events for feature usage                                       │
│                                                                          │
│  BUSINESS INTELLIGENCE                                                   │
│  • Built-in dashboard analytics                                         │
│  • Exportable reports for management                                    │
│  • Real-time KPI tracking                                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 10. Appendix

### 10.1 Glossary

| Term | Definition |
|------|------------|
| CRM | Customer Relationship Management |
| RLS | Row Level Security |
| RBAC | Role-Based Access Control |
| P&L | Profit and Loss |
| MRR | Monthly Recurring Revenue |
| ARR | Annual Recurring Revenue |
| LTV | Lifetime Value |
| CAC | Customer Acquisition Cost |

### 10.2 References

- Next.js Documentation: https://nextjs.org/docs
- Supabase Documentation: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com/docs
- Vercel: https://vercel.com/docs

### 10.3 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-10 | Tulie Agency | Initial draft |

---

**© 2026 Tulie Agency. All rights reserved.**
\`\`\`

Tôi đã tạo file PRD chi tiết dạng Markdown cho Tulie CRM. File bao gồm:

**📋 Nội dung chính:**
1. **Executive Summary** - Tổng quan dự án và mục tiêu
2. **User Personas** - 4 vai trò người dùng (Super Admin, Leader, Staff, Accountant)
3. **8 Module chi tiết** - Customer, Quotation, Contract, Finance, Products, Team, Reports, Notifications
4. **Technical Architecture** - Stack công nghệ, database schema, API design
5. **UI/UX Specs** - Color palette, typography, wireframes
6. **Security Requirements** - Authentication, RBAC, RLS policies
7. **Performance Requirements** - Targets và optimization strategies
8. **Development Roadmap** - 5 phases trong 10 tuần
9. **Success Metrics** - KPIs cần đạt được?