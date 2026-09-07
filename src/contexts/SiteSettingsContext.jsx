import { createContext, useContext, useState, useEffect } from 'react'
import {
  getSiteSettings,
  getNavigationItems,
  getSocialMediaSettings,
  getHeroCTAs
} from '../services/supabaseService'

const SiteSettingsContext = createContext(null)

// Default fallback values
const DEFAULT_SETTINGS = {
  site_name: 'Desk Diary',
  site_tagline: 'Your Desk. Your Story. Your Voice.',
  meta_description: 'Documenting, celebrating, and amplifying the voices, achievements, talents, and educational experiences of students.'
}

const DEFAULT_NAVIGATION = {
  primary: [
    { label: 'Home', url: '/', is_external: false, open_in_new_tab: false, visible: true, display_order: 1 },
    { label: 'Volunteer', url: '/volunteer', is_external: false, open_in_new_tab: false, visible: true, display_order: 2 },
    { label: 'Donate', url: '/donate', is_external: false, open_in_new_tab: false, visible: true, display_order: 3 },
    { label: 'Programs', url: '/programs', is_external: false, open_in_new_tab: false, visible: true, display_order: 4 },
    { label: 'Contact', url: '/contact', is_external: false, open_in_new_tab: false, visible: true, display_order: 5 }
  ],
  about: [
    { label: 'About Us', url: '/about', is_external: false, open_in_new_tab: false, visible: true, display_order: 1 },
    { label: 'Stories', url: '/stories', is_external: false, open_in_new_tab: false, visible: true, display_order: 2 },
    { label: 'News', url: '/news', is_external: false, open_in_new_tab: false, visible: true, display_order: 3 },
    { label: 'Events', url: '/events', is_external: false, open_in_new_tab: false, visible: true, display_order: 4 },
    { label: 'Gallery', url: '/gallery', is_external: false, open_in_new_tab: false, visible: true, display_order: 5 },
    { label: 'Partners', url: '/partners', is_external: false, open_in_new_tab: false, visible: true, display_order: 6 }
  ]
}

const DEFAULT_SOCIAL_MEDIA = [
  { platform: 'facebook', url: 'https://web.facebook.com/deskdiaryded401', visible: true },
  { platform: 'instagram', url: 'https://www.instagram.com/deskdiaryded401/', visible: true },
  { platform: 'youtube', url: 'https://www.youtube.com/@deskdiaryded401', visible: true },
  { platform: 'tiktok', url: 'https://www.tiktok.com/@deskdiaryded401/', visible: true },
  { platform: 'linkedin', url: 'https://www.linkedin.com/company/deskdiaryded401/', visible: true }
]

const DEFAULT_HERO_CTAS = [
  { button_order: 1, label: 'Explore Stories', url: '/stories', visible: true },
  { button_order: 2, label: 'Get Involved', url: '/volunteer', visible: true },
  { button_order: 3, label: 'Submit Your Story', url: '/contact', visible: true }
]

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [navigation, setNavigation] = useState(DEFAULT_NAVIGATION)
  const [socialMedia, setSocialMedia] = useState(DEFAULT_SOCIAL_MEDIA)
  const [heroCTAs, setHeroCTAs] = useState(DEFAULT_HERO_CTAS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const [settingsData, primaryNav, aboutNav, socialData, ctaData] = await Promise.all([
        getSiteSettings(),
        getNavigationItems('primary'),
        getNavigationItems('about'),
        getSocialMediaSettings(),
        getHeroCTAs()
      ])

      if (settingsData && Object.keys(settingsData).length > 0) {
        setSettings({ ...DEFAULT_SETTINGS, ...settingsData })
      }

      if (primaryNav && primaryNav.length > 0) {
        setNavigation(prev => ({ ...prev, primary: primaryNav }))
      }

      if (aboutNav && aboutNav.length > 0) {
        setNavigation(prev => ({ ...prev, about: aboutNav }))
      }

      if (socialData && socialData.length > 0) {
        setSocialMedia(socialData)
      }

      if (ctaData && ctaData.length > 0) {
        setHeroCTAs(ctaData)
      }
    } catch (error) {
      console.error('Error loading site settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshSettings = () => {
    loadSettings()
  }

  const getSetting = (key, fallback = null) => {
    return settings[key] !== undefined ? settings[key] : fallback
  }

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        navigation,
        socialMedia,
        heroCTAs,
        loading,
        refreshSettings,
        getSetting
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  )
}

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext)
  if (!context) {
    console.warn('useSiteSettings used outside SiteSettingsProvider, using defaults')
    return {
      settings: DEFAULT_SETTINGS,
      navigation: DEFAULT_NAVIGATION,
      socialMedia: DEFAULT_SOCIAL_MEDIA,
      heroCTAs: DEFAULT_HERO_CTAS,
      loading: false,
      refreshSettings: () => {},
      getSetting: (key, fallback) => DEFAULT_SETTINGS[key] || fallback
    }
  }
  return context
}

export default SiteSettingsContext
