// ============================================
// TULIE CRM - TYPE DEFINITIONS
// ============================================

// User & Auth Types
export type UserRole = 'admin' | 'leader' | 'staff' | 'accountant'
export type Brand = 'agency' | 'studio' | 'academy'

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
  notes?: string
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

// Deal Types
export type DealStatus = 'new' | 'briefing' | 'proposal_sent' | 'closed_won' | 'closed_lost'
export type DealPriority = 'low' | 'medium' | 'high'

export interface Deal {
  id: string
  title: string
  description?: string
  customer_id: string
  customer?: Customer
  budget?: number
  status: DealStatus
  priority: DealPriority
  assigned_to?: string
  assigned_user?: User
  created_by: string
  creator?: User
  quotations?: Quotation[]
  brand: Brand
  created_at: string
  updated_at: string
}

// Product Types
export interface Product {
  id: string
  name: string
  sku?: string
  category?: string
  description?: string
  unit: string
  price: number
  cost_price?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Quotation Types
export type QuotationStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted'
export type QuotationType = 'standard' | 'proposal'

export interface Quotation {
  id: string
  quotation_number: string
  customer_id: string
  customer?: Customer
  created_by: string
  creator?: User
  status: QuotationStatus
  type: QuotationType
  proposal_content?: any

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
  deal_id?: string
  project_id?: string
  deal?: Deal
  project?: Project
  items?: QuotationItem[]
  bank_name?: string
  bank_account_no?: string
  bank_account_name?: string
  bank_branch?: string
  brand: Brand
  created_at: string
  updated_at: string
}

export interface QuotationItem {
  id: string
  quotation_id?: string
  product_id?: string | null
  product?: Product
  product_name: string
  description?: string
  quantity: number
  unit: string
  unit_price: number
  cost_price?: number
  discount?: number
  vat_percent?: number
  total_price: number
  sort_order: number // To order items within a section
  section_name?: string | null // To group items (e.g., "Design", "Printing")
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
  total_amount: number
  start_date: string
  end_date?: string
  signed_date?: string
  terms?: string
  attachments?: string[]
  items?: ContractItem[]
  milestones?: ContractMilestone[]
  type: 'contract' | 'order'
  order_number?: string
  project_id?: string
  project?: Project
  deal_id?: string
  brand: Brand
  created_at: string
  updated_at: string
}

export interface ContractItem {
  id: string
  contract_id?: string
  product_id?: string
  name: string
  quantity: number
  unit: string
  unit_price: number
  total: number
}

export interface ContractMilestone {
  id: string
  contract_id?: string
  project_id?: string
  name: string
  description?: string
  due_date: string
  amount: number
  status: 'pending' | 'completed' | 'overdue'
  completed_at?: string
  delay_reason?: string
  type?: 'work' | 'payment' | 'delivery'
  tasks?: ProjectTask[]
}

export interface ProjectTask {
  id: string
  project_id: string
  milestone_id?: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high'
  start_date?: string
  end_date?: string
  assigned_to?: string
  created_at?: string
  updated_at?: string
}

// Project Types
export type ProjectStatus = 'todo' | 'in_progress' | 'review' | 'completed'

export interface Project {
  id: string
  contract_id: string
  contract?: Contract
  customer_id: string
  customer?: Customer
  title: string
  description?: string
  status: ProjectStatus
  start_date?: string
  end_date?: string
  assigned_to?: string
  assigned_user?: User
  metadata?: {
    source_link?: string
    hosting_info?: string
    domain_info?: string
    ai_folder_link?: string
    quotation_number?: string
    [key: string]: any
  }
  acceptance_reports?: AcceptanceReport[]
  milestones?: ContractMilestone[]
  quotations?: Quotation[]
  contracts?: Contract[]
  brand: Brand
  created_at: string
  updated_at: string
}

export interface AcceptanceReport {
  id: string
  report_number: string
  project_id: string
  customer_id: string
  created_by: string
  content?: string
  is_signed: boolean
  signed_at?: string
  created_at: string
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
  pdf_url?: string
  lookup_info?: string
  quotation_id?: string
  brand: Brand
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id?: string
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
  | 'new_customer'
  | 'quotation_accepted'
  | 'quotation_viewed'
  | 'quotation_rejected'
  | 'invoice_overdue'
  | 'contract_signed'
  | 'payment_received'
  | 'low_margin'
  | 'cash_flow_alert'
  | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean // Changed from is_read to match service usage
  created_at: string
}

// System Alert Types
export interface AlertItem {
  id: string
  type: 'inactive_customer' | 'overdue_invoice' | 'contract_expiry' | 'low_margin'
  title: string
  message: string
  severity: 'warning' | 'danger' | 'info'
  link: string
}

// Document Template Types
export interface DocumentTemplate {
  id: string
  name: string
  type: 'contract' | 'invoice' | 'payment_request' | 'quotation' | 'order' | 'delivery_minutes'
  content: string // HTML content with {{variables}}
  variables: string[] // List of variable names used in template
  created_at: string
  updated_at: string
}

export interface DocumentBundle {
  id: string
  name: string
  customer_id: string
  contract_id?: string
  templates: string[] // Template IDs included in bundle
  generated_documents: GeneratedDocument[]
  share_token?: string
  expires_at?: string
  created_at: string
}

export interface GeneratedDocument {
  id: string
  bundle_id: string
  template_id: string
  template_name: string
  content: string // Filled HTML content
  status: 'draft' | 'pending_review' | 'approved' | 'signed'
  signed_at?: string
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
// Retail Order Types (B2C Studio)
export type RetailOrderStatus = 'pending' | 'shooting' | 'editing' | 'completed' | 'cancelled'
export type RetailPaymentStatus = 'pending' | 'partial' | 'paid'

export interface RetailOrder {
  id: string
  order_number: string
  stt: number
  customer_name: string
  customer_phone?: string
  customer_email?: string
  source_system?: string // 'studio' | 'academy'
  external_id?: string // ID from Academy
  brand: Brand
  order_date: string
  total_amount: number
  deposit_amount: number
  paid_amount: number
  payment_status: RetailPaymentStatus
  order_status: RetailOrderStatus
  resource_link?: string
  demo_link?: string
  needs_vat: boolean
  vat_info?: {
    tax_code?: string
    company_name?: string
    company_address?: string
    email?: string
  }
  notes?: string
  metadata?: Record<string, any>
  created_by?: string
  creator?: User
  created_at: string
  updated_at: string
}

export interface TelegramConfig {
  bot_token: string
  chat_id: string
  is_enabled: boolean
}

export interface SystemSettings {
  telegram_config: TelegramConfig
  [key: string]: any
}
