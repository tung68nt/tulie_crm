import { CustomerStatus, QuotationStatus, ContractStatus, InvoiceStatus, DealStatus, ProjectStatus, SupportTicketStatus, SupportTicketPriority } from '@/types'

// Customer Status
export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
    lead: 'Tiềm năng',
    prospect: 'Đang theo dõi',
    customer: 'Khách hàng',
    vip: 'VIP',
    churned: 'Đã rời bỏ',
}

export const CUSTOMER_STATUS_COLORS: Record<CustomerStatus, string> = {
    lead: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    prospect: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
    customer: 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950',
    vip: 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold',
    churned: 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500',
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
    draft: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
    sent: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-200 dark:text-zinc-900',
    viewed: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-200 dark:text-zinc-900',
    accepted: 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900',
    rejected: 'bg-zinc-100 text-zinc-400 border border-zinc-200',
    expired: 'bg-zinc-100 text-zinc-400',
    converted: 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900',
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
    draft: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
    sent: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-200 dark:text-zinc-900',
    viewed: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-200 dark:text-zinc-900',
    signed: 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 font-bold',
    active: 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 font-bold',
    completed: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300',
    cancelled: 'bg-zinc-100 text-zinc-400 border border-zinc-200',
    suspended: 'bg-zinc-100 text-zinc-600',
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
    draft: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
    sent: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-200 dark:text-zinc-900',
    paid: 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900',
    partial: 'bg-zinc-100 text-zinc-800 border-zinc-200',
    overdue: 'bg-zinc-100 text-zinc-900 border border-zinc-900 font-bold',
    cancelled: 'bg-zinc-100 text-zinc-400 line-through opacity-50',
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
    new: '#d4d4d8',          // zinc-300
    briefing: '#a1a1aa',     // zinc-400
    proposal_sent: '#71717a', // zinc-500
    closed_won: '#18181b',    // zinc-900
    closed_lost: '#f4f4f5'    // zinc-100
}

export const DEAL_STATUS_COLORS: Record<DealStatus, string> = {
    new: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
    briefing: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-200 dark:text-zinc-900',
    proposal_sent: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-200 dark:text-zinc-900',
    closed_won: 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900',
    closed_lost: 'bg-zinc-100 text-zinc-400',
}

// Project Status
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
    todo: 'Chờ triển khai',
    in_progress: 'Đang thực hiện',
    review: 'Đang nghiệm thu',
    completed: 'Đã hoàn thành',
}

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
    todo: 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500',
    in_progress: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-200 font-medium',
    review: 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900',
    completed: 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 font-bold',
}

// Product Status (Boolean mapping)
export const PRODUCT_STATUS_LABELS = {
    active: 'Đang bán',
    inactive: 'Ngừng bán',
}

export const PRODUCT_STATUS_COLORS = {
    active: 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 font-bold',
    inactive: 'bg-zinc-100 text-zinc-400 border border-zinc-200',
}

// Brand Labels
export const BRAND_LABELS = {
    agency: 'Tulie Agency',
    studio: 'Tulie Studio',
    academy: 'Tulie Academy',
}

export const BRAND_COLORS = {
    agency: 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold',
    studio: 'bg-zinc-500 text-white dark:bg-zinc-400 dark:text-zinc-900',
    academy: 'bg-zinc-100 text-zinc-900 border border-zinc-900 font-medium',
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
    open: 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 font-bold',
    in_progress: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-200 dark:text-zinc-900',
    waiting: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
    resolved: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300',
    closed: 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500',
}

export const TICKET_PRIORITY_LABELS: Record<SupportTicketPriority, string> = {
    low: 'Thấp',
    medium: 'Bình thường',
    high: 'Cao',
    urgent: 'Khẩn cấp',
}

export const TICKET_PRIORITY_COLORS: Record<SupportTicketPriority, string> = {
    low: 'bg-zinc-100 text-zinc-500',
    medium: 'bg-zinc-100 text-zinc-800',
    high: 'bg-zinc-100 text-zinc-900 border border-zinc-300 font-medium',
    urgent: 'bg-zinc-100 text-zinc-900 border border-zinc-900 font-bold',
}

export const TICKET_CATEGORY_LABELS: Record<string, string> = {
    bug: 'Lỗi',
    feature: 'Yêu cầu mới',
    support: 'Hỗ trợ',
    warranty: 'Bảo hành',
    other: 'Khác',
}
