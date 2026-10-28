// Every URL in the app is defined here, once.

export const ROUTES = {
  // Public pages (anyone can open these). The full announcement page needs a sign-in.
  HOME: '/',
  ANNOUNCEMENTS: '/announcements',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ACCESS_DENIED: '/access-denied',

  // Administrator pages
  ADMIN: {
    ROOT: '/admin',
    OVERVIEW: '/admin/overview',
    USERS: '/admin/users',
    ACTIVITY_LOGS: '/admin/activity-logs',
    ANNOUNCEMENTS: '/admin/announcements',
    SUPPORT: '/admin/support',
    SESSIONS: '/admin/sessions',
    SETTINGS: '/admin/settings',
    ACCOUNT: '/admin/account',
  },

  // User pages
  USER: {
    ROOT: '/user',
    DASHBOARD: '/user/dashboard',
    ANNOUNCEMENTS: '/user/announcements',
    SUPPORT: '/user/support',
    ACTIVITY: '/user/activity',
    SESSIONS: '/user/sessions',
    ACCOUNT: '/user/account',
  },
}