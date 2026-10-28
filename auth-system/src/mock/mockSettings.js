// MOCK DATA: the system settings. Deleted when the real backend is connected.
// The backend will store these and enforce them.
export const mockSettings = {
  general: {
    appName: 'Auth System',
    supportEmail: 'support@example.com',
  },
  registration: {
    publicRegistrationEnabled: true,
  },
  security: {
    minPasswordLength: 8,
    requireEmailVerification: true,
    maxFailedAttempts: 5,
    lockoutMinutes: 15,
  },
  session: {
    sessionTimeoutMinutes: 60,
    allowRememberMe: true,
  },
}