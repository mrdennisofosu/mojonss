// MOCK DATA: fake accounts for frontend development only.
// - NOT real people and NOT real credentials.
// - Passwords are plain text ONLY because this is pretend data. A real backend stores hashes.
// - This is NOT secure authentication. Deleted when the real backend is connected.

import { ROLES } from '../constants/roles'
import { ACCOUNT_STATUS } from '../constants/statuses'

export const MOCK_PASSWORD = 'Mock@1234'

// Keeps the long list below short and readable
function account(number, fullName, email, options = {}) {
  const {
    role = ROLES.USER,
    status = ACCOUNT_STATUS.ACTIVE,
    emailVerified = true,
    createdAt,
    lastLogin = null,
  } = options

  return {
    id: `u-${String(number).padStart(3, '0')}`,
    fullName,
    email,
    password: MOCK_PASSWORD,
    role,
    status,
    emailVerified,
    createdAt,
    lastLogin,
  }
}

const INACTIVE = ACCOUNT_STATUS.INACTIVE

export const mockUsers = [
  // The four accounts used for testing sign-in
  account(1, 'Kwame Asante', 'admin@example.com', { role: ROLES.ADMIN, createdAt: '2026-01-10T09:00:00Z', lastLogin: '2026-10-14T08:30:00Z' }),
  account(2, 'Ama Mensah', 'user@example.com', { createdAt: '2026-02-03T11:15:00Z', lastLogin: '2026-10-15T17:45:00Z' }),
  account(3, 'Kofi Boateng', 'inactive@example.com', { status: INACTIVE, createdAt: '2026-03-21T14:00:00Z', lastLogin: '2026-08-02T10:10:00Z' }),
  account(4, 'Efua Owusu', 'unverified@example.com', { emailVerified: false, createdAt: '2026-10-12T16:20:00Z' }),

  // More accounts so lists, filters and pagination have something to show
  account(5, 'Yaw Adjei', 'yaw.adjei@example.com', { status: INACTIVE, createdAt: '2026-04-02T08:00:00Z', lastLogin: '2026-07-11T12:00:00Z' }),
  account(6, 'Akosua Frimpong', 'akosua.frimpong@example.com', { createdAt: '2026-04-18T10:30:00Z', lastLogin: '2026-10-16T09:20:00Z' }),
  account(7, 'Abena Sarpong', 'abena.sarpong@example.com', { createdAt: '2026-05-05T13:10:00Z', lastLogin: '2026-10-09T15:00:00Z' }),
  account(8, 'Nana Yaw Owusu', 'nana.owusu@example.com', { createdAt: '2026-05-22T09:45:00Z', lastLogin: '2026-10-10T08:05:00Z' }),
  account(9, 'Esi Quaye', 'esi.quaye@example.com', { status: INACTIVE, createdAt: '2026-05-30T16:00:00Z', lastLogin: '2026-06-20T11:00:00Z' }),
  account(10, 'Kwabena Darko', 'kwabena.darko@example.com', { createdAt: '2026-06-08T07:50:00Z', lastLogin: '2026-10-12T18:30:00Z' }),
  account(11, 'Adwoa Tetteh', 'adwoa.tetteh@example.com', { createdAt: '2026-06-14T12:20:00Z', lastLogin: '2026-10-13T10:10:00Z' }),
  account(12, 'Selorm Agbenyega', 'selorm.agbenyega@example.com', { createdAt: '2026-06-27T14:40:00Z', lastLogin: '2026-09-30T09:00:00Z' }),
  account(13, 'Mawuli Dzakpasu', 'mawuli.dzakpasu@example.com', { createdAt: '2026-07-03T09:00:00Z', lastLogin: '2026-10-11T14:25:00Z' }),
  account(14, 'Naa Dedei Ankrah', 'naa.ankrah@example.com', { role: ROLES.ADMIN, createdAt: '2026-07-09T11:30:00Z', lastLogin: '2026-10-15T08:00:00Z' }),
  account(15, 'Fiifi Ansah', 'fiifi.ansah@example.com', { createdAt: '2026-07-21T15:15:00Z', lastLogin: '2026-10-08T17:40:00Z' }),
  account(16, 'Maame Serwaa', 'maame.serwaa@example.com', { createdAt: '2026-08-04T10:00:00Z', lastLogin: '2026-10-14T12:45:00Z' }),
  account(17, 'Kweku Annan', 'kweku.annan@example.com', { status: INACTIVE, createdAt: '2026-08-19T13:35:00Z', lastLogin: '2026-09-02T10:30:00Z' }),
  account(18, 'Ewurabena Baidoo', 'ewurabena.baidoo@example.com', { createdAt: '2026-09-01T08:25:00Z', lastLogin: '2026-10-16T07:55:00Z' }),
  account(19, 'Edem Amegashie', 'edem.amegashie@example.com', { createdAt: '2026-09-10T17:00:00Z', lastLogin: '2026-10-12T09:35:00Z' }),
  account(20, 'Josephine Nyarko', 'josephine.nyarko@example.com', { createdAt: '2026-09-23T12:10:00Z', lastLogin: '2026-10-15T13:15:00Z' }),
  account(21, 'Prince Opoku', 'prince.opoku@example.com', { emailVerified: false, createdAt: '2026-10-03T09:30:00Z' }),
  account(22, 'Gifty Asare', 'gifty.asare@example.com', { createdAt: '2026-10-06T14:20:00Z', lastLogin: '2026-10-13T16:00:00Z' }),
  account(23, 'Samuel Tagoe', 'samuel.tagoe@example.com', { createdAt: '2026-10-09T10:45:00Z', lastLogin: '2026-10-14T11:10:00Z' }),
  account(24, 'Comfort Appiah', 'comfort.appiah@example.com', { createdAt: '2026-10-14T08:15:00Z', lastLogin: '2026-10-16T12:00:00Z' }),
]