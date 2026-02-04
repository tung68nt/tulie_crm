'use server'
import { createClient } from '../server'

export interface AlertItem {
    id: string
    type: 'inactive_customer' | 'overdue_invoice' | 'contract_expiry' | 'low_margin'
    title: string
    message: string
    severity: 'warning' | 'danger' | 'info'
    link: string
}

export async function getSystemAlerts(): Promise<AlertItem[]> {
    try {
        const supabase = await createClient()
        const alerts: AlertItem[] = []
        const now = new Date()

        // 1. Check for inactive customers (no interaction in 30 days)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const { data: inactiveCustomers, count: inactiveCount } = await supabase
            .from('customers')
            .select('id', { count: 'exact', head: false })
            .lt('updated_at', thirtyDaysAgo.toISOString())
            .limit(1)

        if (inactiveCount && inactiveCount > 0) {
            alerts.push({
                id: 'inactive-customers',
                type: 'inactive_customer',
                title: `${inactiveCount} khách hàng không tương tác`,
                message: 'Đã hơn 30 ngày chưa liên hệ',
                severity: 'warning',
                link: '/customers?status=inactive'
            })
        }

        // 2. Check for overdue invoices
        const { data: overdueInvoices } = await supabase
            .from('invoices')
            .select('id, invoice_number, total_amount')
            .eq('status', 'overdue')
            .eq('type', 'output')

        if (overdueInvoices && overdueInvoices.length > 0) {
            const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
            alerts.push({
                id: 'overdue-invoices',
                type: 'overdue_invoice',
                title: `${overdueInvoices.length} hóa đơn quá hạn`,
                message: `Tổng giá trị: ${new Intl.NumberFormat('vi-VN').format(totalOverdue)}đ`,
                severity: 'danger',
                link: '/invoices?status=overdue'
            })
        }

        // 3. Check for expiring contracts (within 7 days)
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        const { data: expiringContracts } = await supabase
            .from('contracts')
            .select('id, contract_number')
            .eq('status', 'active')
            .lte('end_date', sevenDaysFromNow.toISOString())
            .gte('end_date', now.toISOString())

        if (expiringContracts && expiringContracts.length > 0) {
            alerts.push({
                id: 'expiring-contracts',
                type: 'contract_expiry',
                title: `${expiringContracts.length} hợp đồng sắp hết hạn`,
                message: expiringContracts[0].contract_number
                    ? `${expiringContracts[0].contract_number} hết hạn trong 7 ngày`
                    : 'Hết hạn trong 7 ngày',
                severity: 'warning',
                link: '/contracts?expiring=true'
            })
        }

        // 4. Check for low margin quotations (< 15%)
        const { data: lowMarginQuotations } = await supabase
            .from('quotations')
            .select('id, quote_number, margin_percent')
            .eq('status', 'sent')
            .lt('margin_percent', 15)

        if (lowMarginQuotations && lowMarginQuotations.length > 0) {
            alerts.push({
                id: 'low-margin-quotations',
                type: 'low_margin',
                title: `${lowMarginQuotations.length} deal có margin thấp`,
                message: lowMarginQuotations[0].quote_number
                    ? `${lowMarginQuotations[0].quote_number} chỉ có margin ${lowMarginQuotations[0].margin_percent || 0}%`
                    : `Margin dưới 15%`,
                severity: 'info',
                link: '/quotations?low_margin=true'
            })
        }

        return alerts
    } catch (err) {
        console.error('Fatal error in getSystemAlerts:', err)
        return []
    }
}
