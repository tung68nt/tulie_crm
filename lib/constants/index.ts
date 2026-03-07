export * from './roles'
export * from './status'

// App Settings
export const APP_NAME = 'Tulie CRM'
export const COMPANY_NAME = 'Tulie Agency'

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// Currency
export const DEFAULT_CURRENCY = 'VND'
export const CURRENCY_LOCALE = 'vi-VN'

// Date formats
export const DATE_FORMAT = 'dd/MM/yyyy'
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm'

// Quotation settings
export const QUOTATION_DEFAULT_VALIDITY_DAYS = 30
export const DEFAULT_VAT_PERCENT = 10

// Alert thresholds
export const INACTIVE_CUSTOMER_DAYS = {
    WARNING: 30,
    DANGER: 60,
    CRITICAL: 90,
}

export const CONTRACT_EXPIRY_ALERT_DAYS = {
    REMINDER: 30,
    WARNING: 15,
    URGENT: 7,
}

export const INVOICE_DUE_ALERT_DAYS = {
    UPCOMING: 7,
    DUE_SOON: 3,
    OVERDUE: 0,
}

// Low margin threshold (percentage)
export const LOW_MARGIN_THRESHOLD = 15
