/**
 * RBAC Permission System for Tulie CRM
 * 
 * Roles: admin, leader, staff, accountant
 * 
 * Permission matrix:
 * - admin: full access to everything
 * - leader: manage own team's data, view reports
 * - staff: manage own assigned data only
 * - accountant: view-only for CRM, manage invoices/payments
 */

import { UserRole } from '@/types'

// ============================================
// PERMISSION DEFINITIONS
// ============================================

export type Resource =
    | 'customers'
    | 'leads'
    | 'deals'
    | 'quotations'
    | 'contracts'
    | 'projects'
    | 'invoices'
    | 'retail_orders'
    | 'products'
    | 'templates'
    | 'users'
    | 'settings'
    | 'reports'
    | 'helpdesk'

export type Action = 'view' | 'create' | 'edit' | 'delete' | 'export'

export type DataScope = 'all' | 'team' | 'own' | 'none'

interface PermissionRule {
    actions: Action[]
    dataScope: DataScope
}

// ============================================
// PERMISSION MATRIX
// ============================================

const PERMISSION_MATRIX: Record<UserRole, Record<Resource, PermissionRule>> = {
    admin: {
        customers:     { actions: ['view', 'create', 'edit', 'delete', 'export'], dataScope: 'all' },
        leads:         { actions: ['view', 'create', 'edit', 'delete', 'export'], dataScope: 'all' },
        deals:         { actions: ['view', 'create', 'edit', 'delete', 'export'], dataScope: 'all' },
        quotations:    { actions: ['view', 'create', 'edit', 'delete', 'export'], dataScope: 'all' },
        contracts:     { actions: ['view', 'create', 'edit', 'delete', 'export'], dataScope: 'all' },
        projects:      { actions: ['view', 'create', 'edit', 'delete', 'export'], dataScope: 'all' },
        invoices:      { actions: ['view', 'create', 'edit', 'delete', 'export'], dataScope: 'all' },
        retail_orders: { actions: ['view', 'create', 'edit', 'delete', 'export'], dataScope: 'all' },
        products:      { actions: ['view', 'create', 'edit', 'delete'],           dataScope: 'all' },
        templates:     { actions: ['view', 'create', 'edit', 'delete'],           dataScope: 'all' },
        users:         { actions: ['view', 'create', 'edit', 'delete'],           dataScope: 'all' },
        settings:      { actions: ['view', 'edit'],                               dataScope: 'all' },
        reports:       { actions: ['view', 'export'],                             dataScope: 'all' },
        helpdesk:      { actions: ['view', 'create', 'edit', 'delete'],           dataScope: 'all' },
    },
    leader: {
        customers:     { actions: ['view', 'create', 'edit', 'export'],  dataScope: 'team' },
        leads:         { actions: ['view', 'create', 'edit', 'export'],  dataScope: 'team' },
        deals:         { actions: ['view', 'create', 'edit', 'export'],  dataScope: 'team' },
        quotations:    { actions: ['view', 'create', 'edit', 'export'],  dataScope: 'team' },
        contracts:     { actions: ['view', 'create', 'edit'],            dataScope: 'team' },
        projects:      { actions: ['view', 'create', 'edit'],            dataScope: 'team' },
        invoices:      { actions: ['view', 'export'],                    dataScope: 'team' },
        retail_orders: { actions: ['view', 'create', 'edit'],            dataScope: 'all' },
        products:      { actions: ['view'],                              dataScope: 'all' },
        templates:     { actions: ['view'],                              dataScope: 'all' },
        users:         { actions: ['view'],                              dataScope: 'team' },
        settings:      { actions: ['view'],                              dataScope: 'all' },
        reports:       { actions: ['view', 'export'],                    dataScope: 'team' },
        helpdesk:      { actions: ['view', 'create', 'edit'],            dataScope: 'team' },
    },
    staff: {
        customers:     { actions: ['view', 'create', 'edit'],   dataScope: 'own' },
        leads:         { actions: ['view', 'create', 'edit'],   dataScope: 'own' },
        deals:         { actions: ['view', 'create', 'edit'],   dataScope: 'own' },
        quotations:    { actions: ['view', 'create', 'edit'],   dataScope: 'own' },
        contracts:     { actions: ['view', 'create', 'edit'],   dataScope: 'own' },
        projects:      { actions: ['view', 'create', 'edit'],   dataScope: 'own' },
        invoices:      { actions: ['view'],                     dataScope: 'own' },
        retail_orders: { actions: ['view', 'create', 'edit'],   dataScope: 'all' },
        products:      { actions: ['view'],                     dataScope: 'all' },
        templates:     { actions: ['view'],                     dataScope: 'all' },
        users:         { actions: ['view'],                     dataScope: 'none' },
        settings:      { actions: [],                           dataScope: 'none' },
        reports:       { actions: [],                           dataScope: 'none' },
        helpdesk:      { actions: ['view', 'create', 'edit'],   dataScope: 'own' },
    },
    accountant: {
        customers:     { actions: ['view'],                              dataScope: 'all' },
        leads:         { actions: [],                                    dataScope: 'none' },
        deals:         { actions: ['view'],                              dataScope: 'all' },
        quotations:    { actions: ['view'],                              dataScope: 'all' },
        contracts:     { actions: ['view'],                              dataScope: 'all' },
        projects:      { actions: ['view'],                              dataScope: 'all' },
        invoices:      { actions: ['view', 'create', 'edit', 'export'],  dataScope: 'all' },
        retail_orders: { actions: ['view', 'export'],                    dataScope: 'all' },
        products:      { actions: ['view'],                              dataScope: 'all' },
        templates:     { actions: ['view'],                              dataScope: 'all' },
        users:         { actions: [],                                    dataScope: 'none' },
        settings:      { actions: [],                                    dataScope: 'none' },
        reports:       { actions: ['view', 'export'],                    dataScope: 'all' },
        helpdesk:      { actions: [],                                    dataScope: 'none' },
    },
}

// ============================================
// PERMISSION CHECK FUNCTIONS
// ============================================

/**
 * Check if a role has permission to perform an action on a resource
 */
export function hasPermission(role: UserRole, resource: Resource, action: Action): boolean {
    const rule = PERMISSION_MATRIX[role]?.[resource]
    if (!rule) return false
    return rule.actions.includes(action)
}

/**
 * Get the data scope for a role on a resource
 * Returns: 'all' | 'team' | 'own' | 'none'
 */
export function getDataScope(role: UserRole, resource: Resource): DataScope {
    const rule = PERMISSION_MATRIX[role]?.[resource]
    if (!rule) return 'none'
    return rule.dataScope
}

/**
 * Check if a role can perform any action on a resource
 */
export function canAccess(role: UserRole, resource: Resource): boolean {
    const rule = PERMISSION_MATRIX[role]?.[resource]
    if (!rule) return false
    return rule.actions.length > 0
}

/**
 * Get all allowed actions for a role on a resource
 */
export function getAllowedActions(role: UserRole, resource: Resource): Action[] {
    const rule = PERMISSION_MATRIX[role]?.[resource]
    if (!rule) return []
    return rule.actions
}

// ============================================
// DATA SCOPING HELPERS
// ============================================

export interface UserContext {
    id: string
    role: UserRole
    team_id?: string
    email?: string
}

/**
 * Column mapping for ownership filtering.
 * Maps resource → column name that stores the owner/assignee user ID
 */
const OWNERSHIP_COLUMNS: Record<Resource, string> = {
    customers:     'assigned_to',
    leads:         'assigned_to',
    deals:         'assigned_to',
    quotations:    'created_by',
    contracts:     'created_by',
    projects:      'assigned_to',
    invoices:      'created_by',
    retail_orders: 'created_by',
    products:      'id', // no ownership — scoped by 'all'
    templates:     'id', // no ownership — scoped by 'all'
    users:         'id',
    settings:      'id',
    reports:       'id',
    helpdesk:      'assigned_to',
}

/**
 * Get the ownership column for a resource
 */
export function getOwnershipColumn(resource: Resource): string {
    return OWNERSHIP_COLUMNS[resource] || 'created_by'
}

/**
 * Build a Supabase query filter based on role and data scope.
 * 
 * Usage:
 * ```ts
 * const supabase = await createClient()
 * let query = supabase.from('customers').select('*')
 * query = applyScopeFilter(query, userCtx, 'customers')
 * const { data } = await query
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyScopeFilter(
    query: any,
    user: UserContext,
    resource: Resource,
    teamMemberIds?: string[],
): any {
    const scope = getDataScope(user.role, resource)
    const ownerCol = getOwnershipColumn(resource)

    switch (scope) {
        case 'all':
            // No filter — admin/accountant sees everything
            return query

        case 'team':
            // Leader sees own + team members' data
            if (teamMemberIds && teamMemberIds.length > 0) {
                return query.in(ownerCol, [user.id, ...teamMemberIds])
            }
            // Fallback to own-only if no team info
            return query.eq(ownerCol, user.id)

        case 'own':
            // Staff sees only own data
            return query.eq(ownerCol, user.id)

        case 'none':
            // No access — filter to impossible condition
            return query.eq('id', '00000000-0000-0000-0000-000000000000')

        default:
            return query.eq(ownerCol, user.id)
    }
}

/**
 * Get team member IDs for a leader.
 * Call this once and pass to applyScopeFilter for 'team' scope.
 */
export async function getTeamMemberIds(
    supabase: { from: (table: string) => any },
    userId: string,
    teamId?: string,
): Promise<string[]> {
    if (!teamId) return []
    
    const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('team_id', teamId)
        .neq('id', userId)

    if (error || !data) return []
    return data.map((u: { id: string }) => u.id)
}
