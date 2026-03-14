import { UserRole } from '@/types'

// User Roles — constants for the 14 marketing agency positions
export const ROLES = {
    CEO: 'ceo' as UserRole,
    CREATIVE_DIRECTOR: 'creative_director' as UserRole,
    ACCOUNT_MANAGER: 'account_manager' as UserRole,
    ACCOUNT_EXECUTIVE: 'account_executive' as UserRole,
    PROJECT_MANAGER: 'project_manager' as UserRole,
    DESIGNER: 'designer' as UserRole,
    COPYWRITER: 'copywriter' as UserRole,
    SOCIAL_MEDIA: 'social_media' as UserRole,
    MEDIA_BUYER: 'media_buyer' as UserRole,
    PHOTOGRAPHER: 'photographer' as UserRole,
    VIDEO_EDITOR: 'video_editor' as UserRole,
    ACCOUNTANT: 'accountant' as UserRole,
    HR_ADMIN: 'hr_admin' as UserRole,
    INTERN: 'intern' as UserRole,
    // Legacy (backward compat)
    ADMIN: 'admin' as UserRole,
    LEADER: 'leader' as UserRole,
    STAFF: 'staff' as UserRole,
} as const

export const ROLE_LABELS: Record<UserRole, string> = {
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
    // Legacy labels
    admin: 'Admin (legacy)',
    leader: 'Leader (legacy)',
    staff: 'Staff (legacy)',
}

export const ROLE_COLORS: Record<UserRole, string> = {
    ceo: 'bg-black text-white',
    creative_director: 'bg-violet-700 text-white',
    account_manager: 'bg-blue-700 text-white',
    account_executive: 'bg-blue-600 text-white',
    project_manager: 'bg-emerald-700 text-white',
    designer: 'bg-pink-600 text-white',
    copywriter: 'bg-amber-600 text-white',
    social_media: 'bg-cyan-600 text-white',
    media_buyer: 'bg-orange-600 text-white',
    photographer: 'bg-rose-600 text-white',
    video_editor: 'bg-indigo-600 text-white',
    accountant: 'bg-gray-700 text-white',
    hr_admin: 'bg-teal-600 text-white',
    intern: 'bg-gray-400 text-white',
    // Legacy colors
    admin: 'bg-black text-white',
    leader: 'bg-gray-800 text-white',
    staff: 'bg-gray-600 text-white',
}
