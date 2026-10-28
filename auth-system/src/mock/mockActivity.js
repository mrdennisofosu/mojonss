// MOCK DATA: the activity log. Deleted when the real backend is connected.
// Services call recordActivity() whenever something noteworthy happens.
// The list is kept newest first.

import { ACTIVITY_TYPE as T } from '../constants/activity'

function entry(number, type, actorName, actorEmail, description, createdAt) {
  return { id: `act-${String(number).padStart(3, '0')}`, type, actorName, actorEmail, description, createdAt }
}

const ADMIN = ['Kwame Asante', 'admin@example.com']

export const mockActivities = [
  entry(1, T.LOGIN, 'Comfort Appiah', 'comfort.appiah@example.com', 'Signed in.', '2026-10-16T12:00:00Z'),
  entry(2, T.LOGIN, 'Akosua Frimpong', 'akosua.frimpong@example.com', 'Signed in.', '2026-10-16T09:20:00Z'),
  entry(3, T.LOGIN, 'Ewurabena Baidoo', 'ewurabena.baidoo@example.com', 'Signed in.', '2026-10-16T07:55:00Z'),
  entry(4, T.LOGIN_FAILED, 'Unknown', 'someone@example.com', 'Failed sign-in attempt (wrong email or password).', '2026-10-15T20:12:00Z'),
  entry(5, T.LOGIN, 'Ama Mensah', 'user@example.com', 'Signed in.', '2026-10-15T17:45:00Z'),
  entry(6, T.LOGIN, 'Naa Dedei Ankrah', 'naa.ankrah@example.com', 'Signed in.', '2026-10-15T08:00:00Z'),
  entry(7, T.LOGIN, ...ADMIN, 'Signed in.', '2026-10-14T08:30:00Z'),
  entry(8, T.ADMIN_ACTION, ...ADMIN, 'Published the announcement "Scheduled maintenance this weekend".', '2026-10-14T08:00:00Z'),
  entry(9, T.LOGIN_FAILED, 'Kofi Boateng', 'inactive@example.com', 'Sign-in blocked: the account is deactivated.', '2026-10-13T11:05:00Z'),
  entry(10, T.ROLE_CHANGED, ...ADMIN, 'Changed the role of Efua Owusu to User.', '2026-10-12T16:40:00Z'),
  entry(11, T.REGISTER, 'Efua Owusu', 'unverified@example.com', 'Registered a new account.', '2026-10-12T16:25:00Z'),
  entry(12, T.ADMIN_ACTION, ...ADMIN, 'Published the announcement "Welcome to the new platform".', '2026-10-12T09:00:00Z'),
  entry(13, T.PASSWORD_CHANGED, 'Ama Mensah', 'user@example.com', 'Changed their password.', '2026-10-10T09:05:00Z'),
  entry(14, T.ADMIN_ACTION, ...ADMIN, 'Published the announcement "Password security reminder".', '2026-10-08T09:30:00Z'),
  entry(15, T.REGISTER, 'Prince Opoku', 'prince.opoku@example.com', 'Registered a new account.', '2026-10-03T09:35:00Z'),
  entry(16, T.ACCOUNT_DEACTIVATED, ...ADMIN, 'Deactivated the account of Kofi Boateng.', '2026-08-02T10:10:00Z'),
]

let nextActivityNumber = 17

// Adds a new event at the top of the list (newest first)
export function recordActivity({ type, actorName, actorEmail, description }) {
  mockActivities.unshift(
    entry(nextActivityNumber, type, actorName, actorEmail, description, new Date().toISOString()),
  )
  nextActivityNumber += 1
}