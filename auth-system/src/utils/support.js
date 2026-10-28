import { ROLES } from '../constants/roles'
import { SUPPORT_STATUS } from '../constants/statuses'

// Was the last message written by an administrator? Then it is the user's turn.
export function awaitingUser(request) {
  const last = request.replies[request.replies.length - 1]
  return Boolean(last) && last.authorRole === ROLES.ADMIN
}

// Does an administrator still need to respond?
export function awaitingAdmin(request) {
  if (request.status === SUPPORT_STATUS.RESOLVED) return false

  const last = request.replies[request.replies.length - 1]
  return !last || last.authorRole !== ROLES.ADMIN
}