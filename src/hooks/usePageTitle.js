import { useEffect } from 'react'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

/**
 * Custom hook to dynamically update the browser tab title
 * @param {string} pageTitle - The specific page title
 * @param {string} fallback - Fallback title if settings fail to load
 */
export const usePageTitle = (pageTitle, fallback = 'Desk Diary') => {
  const { settings, loading } = useSiteSettings()
  const siteName = settings.site_name || 'Desk Diary'

  useEffect(() => {
    if (loading) return

    if (pageTitle) {
      document.title = `${pageTitle} | ${siteName}`
    } else {
      document.title = siteName
    }
  }, [pageTitle, siteName, loading])
}

export default usePageTitle
