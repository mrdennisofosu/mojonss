// MOCK DATA: fake support requests. Deleted when the real backend is connected.

import { ROLES } from '../constants/roles'
import { SUPPORT_STATUS as S } from '../constants/statuses'

function request(number, user, subject, message, status, createdAt, updatedAt, replies = []) {
  return {
    id: `s-${String(number).padStart(3, '0')}`,
    userId: user[0],
    userName: user[1],
    userEmail: user[2],
    subject,
    message,
    status,
    createdAt,
    updatedAt,
    replies,
  }
}

function reply(number, message, createdAt) {
  return {
    id: `r-${number}`,
    authorId: 'u-001',
    authorName: 'Kwame Asante',
    authorRole: ROLES.ADMIN,
    message,
    createdAt,
  }
}

const AMA = ['u-002', 'Ama Mensah', 'user@example.com']
const AKOSUA = ['u-006', 'Akosua Frimpong', 'akosua.frimpong@example.com']
const KWABENA = ['u-010', 'Kwabena Darko', 'kwabena.darko@example.com']
const ADWOA = ['u-011', 'Adwoa Tetteh', 'adwoa.tetteh@example.com']
const MAAME = ['u-016', 'Maame Serwaa', 'maame.serwaa@example.com']

export const mockSupportRequests = [
  request(1, AMA, 'Cannot update my email address',
    'I tried to change my email on my profile page, but I keep getting an error. Can you help?',
    S.IN_PROGRESS, '2026-10-15T09:10:00Z', '2026-10-15T14:30:00Z',
    [reply(1, 'Thanks for reaching out. We are looking into this and will update you shortly.', '2026-10-15T14:30:00Z')]),
  request(2, AMA, 'Question about announcements',
    'Where can I find older announcements? I only see the most recent ones on the homepage.',
    S.RESOLVED, '2026-10-02T11:00:00Z', '2026-10-03T08:45:00Z',
    [reply(2, 'All published announcements are listed on the Announcements page in your dashboard. Let us know if you need anything else.', '2026-10-03T08:45:00Z')]),
  request(3, AMA, 'The page loads slowly on my phone',
    'Some pages take a long time to open when I am on mobile data. Is there anything I can do?',
    S.PENDING, '2026-10-17T16:20:00Z', '2026-10-17T16:20:00Z'),
  request(4, AKOSUA, 'I did not receive my verification email',
    'I registered two days ago but the verification email never arrived. I checked my spam folder as well.',
    S.PENDING, '2026-10-16T07:30:00Z', '2026-10-16T07:30:00Z'),
  request(5, KWABENA, 'Request to change my account name',
    'My name was spelled wrongly when I registered. Please can it be corrected?',
    S.RESOLVED, '2026-09-28T13:15:00Z', '2026-09-29T09:00:00Z',
    [reply(3, 'Done. You can now edit your name yourself on the My Profile page.', '2026-09-29T09:00:00Z')]),
  request(6, ADWOA, 'Unable to sign in after password reset',
    'I reset my password but the new one is not accepted when I try to sign in.',
    S.IN_PROGRESS, '2026-10-14T18:05:00Z', '2026-10-15T08:20:00Z',
    [reply(4, 'Could you tell us which device and browser you are using? That will help us check what is happening.', '2026-10-15T08:20:00Z')]),
  request(7, MAAME, 'Feature suggestion: dark mode',
    'It would be great to have a dark mode, especially for using the system at night.',
    S.PENDING, '2026-10-13T20:40:00Z', '2026-10-13T20:40:00Z'),
]