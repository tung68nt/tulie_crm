import { CustomerStatus, QuotationStatus, ContractStatus, InvoiceStatus, DealStatus, ProjectStatus, SupportTicketStatus, SupportTicketPriority } from '@/types'

// ═══════════════════════════════════════════════════════════════
// Unified Semantic Status Color System
// Matches components.html — See @doc/guides/ui-guidelines
//
// Semantic palette:
//   ghost    = draft, pending, initial
//   outline  = sent, waiting
//   blue     = active, in-progress
//   sky      = acknowledged, intermediate
//   emerald  = success, completed, paid, signed
//   amber    = warning, expired, paused, review
//   danger   = urgent, overdue, rejected
//   violet   = special, premium, VIP, converted
//   orange   = shipping, delivery
//   cancelled = inactive, churned (line-through)
// ═══════════════════════════════════════════════════════════════

// — Reusable color tokens —
const C = {
    ghost:     'bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
    outline:   'bg-white text-zinc-600 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700',
    blue:      'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    sky:       'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
    emerald:   'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    amber:     'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    danger:    'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
    violet:    'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800',
    orange:    'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
    cancelled: 'bg-zinc-100 text-zinc-400 border border-zinc-200 line-through dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700',
} as const

// Customer Status
export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
    lead: 'Tiềm năng',
    prospect: 'Đang theo dõi',
    customer: 'Khách hàng',
    vip: 'VIP',
    churned: 'Đã rời bỏ',
}

export const CUSTOMER_STATUS_COLORS: Record<CustomerStatus, string> = {
    lead: C.ghost,
    prospect: C.blue,
    customer: C.emerald,
    vip: C.violet,
    churned: C.cancelled,
}

// Quotation Status
export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
    draft: 'Bản nháp',
    sent: 'Đã gửi',
    viewed: 'Đã xem',
    accepted: 'Đã chấp nhận',
    rejected: 'Từ chối',
    expired: 'Hết hạn',
    converted: 'Đã chuyển HĐ',
}

export const QUOTATION_STATUS_COLORS: Record<QuotationStatus, string> = {
    draft: C.ghost,
    sent: C.outline,
    viewed: C.blue,
    accepted: C.emerald,
    rejected: C.danger,
    expired: C.amber,
    converted: C.violet,
}

// Contract Status
export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
    draft: 'Bản nháp',
    sent: 'Đã gửi',
    viewed: 'Đã xem',
    signed: 'Đã ký',
    active: 'Đang thực hiện',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    suspended: 'Tạm dừng',
}

export const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
    draft: C.ghost,
    sent: C.outline,
    viewed: C.sky,
    signed: C.emerald,
    active: C.blue,
    completed: C.emerald,
    cancelled: C.cancelled,
    suspended: C.amber,
}

// Invoice Status
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
    draft: 'Bản nháp',
    sent: 'Đã gửi',
    paid: 'Đã thanh toán',
    partial: 'Thanh toán một phần',
    overdue: 'Quá hạn',
    cancelled: 'Đã hủy',
}

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
    draft: C.ghost,
    sent: C.outline,
    paid: C.emerald,
    partial: C.amber,
    overdue: C.danger,
    cancelled: C.cancelled,
}

// Deal Status
export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
    new: 'Mới tạo',
    briefing: 'Đang lấy Brief',
    proposal_sent: 'Đã gửi báo giá',
    closed_won: 'Đã ký (Thành công)',
    closed_lost: 'Đã hủy (Thất bại)',
}

export const DEAL_CHART_COLORS: Record<DealStatus, string> = {
    new: '#a1a1aa',          // zinc-400
    briefing: '#3b82f6',     // blue-500
    proposal_sent: '#0ea5e9', // sky-500
    closed_won: '#10b981',    // emerald-500
    closed_lost: '#d4d4d8'    // zinc-300
}

export const DEAL_STATUS_COLORS: Record<DealStatus, string> = {
    new: C.ghost,
    briefing: C.blue,
    proposal_sent: C.sky,
    closed_won: C.emerald,
    closed_lost: C.cancelled,
}

// Project Status
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
    todo: 'Chờ triển khai',
    in_progress: 'Đang thực hiện',
    review: 'Đang nghiệm thu',
    completed: 'Đã hoàn thành',
}

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
    todo: C.ghost,
    in_progress: C.blue,
    review: C.amber,
    completed: C.emerald,
}

// Product Status (Boolean mapping)
export const PRODUCT_STATUS_LABELS = {
    active: 'Đang bán',
    inactive: 'Ngừng bán',
}

export const PRODUCT_STATUS_COLORS = {
    active: C.emerald,
    inactive: C.ghost,
}

// Brand Labels
export const BRAND_LABELS = {
    agency: 'Tulie Agency',
    studio: 'Tulie Studio',
    academy: 'Tulie Academy',
}

export const BRAND_COLORS = {
    agency: 'bg-zinc-100 text-zinc-700 border border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600',
    studio: 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
    academy: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
}

// Ticket Status
export const TICKET_STATUS_LABELS: Record<SupportTicketStatus, string> = {
    open: 'Mới',
    in_progress: 'Đang xử lý',
    waiting: 'Chờ phản hồi',
    resolved: 'Đã giải quyết',
    closed: 'Đóng',
}

export const TICKET_STATUS_COLORS: Record<SupportTicketStatus, string> = {
    open: C.blue,
    in_progress: C.blue,
    waiting: C.amber,
    resolved: C.emerald,
    closed: C.ghost,
}

export const TICKET_PRIORITY_LABELS: Record<SupportTicketPriority, string> = {
    low: 'Thấp',
    medium: 'Bình thường',
    high: 'Cao',
    urgent: 'Khẩn cấp',
}

export const TICKET_PRIORITY_COLORS: Record<SupportTicketPriority, string> = {
    low: C.ghost,
    medium: C.outline,
    high: C.amber,
    urgent: C.danger,
}

export const TICKET_CATEGORY_LABELS: Record<string, string> = {
    bug: 'Lỗi',
    feature: 'Yêu cầu mới',
    support: 'Hỗ trợ',
    warranty: 'Bảo hành',
    other: 'Khác',
}

// Retail Order Status
export const RETAIL_ORDER_STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ xử lý',
    editing: 'Đang chỉnh sửa',
    edit_done: 'Xong chỉnh sửa',
    waiting_ship: 'Chờ giao hàng',
    shipping: 'Đang giao hàng',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
}

export const RETAIL_ORDER_STATUS_COLORS: Record<string, string> = {
    pending: C.ghost,
    editing: C.blue,
    edit_done: C.sky,
    waiting_ship: C.orange,
    shipping: C.orange,
    completed: C.emerald,
    cancelled: C.cancelled,
}

// Retail Payment Status
export const RETAIL_PAYMENT_STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    unpaid: 'Chưa thanh toán',
    partial: 'Đã cọc',
    paid: 'Đã thanh toán',
}

export const RETAIL_PAYMENT_STATUS_COLORS: Record<string, string> = {
    pending: C.ghost,
    unpaid: C.ghost,
    partial: C.amber,
    paid: C.emerald,
}
