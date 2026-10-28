import { ROLES } from '../constants/roles'
import { ACCOUNT_STATUS } from '../constants/statuses'

// Human-friendly text for the internal values

export function roleLabel(role) {
  return role === ROLES.ADMIN ? 'Administrator' : 'User'
}

export function statusLabel(status) {
  return status === ACCOUNT_STATUS.ACTIVE ? 'Active' : 'Inactive'
}

// Options for <Select> dropdowns
export const roleOptions = [
  { value: ROLES.ADMIN, label: 'Administrator' },
  { value: ROLES.USER, label: 'User' },
]

export const roleFilterOptions = [{ value: '', label: 'All roles' }, ...roleOptions]

export const statusFilterOptions = [
  { value: '', label: 'All statuses' },
  { value: ACCOUNT_STATUS.ACTIVE, label: 'Active' },
  { value: ACCOUNT_STATUS.INACTIVE, label: 'Inactive' },
]