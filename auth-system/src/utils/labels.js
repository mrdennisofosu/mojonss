import { ACCOUNT_STATUS } from '../constants/statuses'

// Human-friendly text for the internal values

const LEVEL_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  user: 'User',
}

// Accepts a level ('super_admin', 'admin', 'user') or the older role ('admin', 'user')
export function roleLabel(role) {
  return LEVEL_LABELS[role] ?? 'User'
}

export function statusLabel(status) {
  return status === ACCOUNT_STATUS.ACTIVE ? 'Active' : 'Inactive'
}

// Options for <Select> dropdowns
export const roleOptions = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
]

export const roleFilterOptions = [{ value: '', label: 'All roles' }, ...roleOptions]

export const statusFilterOptions = [
  { value: '', label: 'All statuses' },
  { value: ACCOUNT_STATUS.ACTIVE, label: 'Active' },
  { value: ACCOUNT_STATUS.INACTIVE, label: 'Inactive' },
]