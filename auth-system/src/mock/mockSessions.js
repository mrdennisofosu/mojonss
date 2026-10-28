import { getDeviceLabel } from '../utils/device'

// MOCK DATA: sign-in sessions (one row per device that signed in).
// In the real system the BACKEND records these at every sign-in, using the request's
// IP address and user agent. A browser cannot know its own IP address, so the values
// below are made up (the IPs come from ranges reserved for examples).
// Deleted when the real backend is connected.

function seed(id, userId, device, ip, location, startedAt, lastActive, trusted) {
  return { id, userId, device, ip, location, startedAt, lastActive, trusted, revoked: false }
}

export const mockSessions = [
  // Administrator (Kwame Asante)
  seed('ses-001', 'u-001', 'Chrome on Windows', '203.0.113.24', 'Accra, Ghana', '2026-10-18T06:10:00Z', '2026-10-18T07:45:00Z', true),
  seed('ses-002', 'u-001', 'Safari on iPhone', '203.0.113.87', 'Kumasi, Ghana', '2026-10-17T19:00:00Z', '2026-10-17T21:30:00Z', true),
  seed('ses-003', 'u-001', 'Firefox on Linux', '198.51.100.9', 'Frankfurt, Germany', '2026-10-18T03:12:00Z', '2026-10-18T03:40:00Z', false),
  // A regular user (Ama Mensah)
  seed('ses-004', 'u-002', 'Chrome on Windows', '203.0.113.24', 'Accra, Ghana', '2026-10-17T18:20:00Z', '2026-10-17T19:05:00Z', true),
  seed('ses-005', 'u-002', 'Safari on iPhone', '203.0.113.87', 'Kumasi, Ghana', '2026-10-16T09:05:00Z', '2026-10-16T10:00:00Z', true),
]

// Which session is THIS browser? (The real backend knows from the session cookie.)
export const currentSession = { id: null }

let nextNumber = 100

// Called when someone signs in
export function startSession(userId) {
  nextNumber += 1
  const now = new Date().toISOString()
  const id = `ses-${nextNumber}`

  mockSessions.push(seed(id, userId, getDeviceLabel(), '203.0.113.50', 'Accra, Ghana', now, now, true))
  currentSession.id = id
}

// Called when someone signs out
export function endCurrentSession() {
  const session = mockSessions.find((item) => item.id === currentSession.id)
  if (session) session.revoked = true
  currentSession.id = null
}