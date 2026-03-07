import { getCustomers } from '@/lib/supabase/services/customer-service'
import NewProjectClient from './new-project-client'

export const dynamic = 'force-dynamic'

export default async function NewProjectPage() {
    const customers = await getCustomers()

    return <NewProjectClient customers={customers} />
}
