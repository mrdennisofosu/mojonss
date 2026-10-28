// MOCK DATA: fake announcements for frontend development only.
// Deleted when the real backend is connected.
// The last item is a draft: visitors must never see it.

import { ANNOUNCEMENT_STATUS } from '../constants/statuses'

export const mockAnnouncements = [
  {
    id: 'a-001',
    title: 'Welcome to the new platform',
    content:
      'We have launched a new system for managing accounts, announcements and support requests. Create an account to get started, and contact support if you need any help along the way.',
    status: ANNOUNCEMENT_STATUS.PUBLISHED,
    createdAt: '2026-10-11T15:00:00Z',
    publishedAt: '2026-10-12T09:00:00Z',
  },
  {
    id: 'a-002',
    title: 'Scheduled maintenance this weekend',
    content:
      'The platform will be briefly unavailable on Saturday night while we carry out routine maintenance. Please save your work before then. We expect everything to be back to normal within an hour.',
    status: ANNOUNCEMENT_STATUS.PUBLISHED,
    createdAt: '2026-10-13T10:00:00Z',
    publishedAt: '2026-10-14T08:00:00Z',
  },
  {
    id: 'a-003',
    title: 'Password security reminder',
    content:
      'Use a long, unique password for your account and never share it with anyone. Administrators will never ask for your password by email or message.',
    status: ANNOUNCEMENT_STATUS.PUBLISHED,
    createdAt: '2026-10-07T12:00:00Z',
    publishedAt: '2026-10-08T09:30:00Z',
  },
  {
    id: 'a-004',
    title: 'Support hours updated',
    content:
      'Our support team is now available from Monday to Friday, 8am to 5pm. Requests sent outside these hours will be answered on the next working day.',
    status: ANNOUNCEMENT_STATUS.PUBLISHED,
    createdAt: '2026-09-27T14:00:00Z',
    publishedAt: '2026-09-28T07:45:00Z',
  },
  {
    id: 'a-005',
    title: 'Draft: quarterly policy update',
    content: 'This announcement is still being written and has not been published.',
    status: ANNOUNCEMENT_STATUS.DRAFT,
    createdAt: '2026-10-15T16:00:00Z',
    publishedAt: null,
  },
]