// ============================================
// TULIE CRM - TYPE DEFINITIONS
// ============================================

// User & Auth Types
export type UserRole = 'admin' | 'leader' | 'staff' | 'accountant'

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: UserRole
  team_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  leader_id: string
  created_at: string
}

// Customer Types
export type CustomerStatus = 'lead' | 'prospect' | 'customer' | 'vip' | 'churned'

export interface Customer {
  id: string
  company_name: string
  tax_code?: string
  email?: string
  phone?: string
  address?: string
  invoice_address?: string
  industry?: string
  company_size?: string
  website?: string
  status: CustomerStatus
  assigned_to: string
  assigned_user?: User
  last_contact_at?: string
  tags?: string[]
  created_by: string
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  customer_id: string
  name: string
  position?: string
  email?: string
  phone?: string
  is_primary: boolean
  birthday?: string
  created_at: string
}

export interface CustomerNote {
  id: string
  customer_id: string
  user_id: string
  user?: User
  content: string
  type: 'note' | 'call' | 'email' | 'meeting'
  created_at: string
}

// Product Types
export interface Product {
  id: string
  name: string
  sku?: string
  category?: string
  description?: string
  unit: string
  unit_price: number
  cost_price?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Quotation Types
export type QuotationStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted'

export interface Quotation {
  id: string
  quote_number: string
  customer_id: string
  customer?: Customer
  created_by: string
  creator?: User
  status: QuotationStatus
  title?: string
  description?: string
  terms?: string
  notes?: string
  subtotal: number
  discount_percent?: number
  discount_amount?: number
  vat_percent: number
  vat_amount: number
  total_amount: number
  valid_until: string
  public_token: string
  password_hash?: string
  viewed_at?: string
  view_count: number
  accepted_at?: string
  rejected_at?: string
  confirmer_info?: {
    name: string
    phone: string
    email: string
    position?: string
  }
  items?: QuotationItem[]
  created_at: string
  updated_at: string
}

export interface QuotationItem {
  id: string
  quotation_id: string
  product_id?: string
  product?: Product
  name: string
  description?: string
  quantity: number
  unit: string
  unit_price: number
  discount_percent?: number
  total: number
  sort_order: number // To order items within a section
  section_name?: string // To group items (e.g., "Design", "Printing")
}

// Contract Types
export type ContractStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'suspended'

export interface Contract {
  id: string
  contract_number: string
  customer_id: string
  customer?: Customer
  quotation_id?: string
  quotation?: Quotation
  created_by: string
  creator?: User
  title: string
  description?: string
  status: ContractStatus
  total_value: number
  start_date: string
  end_date?: string
  signed_date?: string
  terms?: string
  attachments?: string[]
  items?: ContractItem[]
  milestones?: ContractMilestone[]
  created_at: string
  updated_at: string
}

export interface ContractItem {
  id: string
  contract_id: string
  product_id?: string
  name: string
  quantity: number
  unit: string
  unit_price: number
  total: number
}

export interface ContractMilestone {
  id: string
  contract_id: string
  name: string
  description?: string
  due_date: string
  amount: number
  status: 'pending' | 'completed' | 'overdue'
  completed_at?: string
}

// Invoice Types
export type InvoiceType = 'output' | 'input'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  invoice_number: string
  type: InvoiceType
  contract_id?: string
  contract?: Contract
  customer_id?: string
  customer?: Customer
  vendor_id?: string
  vendor?: Vendor
  created_by: string
  creator?: User
  status: InvoiceStatus
  issue_date: string
  due_date: string
  subtotal: number
  vat_percent: number
  vat_amount: number
  total_amount: number
  paid_amount: number
  notes?: string
  items?: InvoiceItem[]
  payments?: Payment[]
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  total: number
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  payment_date: string
  payment_method: string
  notes?: string
  created_by: string
  created_at: string
}

// Vendor Types
export interface Vendor {
  id: string
  name: string
  contact_name?: string
  email?: string
  phone?: string
  address?: string
  tax_code?: string
  bank_account?: string
  bank_name?: string
  created_at: string
  updated_at: string
}

// Expense Types
export interface ExpenseCategory {
  id: string
  name: string
  description?: string
  parent_id?: string
  created_at: string
}

export interface Expense {
  id: string
  category_id: string
  category?: ExpenseCategory
  vendor_id?: string
  vendor?: Vendor
  invoice_id?: string
  amount: number
  description: string
  date: string
  receipt_url?: string
  created_by: string
  creator?: User
  created_at: string
  updated_at: string
}

// Notification Types
export type NotificationType =
  | 'customer_inactive'
  | 'contract_expiry'
  | 'invoice_overdue'
  | 'payment_received'
  | 'quotation_viewed'
  | 'quotation_accepted'
  | 'quotation_rejected'
  | 'low_margin'
  | 'cash_flow_alert'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

// Activity Log Types
export interface ActivityLog {
  id: string
  user_id: string
  user?: User
  entity_type: 'customer' | 'quotation' | 'contract' | 'invoice' | 'product' | 'expense'
  entity_id: string
  action: 'create' | 'update' | 'delete' | 'status_change' | 'view'
  metadata?: Record<string, unknown>
  created_at: string
}

// Dashboard & Report Types
export interface DashboardStats {
  revenue: {
    total: number
    change: number
    period: string
  }
  customers: {
    total: number
    new: number
    change: number
  }
  contracts: {
    active: number
    pending: number
    change: number
  }
  invoices: {
    pending: number
    overdue: number
    total_outstanding: number
  }
}

export interface RevenueData {
  date: string
  revenue: number
  expenses: number
  profit: number
}

export interface Alert {
  id: string
  type: 'warning' | 'danger' | 'info'
  title: string
  message: string
  link?: string
  created_at: string
}

// Pagination & Filter Types
export interface PaginationParams {
  page: number
  limit: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface CustomerFilters {
  status?: CustomerStatus
  assigned_to?: string
  search?: string
  tags?: string[]
}

export interface QuotationFilters {
  status?: QuotationStatus
  customer_id?: string
  created_by?: string
  date_from?: string
  date_to?: string
}

export interface ContractFilters {
  status?: ContractStatus
  customer_id?: string
  date_from?: string
  date_to?: string
}

export interface InvoiceFilters {
  type?: InvoiceType
  status?: InvoiceStatus
  customer_id?: string
  vendor_id?: string
  date_from?: string
  date_to?: string
}
