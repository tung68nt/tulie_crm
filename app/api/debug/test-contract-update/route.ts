import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Diagnostic endpoint to test contract update and see exact errors
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { contractId } = body

        if (!contractId) {
            return NextResponse.json({ error: 'contractId required' }, { status: 400 })
        }

        const supabase = await createClient()

        // Step 1: Read the contract
        const { data: contract, error: readError } = await supabase
            .from('contracts')
            .select('id, title, customer_id, status')
            .eq('id', contractId)
            .single()

        if (readError) {
            return NextResponse.json({
                step: 'read_contract',
                error: readError.message,
                code: readError.code,
                details: readError.details,
                hint: readError.hint,
            }, { status: 500 })
        }

        // Step 2: Try a minimal update
        const { error: updateError } = await supabase
            .from('contracts')
            .update({ title: contract.title }) // no-op update
            .eq('id', contractId)

        if (updateError) {
            return NextResponse.json({
                step: 'update_contract',
                error: updateError.message,
                code: updateError.code,
                details: updateError.details,
                hint: updateError.hint,
            }, { status: 500 })
        }

        // Step 3: Read milestones
        const { data: milestones, error: msReadError } = await supabase
            .from('contract_milestones')
            .select('*')
            .eq('contract_id', contractId)

        if (msReadError) {
            return NextResponse.json({
                step: 'read_milestones',
                error: msReadError.message,
                code: msReadError.code,
            }, { status: 500 })
        }

        // Step 4: Check milestone columns
        const columnCheck: Record<string, boolean> = {}
        if (milestones && milestones.length > 0) {
            const first = milestones[0]
            columnCheck.has_amount = 'amount' in first
            columnCheck.has_completed_at = 'completed_at' in first
            columnCheck.has_percentage = 'percentage' in first
            columnCheck.has_type = 'type' in first
            columnCheck.has_project_id = 'project_id' in first
            columnCheck.has_description = 'description' in first
        }

        // Step 5: Try upsert a milestone (dry run — just update existing one)
        if (milestones && milestones.length > 0) {
            const ms = milestones[0]
            const testRow: Record<string, any> = {
                id: ms.id,
                contract_id: contractId,
                name: ms.name || '',
                amount: ms.amount || 0,
                status: ms.status || 'pending',
                type: ms.type || 'payment',
                percentage: ms.percentage || null,
                due_date: ms.due_date || null,
                completed_at: ms.completed_at || null,
                delay_reason: ms.delay_reason || null,
                description: ms.description || null,
            }

            const { error: upsertError } = await supabase
                .from('contract_milestones')
                .upsert([testRow], { onConflict: 'id' })

            if (upsertError) {
                return NextResponse.json({
                    step: 'upsert_milestone',
                    error: upsertError.message,
                    code: upsertError.code,
                    details: upsertError.details,
                    hint: upsertError.hint,
                    testRow,
                }, { status: 500 })
            }
        }

        // Step 6: Try logActivity
        try {
            const { logActivity } = await import('@/lib/supabase/services/activity-service')
            await logActivity({
                action: 'update',
                entity_type: 'contract',
                entity_id: contractId,
                description: `[DIAG] Test update: ${contract.title}`
            })
        } catch (logErr: any) {
            return NextResponse.json({
                step: 'log_activity',
                error: logErr.message,
                stack: logErr.stack?.split('\n').slice(0, 5),
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            contract: { id: contract.id, title: contract.title },
            milestoneCount: milestones?.length || 0,
            columnCheck,
            message: 'All steps passed! The issue may be in revalidatePath or page rendering.'
        })

    } catch (err: any) {
        return NextResponse.json({
            step: 'unexpected',
            error: err.message,
            stack: err.stack?.split('\n').slice(0, 5),
        }, { status: 500 })
    }
}
