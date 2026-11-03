import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { ROLES } from '../constants/roles'
import { ROUTES } from '../constants/routePaths'
import { getBadges } from '../services/notificationService'
import {
  ANNOUNCEMENTS_CHANGED,
  BADGES_REFRESH,
  SUPPORT_CHANGED,
  emit,
} from '../utils/badgeEvents'
import { useAuth } from './useAuth'

const REFRESH_EVERY_MS = 15000

// const { supportCount, announcementCount, supportPath, announcementsPath } = useNavBadges()
// The numbers only go down when something is actually opened. Moving between pages never clears them.
export function useNavBadges() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const userId = user?.id
  const isAdmin = user?.role === ROLES.ADMIN

  const [counts, setCounts] = useState({ support: 0, announcements: 0 })
  const lastSeen = useRef({ support: undefined, announcements: undefined })

  const refresh = useCallback(async () => {
    try {
      const data = await getBadges()

      setCounts({
        support: data.support?.count ?? 0,
        announcements: data.announcements?.count ?? 0,
      })

      // New activity since the last check (not on the very first check): tell the pages to reload
      const nextSupport = data.support?.latest ?? null
      if (lastSeen.current.support !== undefined && nextSupport !== lastSeen.current.support) {
        emit(SUPPORT_CHANGED)
      }
      lastSeen.current.support = nextSupport

      const nextAnnouncements = data.announcements?.latest ?? null
      if (
        lastSeen.current.announcements !== undefined &&
        nextAnnouncements !== lastSeen.current.announcements
      ) {
        emit(ANNOUNCEMENTS_CHANGED)
      }
      lastSeen.current.announcements = nextAnnouncements
    } catch {
      // Keep the last numbers if a check fails
    }
  }, [])

  // Check regularly, when the person returns to this tab, and when something was just read
  useEffect(() => {
    if (!userId) return undefined

    lastSeen.current = { support: undefined, announcements: undefined }
    const timer = setInterval(refresh, REFRESH_EVERY_MS)
    window.addEventListener('focus', refresh)
    window.addEventListener(BADGES_REFRESH, refresh)

    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', refresh)
      window.removeEventListener(BADGES_REFRESH, refresh)
    }
  }, [userId, refresh])

  // Check again on every page change, so a number drops right after something is read
  useEffect(() => {
    if (userId) refresh()
  }, [userId, pathname, refresh])

  return {
    supportCount: counts.support,
    announcementCount: counts.announcements,
    supportPath: isAdmin ? ROUTES.ADMIN.SUPPORT : ROUTES.USER.SUPPORT,
    // Announcements get a number for users only
    announcementsPath: isAdmin ? null : ROUTES.USER.ANNOUNCEMENTS,
  }
}