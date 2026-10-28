import { ACTIVITY_TYPE } from '../constants/activity'

// How each kind of event is shown in the activity log:
//   label = badge text, tone = badge colour, group = which filter it belongs to.
export const ACTIVITY_META = {
  [ACTIVITY_TYPE.LOGIN]: { label: 'Sign-in', tone: 'green', group: 'signins' },
  [ACTIVITY_TYPE.LOGIN_FAILED]: { label: 'Failed sign-in', tone: 'red', group: 'failed' },
  [ACTIVITY_TYPE.REGISTER]: { label: 'Registration', tone: 'brand', group: 'registrations' },
  [ACTIVITY_TYPE.EMAIL_VERIFIED]: { label: 'Email verified', tone: 'brand', group: 'registrations' },
  [ACTIVITY_TYPE.PASSWORD_CHANGED]: { label: 'Password changed', tone: 'amber', group: 'passwords' },
  [ACTIVITY_TYPE.PASSWORD_RESET_REQUESTED]: { label: 'Reset requested', tone: 'amber', group: 'passwords' },
  [ACTIVITY_TYPE.PASSWORD_RESET]: { label: 'Password reset', tone: 'amber', group: 'passwords' },
  [ACTIVITY_TYPE.ACCOUNT_ACTIVATED]: { label: 'Account activated', tone: 'green', group: 'status' },
  [ACTIVITY_TYPE.ACCOUNT_DEACTIVATED]: { label: 'Account deactivated', tone: 'red', group: 'status' },
  [ACTIVITY_TYPE.ROLE_CHANGED]: { label: 'Role changed', tone: 'brand', group: 'roles' },
  [ACTIVITY_TYPE.ADMIN_ACTION]: { label: 'Admin action', tone: 'slate', group: 'admin' },
  [ACTIVITY_TYPE.PROFILE_UPDATED]: { label: 'Profile updated', tone: 'slate', group: 'profile' },
  [ACTIVITY_TYPE.SESSION_REVOKED]: { label: 'Session signed out', tone: 'amber', group: 'sessions' },}

export function getActivityMeta(type) {
  return ACTIVITY_META[type] ?? { label: type, tone: 'slate', group: 'admin' }
}

export const activityGroupOptions = [
  { value: '', label: 'All activity' },
  { value: 'signins', label: 'Sign-ins' },
  { value: 'failed', label: 'Failed sign-ins' },
  { value: 'passwords', label: 'Password changes' },
  { value: 'status', label: 'Account activation / deactivation' },
  { value: 'roles', label: 'Role changes' },
  { value: 'admin', label: 'Administrative actions' },
  { value: 'registrations', label: 'Registrations' },
  { value: 'profile', label: 'Profile updates' },
  { value: 'sessions', label: 'Session sign-outs' }, ]