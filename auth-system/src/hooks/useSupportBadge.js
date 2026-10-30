import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { ROLES } from '../constants/roles'
import { ROUTES } from '../constants/routePaths'
import {
  getSupportUnreadCount,
  markSupportSeen,
} from '../services/notificationService'
import { useAuth } from './useAuth'

const REFRESH_EVERY_MS = 30000

// const { count, supportPath } = useSupportBadge()
// count is the number to show next to "Support" in the sidebar.
export function useSupportBadge() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [count, setCount] = useState(0)

  const supportPath =
    user?.role === ROLES.ADMIN ? ROUTES.ADMIN.SUPPORT : ROUTES.USER.SUPPORT
  const onSupportPage = pathname === supportPath

  const refresh = useCallback(async () => {
    try {
      const data = await getSupportUnreadCount()
      setCount(data.count ?? 0)
    } catch {
      // Keep the last number if the request fails
    }
  }, [])

  // Keep the number fresh: every 30 seconds and when the person returns to this tab
  useEffect(() => {
    if (!user) return undefined

    refresh()
    const timer = setInterval(refresh, REFRESH_EVERY_MS)
    window.addEventListener('focus', refresh)

    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', refresh)
    }
  }, [user, refresh])

  // Opening the Support page marks everything as seen, and so does leaving it
  useEffect(() => {
    if (!user || !onSupportPage) return undefined

    markSupportSeen()
      .then(() => setCount(0))
      .catch(() => {})

    return () => {
      markSupportSeen()
        .then(refresh)
        .catch(() => {})
    }
  }, [user, onSupportPage, refresh])

  return { count, supportPath }
}