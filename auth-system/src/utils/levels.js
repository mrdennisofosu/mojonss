import { LEVELS, ROLES } from '../constants/roles'
import { ROUTES } from '../constants/routePaths'

// Works with the signed-in user or a row from the users list:
// { level: 'super_admin' | 'admin' | 'user', role: 'admin' | 'user' }
export function levelOf(person) {
  if (person?.level) return person.level
  return person?.role === ROLES.ADMIN ? LEVELS.ADMIN : LEVELS.USER
}

export function isSuperAdmin(person) {
  return levelOf(person) === LEVELS.SUPER_ADMIN
}

// Pages only the super admin may open
const SUPER_ADMIN_ONLY_PATHS = [ROUTES.ADMIN.SETTINGS]

// Removes the menu items a person is not allowed to use
export function visibleItems(items, person) {
  if (isSuperAdmin(person)) return items
  return items.filter((item) => !SUPER_ADMIN_ONLY_PATHS.includes(item.to))
}