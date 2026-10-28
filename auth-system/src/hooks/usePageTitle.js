import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { getPageTitle } from '../constants/pageTitles'

// Keeps the browser tab title in step with the current page.
export function usePageTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = getPageTitle(pathname)
  }, [pathname])
}