import { ROLES } from '../constants/roles'
import { ROUTES } from '../constants/routePaths'

// Each role's "home" after signing in
export function getRoleHome(role) {
  return role === ROLES.ADMIN ? ROUTES.ADMIN.OVERVIEW : ROUTES.USER.DASHBOARD
}

// Is this role allowed to open this path? (UI simulation only)
export function canAccessPath(role, path) {
  if (path.startsWith(ROUTES.ADMIN.ROOT)) return role === ROLES.ADMIN
  if (path.startsWith(ROUTES.USER.ROOT)) return role === ROLES.USER
  return true
}

// After signing in: go back to the page they wanted, if allowed, else to their home
export function getPostLoginPath(user, from) {
  if (from && from !== ROUTES.LOGIN && canAccessPath(user.role, from)) return from
  return getRoleHome(user.role)
}