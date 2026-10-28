import {
  CircleUser,
  History,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  MonitorSmartphone,
  ScrollText,
  Settings,
  Users,
} from 'lucide-react'
import { ROUTES } from './routePaths'
import { ROLES } from './roles'

// The sidebar menus. Every important page is listed directly, one click away.

export const adminNavigation = [
  { label: 'Overview', to: ROUTES.ADMIN.OVERVIEW, icon: LayoutDashboard },
  { label: 'User Management', to: ROUTES.ADMIN.USERS, icon: Users },
  { label: 'Activity Logs', to: ROUTES.ADMIN.ACTIVITY_LOGS, icon: ScrollText },
  { label: 'Announcements', to: ROUTES.ADMIN.ANNOUNCEMENTS, icon: Megaphone },
  { label: 'Support Requests', to: ROUTES.ADMIN.SUPPORT, icon: LifeBuoy },
  { label: 'Active Sessions', to: ROUTES.ADMIN.SESSIONS, icon: MonitorSmartphone },
  { label: 'System Settings', to: ROUTES.ADMIN.SETTINGS, icon: Settings },
  { label: 'My Account', to: ROUTES.ADMIN.ACCOUNT, icon: CircleUser },
]

export const userNavigation = [
  { label: 'My Dashboard', to: ROUTES.USER.DASHBOARD, icon: LayoutDashboard },
  { label: 'Announcements', to: ROUTES.USER.ANNOUNCEMENTS, icon: Megaphone },
  { label: 'Support', to: ROUTES.USER.SUPPORT, icon: LifeBuoy },
  { label: 'Recent Activity', to: ROUTES.USER.ACTIVITY, icon: History },
  { label: 'Active Sessions', to: ROUTES.USER.SESSIONS, icon: MonitorSmartphone },
  { label: 'My Account', to: ROUTES.USER.ACCOUNT, icon: CircleUser },
]

// Items shown in the dropdown under the user's name (top-right of the navbar)
export const profileMenuItems = {
  [ROLES.ADMIN]: [
    { label: 'Admin Dashboard', to: ROUTES.ADMIN.OVERVIEW, icon: LayoutDashboard },
    { label: 'My Account', to: ROUTES.ADMIN.ACCOUNT, icon: CircleUser },
  ],
  [ROLES.USER]: [
    { label: 'My Dashboard', to: ROUTES.USER.DASHBOARD, icon: LayoutDashboard },
    { label: 'My Account', to: ROUTES.USER.ACCOUNT, icon: CircleUser },
  ],
}

// Which sidebar menu belongs to which role.
export const navigationByRole = {
  [ROLES.ADMIN]: adminNavigation,
  [ROLES.USER]: userNavigation,
}