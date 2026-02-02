import { UserRole } from '@/types'

// User Roles
export const ROLES = {
    ADMIN: 'admin' as UserRole,
    LEADER: 'leader' as UserRole,
    STAFF: 'staff' as UserRole,
    ACCOUNTANT: 'accountant' as UserRole,
} as const

export const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Quản trị viên',
    leader: 'Trưởng nhóm',
    staff: 'Nhân viên',
    accountant: 'Kế toán',
}

export const ROLE_COLORS: Record<UserRole, string> = {
    admin: 'bg-black text-white',
    leader: 'bg-gray-800 text-white',
    staff: 'bg-gray-600 text-white',
    accountant: 'bg-gray-500 text-white',
}
