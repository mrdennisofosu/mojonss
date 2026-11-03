import { ACTIVITY_TYPE } from '../constants/activity'

// How each kind of event is shown in the activity log:
//   label = badge text, tone = badge colour, group = which filter it belongs to.

// The original entries
const LEGACY_META = {
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
  [ACTIVITY_TYPE.SESSION_REVOKED]: { label: 'Session signed out', tone: 'amber', group: 'sessions' },
}

// The types the Django backend sends
const BACKEND_META = {
  login: { label: 'Sign-in', tone: 'green', group: 'signins' },
  login_failed: { label: 'Failed sign-in', tone: 'red', group: 'failed' },
  logout: { label: 'Sign-out', tone: 'slate', group: 'sessions' },
  session_revoked: { label: 'Session signed out', tone: 'amber', group: 'sessions' },
  password_change: { label: 'Password changed', tone: 'amber', group: 'passwords' },
  role_change: { label: 'Role changed', tone: 'brand', group: 'roles' },
  account_status: { label: 'Account status', tone: 'amber', group: 'status' },
  status_change: { label: 'Account change', tone: 'slate', group: 'status' },
  user_create: { label: 'Account created', tone: 'brand', group: 'registrations' },
  email_verified: { label: 'Email verified', tone: 'green', group: 'registrations' },
  profile_updated: { label: 'Details updated', tone: 'slate', group: 'profile' },
  settings_changed: { label: 'Settings changed', tone: 'slate', group: 'admin' },
  support_request: { label: 'Support request', tone: 'brand', group: 'support' },
  support_reply: { label: 'Support reply', tone: 'brand', group: 'support' },
  announcement: { label: 'Announcement', tone: 'brand', group: 'announcements' },
}

export const ACTIVITY_META = { ...LEGACY_META, ...BACKEND_META }

export function getActivityMeta(type) {
  return (
    ACTIVITY_META[type] ?? {
      label: type ? String(type).replace(/_/g, ' ') : 'Activity',
      tone: 'slate',
      group: 'admin',
    }
  )
}

export const activityGroupOptions = [
  { value: '', label: 'All activity' },
  { value: 'signins', label: 'Sign-ins' },
  { value: 'failed', label: 'Failed sign-ins' },
  { value: 'passwords', label: 'Password changes' },
  { value: 'status', label: 'Account activation / deactivation' },
  { value: 'roles', label: 'Role changes' },
  { value: 'registrations', label: 'Registrations' },
  { value: 'profile', label: 'Profile updates' },
  { value: 'sessions', label: 'Session sign-outs' },
  { value: 'support', label: 'Support' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'admin', label: 'Administrative actions' },
]