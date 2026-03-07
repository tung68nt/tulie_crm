import { CustomerStatus, QuotationStatus, ContractStatus, InvoiceStatus, DealStatus, ProjectStatus } from '@/types'

// Customer Status
export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
    lead: 'Tiềm năng',
    prospect: 'Đang theo dõi',
    customer: 'Khách hàng',
    vip: 'VIP',
    churned: 'Đã rời bỏ',
}

export const CUSTOMER_STATUS_COLORS: Record<CustomerStatus, string> = {
    lead: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    prospect: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    customer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    vip: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    churned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
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
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    viewed: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
}

// Contract Status
export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
    draft: 'Bản nháp',
    active: 'Đang thực hiện',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    suspended: 'Tạm dừng',
}

export const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
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
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
}

// Deal Status
export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
    new: 'Mới tạo',
    briefing: 'Đang lấy Brief',
    proposal_sent: 'Đã gửi báo giá',
    closed_won: 'Đã ký (Thành công)',
    closed_lost: 'Đã hủy (Thất bại)',
}

export const DEAL_STATUS_COLORS: Record<DealStatus, string> = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    briefing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    proposal_sent: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    closed_won: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    closed_lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

// Project Status
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
    todo: 'Chờ triển khai',
    in_progress: 'Đang thực hiện',
    review: 'Đang nghiệm thu',
    completed: 'Đã hoàn thành',
}

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
    todo: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
}
