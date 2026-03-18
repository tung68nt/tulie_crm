import { getContracts, deleteContracts } from '@/lib/supabase/services/contract-service'
import { ContractsPageTabs } from '@/components/contracts/contracts-page-tabs'

export default async function ContractsPage() {
    const [contracts, orders] = await Promise.all([
        getContracts(undefined, 'contract'),
        getContracts(undefined, 'order'),
    ])

    const contractStats = {
        active: contracts.filter((c) => c.status === 'active').length,
        completed: contracts.filter((c) => c.status === 'completed').length,
        totalValue: contracts.reduce((sum, c) => sum + (c.total_amount || 0), 0),
    }

    const orderStats = {
        active: orders.filter((c) => c.status === 'active').length,
        completed: orders.filter((c) => c.status === 'completed').length,
        totalValue: orders.reduce((sum, c) => sum + (c.total_amount || 0), 0),
    }

    const handleDeleteContracts = async (rows: any[]) => {
        'use server'
        const ids = rows.map((r) => r.id)
        await deleteContracts(ids)
    }

    const handleDeleteOrders = async (rows: any[]) => {
        'use server'
        const ids = rows.map((r) => r.id)
        await deleteContracts(ids)
    }

    return (
        <ContractsPageTabs
            contracts={contracts}
            orders={orders}
            contractStats={contractStats}
            orderStats={orderStats}
            onDeleteContracts={handleDeleteContracts}
            onDeleteOrders={handleDeleteOrders}
        />
    )
}
