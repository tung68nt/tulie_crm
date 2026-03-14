/**
 * RBAC Permission System for Tulie CRM — Marketing Agency Edition
 * 
 * 14 Positions (expanded from 4 legacy roles):
 * - ceo: Full access to everything
 * - creative_director: Manage creative team, approve creative work
 * - account_manager: Manage clients, deals, quotations
 * - account_executive: Support AM, create proposals
 * - project_manager: Manage all projects, tasks, milestones
 * - designer: View own assigned tasks/projects
 * - copywriter: View own assigned tasks/projects
 * - social_media: Social media management
 * - media_buyer: Ad campaigns, budget tracking
 * - photographer: Studio operations
 * - video_editor: Creative production
 * - accountant: Finance, invoices, payments
 * - hr_admin: HR & admin
 * - intern: Limited view access
 * 
 * Legacy roles (admin, leader, staff) are mapped to new positions.
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
    | 'tasks'
    | 'invoices'
    | 'retail_orders'
    | 'products'
    | 'templates'
    | 'users'
    | 'settings'
    | 'reports'
    | 'helpdesk'
    | 'workspace'
    | 'team_performance'

export type Action = 'view' | 'create' | 'edit' | 'delete' | 'export'

export type DataScope = 'all' | 'team' | 'own' | 'none'

interface PermissionRule {
    actions: Action[]
    dataScope: DataScope
}

// ============================================
// HELPER: Build permission rule
// ============================================
const ALL_ACTIONS: Action[] = ['view', 'create', 'edit', 'delete', 'export']
const CRUD: Action[] = ['view', 'create', 'edit', 'delete']
const CRU: Action[] = ['view', 'create', 'edit']
const VIEW_ONLY: Action[] = ['view']
const VIEW_EXPORT: Action[] = ['view', 'export']
const NONE: Action[] = []

function p(actions: Action[], dataScope: DataScope): PermissionRule {
    return { actions, dataScope }
}

// ============================================
// LEGACY ROLE MAPPING
// ============================================
export function mapLegacyRole(role: UserRole): UserRole {
    switch (role) {
        case 'admin': return 'ceo'
        case 'leader': return 'project_manager'
        case 'staff': return 'designer' // default staff → designer
        default: return role
    }
}

/**
 * Get effective role (handles legacy mapping)
 */
export function getEffectiveRole(role: UserRole): UserRole {
    if (['admin', 'leader', 'staff'].includes(role)) {
        return mapLegacyRole(role)
    }
    return role
}

// ============================================
// PERMISSION MATRIX — 14 positions × 17 resources
// ============================================

const PERMISSION_MATRIX: Record<string, Record<Resource, PermissionRule>> = {
    // ─── MANAGEMENT ───────────────────────────────────
    ceo: {
        customers:        p(ALL_ACTIONS, 'all'),
        leads:            p(ALL_ACTIONS, 'all'),
        deals:            p(ALL_ACTIONS, 'all'),
        quotations:       p(ALL_ACTIONS, 'all'),
        contracts:        p(ALL_ACTIONS, 'all'),
        projects:         p(ALL_ACTIONS, 'all'),
        tasks:            p(ALL_ACTIONS, 'all'),
        invoices:         p(ALL_ACTIONS, 'all'),
        retail_orders:    p(ALL_ACTIONS, 'all'),
        products:         p(CRUD, 'all'),
        templates:        p(CRUD, 'all'),
        users:            p(CRUD, 'all'),
        settings:         p(['view', 'edit'], 'all'),
        reports:          p(VIEW_EXPORT, 'all'),
        helpdesk:         p(CRUD, 'all'),
        workspace:        p(ALL_ACTIONS, 'all'),
        team_performance: p(VIEW_EXPORT, 'all'),
    },

    // ─── CREATIVE ─────────────────────────────────────
    creative_director: {
        customers:        p(VIEW_ONLY, 'all'),
        leads:            p(NONE, 'none'),
        deals:            p(VIEW_ONLY, 'all'),
        quotations:       p(VIEW_ONLY, 'all'),
        contracts:        p(VIEW_ONLY, 'all'),
        projects:         p(CRU, 'team'),
        tasks:            p(CRUD, 'team'),
        invoices:         p(NONE, 'none'),
        retail_orders:    p(VIEW_ONLY, 'all'),
        products:         p(VIEW_ONLY, 'all'),
        templates:        p(VIEW_ONLY, 'all'),
        users:            p(VIEW_ONLY, 'team'),
        settings:         p(NONE, 'none'),
        reports:          p(VIEW_EXPORT, 'team'),
        helpdesk:         p(CRU, 'team'),
        workspace:        p(CRU, 'all'),
        team_performance: p(VIEW_EXPORT, 'team'),
    },

    // ─── SALES / ACCOUNT ──────────────────────────────
    account_manager: {
        customers:        p(CRUD, 'own'),
        leads:            p(CRUD, 'own'),
        deals:            p(CRUD, 'own'),
        quotations:       p(CRUD, 'own'),
        contracts:        p(CRU, 'own'),
        projects:         p(VIEW_ONLY, 'own'),
        tasks:            p(CRU, 'own'),
        invoices:         p(VIEW_ONLY, 'own'),
        retail_orders:    p(NONE, 'none'),
        products:         p(VIEW_ONLY, 'all'),
        templates:        p(VIEW_ONLY, 'all'),
        users:            p(NONE, 'none'),
        settings:         p(NONE, 'none'),
        reports:          p(VIEW_EXPORT, 'own'),
        helpdesk:         p(CRU, 'own'),
        workspace:        p(CRU, 'own'),
        team_performance: p(NONE, 'none'),
    },

    account_executive: {
        customers:        p(CRU, 'own'),
        leads:            p(CRU, 'own'),
        deals:            p(CRU, 'own'),
        quotations:       p(CRU, 'own'),
        contracts:        p(VIEW_ONLY, 'own'),
        projects:         p(VIEW_ONLY, 'own'),
        tasks:            p(CRU, 'own'),
        invoices:         p(VIEW_ONLY, 'own'),
        retail_orders:    p(NONE, 'none'),
        products:         p(VIEW_ONLY, 'all'),
        templates:        p(VIEW_ONLY, 'all'),
        users:            p(NONE, 'none'),
        settings:         p(NONE, 'none'),
        reports:          p(VIEW_ONLY, 'own'),
        helpdesk:         p(CRU, 'own'),
        workspace:        p(CRU, 'own'),
        team_performance: p(NONE, 'none'),
    },

    // ─── OPERATIONS ───────────────────────────────────
    project_manager: {
        customers:        p(VIEW_ONLY, 'all'),
        leads:            p(NONE, 'none'),
        deals:            p(VIEW_ONLY, 'all'),
        quotations:       p(CRU, 'all'),
        contracts:        p(CRU, 'all'),
        projects:         p(CRUD, 'all'),
        tasks:            p(CRUD, 'all'),
        invoices:         p(VIEW_ONLY, 'all'),
        retail_orders:    p(VIEW_ONLY, 'all'),
        products:         p(VIEW_ONLY, 'all'),
        templates:        p(VIEW_ONLY, 'all'),
        users:            p(VIEW_ONLY, 'all'),
        settings:         p(NONE, 'none'),
        reports:          p(VIEW_EXPORT, 'all'),
        helpdesk:         p(CRU, 'all'),
        workspace:        p(CRUD, 'all'),
        team_performance: p(VIEW_EXPORT, 'all'),
    },

    // ─── CREATIVE TEAM ────────────────────────────────
    designer: {
        customers:        p(NONE, 'none'),
        leads:            p(NONE, 'none'),
        deals:            p(NONE, 'none'),
        quotations:       p(NONE, 'none'),
        contracts:        p(NONE, 'none'),
        projects:         p(VIEW_ONLY, 'own'),
        tasks:            p(CRU, 'own'),
        invoices:         p(NONE, 'none'),
        retail_orders:    p(NONE, 'none'),
        products:         p(VIEW_ONLY, 'all'),
        templates:        p(NONE, 'none'),
        users:            p(NONE, 'none'),
        settings:         p(NONE, 'none'),
        reports:          p(NONE, 'none'),
        helpdesk:         p(CRU, 'own'),
        workspace:        p(CRU, 'own'),
        team_performance: p(NONE, 'none'),
    },

    copywriter: {
        customers:        p(NONE, 'none'),
        leads:            p(NONE, 'none'),
        deals:            p(NONE, 'none'),
        quotations:       p(NONE, 'none'),
        contracts:        p(NONE, 'none'),
        projects:         p(VIEW_ONLY, 'own'),
        tasks:            p(CRU, 'own'),
        invoices:         p(NONE, 'none'),
        retail_orders:    p(NONE, 'none'),
        products:         p(VIEW_ONLY, 'all'),
        templates:        p(NONE, 'none'),
        users:            p(NONE, 'none'),
        settings:         p(NONE, 'none'),
        reports:          p(NONE, 'none'),
        helpdesk:         p(CRU, 'own'),
        workspace:        p(CRU, 'own'),
        team_performance: p(NONE, 'none'),
    },

    // ─── MARKETING ────────────────────────────────────
    social_media: {
        customers:        p(NONE, 'none'),
        leads:            p(CRU, 'own'),
        deals:            p(NONE, 'none'),
        quotations:       p(NONE, 'none'),
        contracts:        p(NONE, 'none'),
        projects:         p(VIEW_ONLY, 'own'),
        tasks:            p(CRU, 'own'),
        invoices:         p(NONE, 'none'),
        retail_orders:    p(NONE, 'none'),
        products:         p(VIEW_ONLY, 'all'),
        templates:        p(NONE, 'none'),
        users:            p(NONE, 'none'),
        settings:         p(NONE, 'none'),
        reports:          p(VIEW_ONLY, 'own'),
        helpdesk:         p(CRU, 'own'),
        workspace:        p(CRU, 'own'),
        team_performance: p(NONE, 'none'),
    },

    media_buyer: {
        customers:        p(NONE, 'none'),
        leads:            p(CRU, 'own'),
        deals:            p(VIEW_ONLY, 'own'),
        quotations:       p(NONE, 'none'),
        contracts:        p(NONE, 'none'),
        projects:         p(VIEW_ONLY, 'own'),
        tasks:            p(CRU, 'own'),
        invoices:         p(VIEW_ONLY, 'own'),
        retail_orders:    p(NONE, 'none'),
        products:         p(VIEW_ONLY, 'all'),
        templates:        p(NONE, 'none'),
        users:            p(NONE, 'none'),
        settings:         p(NONE, 'none'),
        reports:          p(VIEW_EXPORT, 'own'),
        helpdesk:         p(CRU, 'own'),
        workspace:        p(CRU, 'own'),
        team_performance: p(NONE, 'none'),
    },

    // ─── STUDIO ───────────────────────────────────────
    photographer: {
        customers:        p(NONE, 'none'),
        leads:            p(NONE, 'none'),
        deals:            p(NONE, 'none'),
        quotations:       p(NONE, 'none'),
        contracts:        p(NONE, 'none'),
        projects:         p(VIEW_ONLY, 'own'),
        tasks:            p(CRU, 'own'),
        invoices:         p(NONE, 'none'),
        retail_orders:    p(CRU, 'all'),
        products:         p(VIEW_ONLY, 'all'),
        templates:        p(NONE, 'none'),
        users:            p(NONE, 'none'),
        settings:         p(NONE, 'none'),
        reports:          p(NONE, 'none'),
        helpdesk:         p(CRU, 'own'),
        workspace:        p(CRU, 'own'),
        team_performance: p(NONE, 'none'),
    },

    video_editor: {
        customers:        p(NONE, 'none'),
        leads:            p(NONE, 'none'),
        deals:            p(NONE, 'none'),
        quotations:       p(NONE, 'none'),
        contracts:        p(NONE, 'none'),
        projects:         p(VIEW_ONLY, 'own'),
        tasks:            p(CRU, 'own'),
        invoices:         p(NONE, 'none'),
        retail_orders:    p(NONE, 'none'),
        products:         p(VIEW_ONLY, 'all'),
        templates:        p(NONE, 'none'),
        users:            p(NONE, 'none'),
        settings:         p(NONE, 'none'),
        reports:          p(NONE, 'none'),
        helpdesk:         p(CRU, 'own'),
        workspace:        p(CRU, 'own'),
        team_performance: p(NONE, 'none'),
    },

    // ─── FINANCE ──────────────────────────────────────
    accountant: {
        customers:        p(VIEW_ONLY, 'all'),
        leads:            p(NONE, 'none'),
        deals:            p(VIEW_ONLY, 'all'),
        quotations:       p(VIEW_ONLY, 'all'),
        contracts:        p(VIEW_ONLY, 'all'),
        projects:         p(VIEW_ONLY, 'all'),
        tasks:            p(VIEW_ONLY, 'all'),
        invoices:         p(ALL_ACTIONS, 'all'),
        retail_orders:    p(VIEW_EXPORT, 'all'),
        products:         p(VIEW_ONLY, 'all'),
        templates:        p(VIEW_ONLY, 'all'),
        users:            p(NONE, 'none'),
        settings:         p(NONE, 'none'),
        reports:          p(VIEW_EXPORT, 'all'),
        helpdesk:         p(NONE, 'none'),
        workspace:        p(CRU, 'own'),
        team_performance: p(NONE, 'none'),
    },

    // ─── ADMIN / HR ───────────────────────────────────
    hr_admin: {
        customers:        p(VIEW_ONLY, 'all'),
        leads:            p(NONE, 'none'),
        deals:            p(VIEW_ONLY, 'all'),
        quotations:       p(VIEW_ONLY, 'all'),
        contracts:        p(VIEW_ONLY, 'all'),
        projects:         p(VIEW_ONLY, 'all'),
        tasks:            p(VIEW_ONLY, 'all'),
        invoices:         p(VIEW_ONLY, 'all'),
        retail_orders:    p(VIEW_ONLY, 'all'),
        products:         p(VIEW_ONLY, 'all'),
        templates:        p(VIEW_ONLY, 'all'),
        users:            p(CRUD, 'all'),
        settings:         p(['view', 'edit'], 'all'),
        reports:          p(VIEW_EXPORT, 'all'),
        helpdesk:         p(CRU, 'all'),
        workspace:        p(CRU, 'own'),
        team_performance: p(VIEW_ONLY, 'all'),
    },

    // ─── INTERN ───────────────────────────────────────
    intern: {
        customers:        p(NONE, 'none'),
        leads:            p(NONE, 'none'),
        deals:            p(NONE, 'none'),
        quotations:       p(NONE, 'none'),
        contracts:        p(NONE, 'none'),
        projects:         p(VIEW_ONLY, 'own'),
        tasks:            p(VIEW_ONLY, 'own'),
        invoices:         p(NONE, 'none'),
        retail_orders:    p(NONE, 'none'),
        products:         p(VIEW_ONLY, 'all'),
        templates:        p(NONE, 'none'),
        users:            p(NONE, 'none'),
        settings:         p(NONE, 'none'),
        reports:          p(NONE, 'none'),
        helpdesk:         p(VIEW_ONLY, 'own'),
        workspace:        p(VIEW_ONLY, 'own'),
        team_performance: p(NONE, 'none'),
    },
}

// ============================================
// PERMISSION CHECK FUNCTIONS
// ============================================

/**
 * Check if a role has permission to perform an action on a resource
 */
export function hasPermission(role: UserRole, resource: Resource, action: Action): boolean {
    const effectiveRole = getEffectiveRole(role)
    const rule = PERMISSION_MATRIX[effectiveRole]?.[resource]
    if (!rule) return false
    return rule.actions.includes(action)
}

/**
 * Get the data scope for a role on a resource
 * Returns: 'all' | 'team' | 'own' | 'none'
 */
export function getDataScope(role: UserRole, resource: Resource): DataScope {
    const effectiveRole = getEffectiveRole(role)
    const rule = PERMISSION_MATRIX[effectiveRole]?.[resource]
    if (!rule) return 'none'
    return rule.dataScope
}

/**
 * Check if a role can perform any action on a resource
 */
export function canAccess(role: UserRole, resource: Resource): boolean {
    const effectiveRole = getEffectiveRole(role)
    const rule = PERMISSION_MATRIX[effectiveRole]?.[resource]
    if (!rule) return false
    return rule.actions.length > 0
}

/**
 * Get all allowed actions for a role on a resource
 */
export function getAllowedActions(role: UserRole, resource: Resource): Action[] {
    const effectiveRole = getEffectiveRole(role)
    const rule = PERMISSION_MATRIX[effectiveRole]?.[resource]
    if (!rule) return []
    return rule.actions
}

/**
 * Check if a role is a management/director level
 */
export function isManagement(role: UserRole): boolean {
    const effectiveRole = getEffectiveRole(role)
    return ['ceo', 'creative_director', 'project_manager'].includes(effectiveRole)
}

/**
 * Get the display name for a role
 */
export function getRoleDisplayName(role: UserRole): string {
    const names: Record<string, string> = {
        ceo: 'CEO / Giám đốc',
        creative_director: 'Giám đốc Sáng tạo',
        account_manager: 'Account Manager',
        account_executive: 'Account Executive',
        project_manager: 'Project Manager',
        designer: 'Designer',
        copywriter: 'Copywriter',
        social_media: 'Social Media',
        media_buyer: 'Media Buyer',
        photographer: 'Photographer',
        video_editor: 'Video Editor',
        accountant: 'Kế toán',
        hr_admin: 'HR & Admin',
        intern: 'Intern / Thực tập',
        // Legacy
        admin: 'Admin (legacy)',
        leader: 'Leader (legacy)',
        staff: 'Staff (legacy)',
    }
    return names[role] || role
}

// ============================================
// DATA SCOPING HELPERS
// ============================================

export interface UserContext {
    id: string
    role: UserRole
    team_id?: string
    email?: string
    department?: string
}

/**
 * Column mapping for ownership filtering.
 * Maps resource → column name that stores the owner/assignee user ID
 */
const OWNERSHIP_COLUMNS: Record<Resource, string> = {
    customers:        'assigned_to',
    leads:            'assigned_to',
    deals:            'assigned_to',
    quotations:       'created_by',
    contracts:        'created_by',
    projects:         'assigned_to',
    tasks:            'assigned_to',
    invoices:         'created_by',
    retail_orders:    'created_by',
    products:         'id', // no ownership — scoped by 'all'
    templates:        'id', // no ownership — scoped by 'all'
    users:            'id',
    settings:         'id',
    reports:          'id',
    helpdesk:         'assigned_to',
    workspace:        'assigned_to',
    team_performance: 'id',
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
            // Director sees own + team members' data
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
 * Get team member IDs for a director/manager.
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
