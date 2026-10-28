// MOCK DATA: the fake "links in emails". Real tokens are long, random, created
// by the backend, single-use, and expire. Ours are reusable so testing is easy.

// token -> { email }
export const verificationTokens = new Map([['valid-token', { email: 'unverified@example.com' }]])
export const resetTokens = new Map([['valid-token', { email: 'user@example.com' }]])

// 'expired-token' is handled directly by the services (always expired).

export function createToken(prefix) {
  const random = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)
  return `${prefix}-${random}`
}