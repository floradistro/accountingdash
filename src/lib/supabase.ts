import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export type Store = {
  id: string
  store_name: string
  slug: string
  status: string
  city?: string
  state?: string
  logo_url?: string
}

export type Location = {
  id: string
  name: string
  slug: string
  type: string
  store_id: string
  city?: string
  state?: string
}

export type StorePerformance = {
  store_id: string
  store_name: string
  orders_24h: number
  orders_7d: number
  revenue_24h: number
  revenue_7d: number
  total_products: number
  total_staff: number
}

export type DailySales = {
  store_id: string
  location_id: string
  sale_date: string
  employee_id: string | null
  order_count: number
  total_subtotal: number
  total_tax: number
  total_revenue: number
  total_discounts: number
  total_cogs: number
  total_profit: number
}

export type DailyAuditSummary = {
  store_id: string
  location_id: string
  audit_date: string
  audit_count: number
  total_discrepancies: number
  total_variance_value: number
}

export type SafeBalance = {
  location_id: string
  store_id: string
  current_balance: number
  total_drops: number
  total_drop_amount: number
}

// Accounts Payable Types
export type APSummary = {
  store_id: string
  open_po_count: number
  total_payable: number
  total_paid: number
  total_outstanding: number
  current_0_30: number
  aging_31_60: number
  aging_61_90: number
  aging_over_90: number
}

export type APByVendor = {
  store_id: string
  supplier_id: string
  vendor_name: string
  vendor_email: string
  payment_terms: string | null
  open_po_count: number
  total_billed: number
  total_paid: number
  balance_due: number
  oldest_invoice_date: string
  latest_invoice_date: string
}

export type APDetail = {
  id: string
  store_id: string
  location_id: string
  location_name: string
  po_number: string
  supplier_id: string
  vendor_name: string
  status: string
  payment_status: string
  total_amount: number
  paid_amount: number
  balance_due: number
  created_at: string
  received_at: string | null
  payment_due_date: string | null
  aging_bucket: string
  days_outstanding: number
}

// Accounts Receivable Types
export type ARSummary = {
  store_id: string
  open_invoice_count: number
  total_billed: number
  total_collected: number
  total_outstanding: number
  current_0_30: number
  aging_31_60: number
  aging_61_90: number
  aging_over_90: number
  overdue_count: number
  overdue_amount: number
}

export type ARByCustomer = {
  store_id: string
  customer_id: string
  customer_name: string
  customer_email: string
  open_invoice_count: number
  total_billed: number
  total_paid: number
  balance_due: number
  oldest_invoice_date: string
  latest_invoice_date: string
  overdue_count: number
}

export type ARDetail = {
  id: string
  store_id: string
  invoice_number: string
  customer_id: string
  customer_name: string
  customer_email: string
  status: string
  payment_status: string
  total_amount: number
  amount_paid: number
  amount_due: number
  due_date: string | null
  created_at: string
  sent_at: string | null
  viewed_at: string | null
  paid_at: string | null
  aging_bucket: string
  days_outstanding: number
  is_overdue: boolean
  days_overdue: number
}

// Cash Management Types
export type CashSummary = {
  total_days: number
  cash_transaction_count: number
  cash_sales: number
  card_transaction_count: number
  card_sales: number
  total_transaction_count: number
  total_sales: number
  total_tax: number
  total_tips: number
  refund_count: number
  refund_amount: number
}

export type CashDaily = {
  store_id: string
  report_date: string
  cash_transaction_count: number
  cash_sales: number
  card_transaction_count: number
  card_sales: number
  total_transaction_count: number
  total_sales: number
  total_tax: number
  total_tips: number
  refund_count: number
  refund_amount: number
}

export type CashByLocation = {
  location_id: string
  location_name: string
  cash_sales: number
  card_sales: number
  total_sales: number
  total_tax: number
  transaction_count: number
}

export type CashByPaymentMethod = {
  payment_method: string
  transaction_count: number
  total_amount: number
  tax_amount: number
  tip_amount: number
  percentage: number
}

export type CashMonthly = {
  month: string
  cash_sales: number
  card_sales: number
  other_sales: number
  total_sales: number
  transaction_count: number
  active_days: number
  total_tax_collected: number
  total_refunds: number
}

// Inventory Valuation Types
export type InventorySummary = {
  store_id: string
  total_products: number
  total_locations: number
  total_units: number
  total_value_at_cost: number
  units_in_stock: number
  units_low_stock: number
  units_out_of_stock: number
  products_low_stock: number
  products_out_of_stock: number
  value_in_stock: number
  value_low_stock: number
}

export type InventoryByLocation = {
  store_id: string
  location_id: string
  location_name: string
  product_count: number
  total_units: number
  total_value: number
  low_stock_products: number
  out_of_stock_products: number
}

export type InventoryByCategory = {
  store_id: string
  category_id: string
  category_name: string
  product_count: number
  total_units: number
  total_value: number
  avg_unit_cost: number
  low_stock_products: number
}

export type InventoryDetail = {
  inventory_id: string
  store_id: string
  location_id: string
  location_name: string
  product_id: string
  product_name: string
  sku: string
  category_name: string
  quantity: number
  reserved_quantity: number
  available_quantity: number
  unit_cost: number
  average_cost: number
  cost_basis: number
  total_value: number
  stock_status: string
  low_stock_threshold: number
  inventory_health: string
  last_updated: string
}

export type InventorySlowMoving = {
  store_id: string
  location_id: string
  location_name: string
  product_id: string
  product_name: string
  sku: string
  quantity: number
  inventory_value: number
  last_activity_date: string
  days_since_activity: number
  units_sold_30d: number
}

// Staff Performance Types
export type StaffPerformance = {
  store_id: string
  employee_id: string
  employee_name: string
  employee_email: string
  days_worked: number
  total_orders: number
  total_revenue: number
  total_profit: number
  avg_order_value: number
  avg_daily_revenue: number
  avg_daily_orders: number
  first_sale_date: string
  last_sale_date: string
}

export type StaffDailyPerformance = {
  store_id: string
  employee_id: string
  employee_name: string
  sale_date: string
  order_count: number
  total_revenue: number
  total_profit: number
  total_discounts: number
  avg_order_value: number
  profit_margin_pct: number
}

export type StaffLeaderboard = {
  store_id: string
  employee_id: string
  employee_name: string
  total_revenue: number
  total_orders: number
  total_profit: number
  days_worked: number
  avg_order_value: number
  revenue_rank: number
  orders_rank: number
  aov_rank: number
  profit_rank: number
  first_sale_date: string
  last_sale_date: string
}
