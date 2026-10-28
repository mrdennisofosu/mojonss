import { SUPPORT_STATUS } from '../constants/statuses'

const META = {
  [SUPPORT_STATUS.PENDING]: { label: 'Pending', tone: 'amber' },
  [SUPPORT_STATUS.IN_PROGRESS]: { label: 'In progress', tone: 'brand' },
  [SUPPORT_STATUS.RESOLVED]: { label: 'Resolved', tone: 'green' },
}

export function supportStatusMeta(status) {
  return META[status] ?? { label: status, tone: 'slate' }
}

export const supportStatusOptions = [
  { value: SUPPORT_STATUS.PENDING, label: 'Pending' },
  { value: SUPPORT_STATUS.IN_PROGRESS, label: 'In progress' },
  { value: SUPPORT_STATUS.RESOLVED, label: 'Resolved' },
]

export const supportStatusFilterOptions = [
  { value: '', label: 'All statuses' },
  ...supportStatusOptions,
]