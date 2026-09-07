import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import {
  Settings,
  Globe,
  Navigation,
  Share2,
  Layout,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getSiteSettings,
  getNavigationItems,
  getSocialMediaSettings,
  getHeroCTAs,
  updateSiteSetting,
  updateNavigationItem,
  createNavigationItem,
  deleteNavigationItem,
  updateSocialMediaSetting,
  updateHeroCTA
} from '../../services/supabaseService'

const WebsiteSettingsManager = () => {
  const { accessToken, hasRole } = useAuth()
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    site_name: 'Desk Diary',
    site_tagline: 'Your Desk. Your Story. Your Voice.',
    meta_description: 'Documenting, celebrating, and amplifying the voices, achievements, talents, and educational experiences of students.'
  })

  // Navigation
  const [primaryNav, setPrimaryNav] = useState([])
  const [aboutNav, setAboutNav] = useState([])

  // Social Media
  const [socialMedia, setSocialMedia] = useState([])

  // Hero CTAs
  const [heroCTAs, setHeroCTAs] = useState([])

  useEffect(() => {
    if (!hasRole('superadmin')) return
    loadSettings()
  }, [hasRole])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const [settings, primary, about, social, ctas] = await Promise.all([
        getSiteSettings({ accessToken }),
        getNavigationItems('primary', { accessToken }),
        getNavigationItems('about', { accessToken }),
        getSocialMediaSettings({ accessToken }),
        getHeroCTAs({ accessToken })
      ])

      if (settings) {
        setGeneralSettings({
          site_name: settings.site_name || 'Desk Diary',
          site_tagline: settings.site_tagline || 'Your Desk. Your Story. Your Voice.',
          meta_description: settings.meta_description || ''
        })
      }

      setPrimaryNav(primary || [])
      setAboutNav(about || [])
      setSocialMedia(social || [])
      setHeroCTAs(ctas || [])
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGeneral = async () => {
    setSaving(true)
    try {
      await Promise.all([
        updateSiteSetting('site_name', `"${generalSettings.site_name}"`, { accessToken }),
        updateSiteSetting('site_tagline', `"${generalSettings.site_tagline}"`, { accessToken }),
        updateSiteSetting('meta_description', `"${generalSettings.meta_description}"`, { accessToken })
      ])
      toast.success('General settings saved successfully')
    } catch (error) {
      console.error('Error saving general settings:', error)
      toast.error('Failed to save general settings')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateNavigation = async (id, updates) => {
    try {
      await updateNavigationItem(id, updates, { accessToken })
      toast.success('Navigation updated')
      loadSettings()
    } catch (error) {
      console.error('Error updating navigation:', error)
      toast.error('Failed to update navigation')
    }
  }

  const handleUpdateSocial = async (platform, updates) => {
    try {
      await updateSocialMediaSetting(platform, updates, { accessToken })
      toast.success('Social media updated')
      loadSettings()
    } catch (error) {
      console.error('Error updating social media:', error)
      toast.error('Failed to update social media')
    }
  }

  const handleUpdateHeroCTA = async (buttonOrder, updates) => {
    try {
      await updateHeroCTA(buttonOrder, updates, { accessToken })
      toast.success('Hero CTA updated')
      loadSettings()
    } catch (error) {
      console.error('Error updating hero CTA:', error)
      toast.error('Failed to update hero CTA')
    }
  }

  if (!hasRole('superadmin')) {
    return (
      <div className="text-center py-20">
        <h2 className="font-anton text-3xl text-primary mb-2">Access Denied</h2>
        <p className="text-gray-600">Only Superadmins can access Website Settings.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="font-anton text-3xl text-primary">Website Settings</h2>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'general', label: 'General', icon: Globe },
            { id: 'navigation', label: 'Navigation', icon: Navigation },
            { id: 'social', label: 'Social Media', icon: Share2 },
            { id: 'hero', label: 'Hero CTAs', icon: Layout }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h3 className="font-semibold text-lg text-gray-900">General Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
              <input
                type="text"
                value={generalSettings.site_name}
                onChange={(e) => setGeneralSettings({ ...generalSettings, site_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Tagline</label>
              <input
                type="text"
                value={generalSettings.site_tagline}
                onChange={(e) => setGeneralSettings({ ...generalSettings, site_tagline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description (SEO)</label>
              <textarea
                value={generalSettings.meta_description}
                onChange={(e) => setGeneralSettings({ ...generalSettings, meta_description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              onClick={handleSaveGeneral}
              disabled={saving}
              className="flex items-center space-x-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Navigation Tab */}
      {activeTab === 'navigation' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <NavigationSection title="Primary Navigation" items={primaryNav} onUpdate={handleUpdateNavigation} />
          <NavigationSection title="About Dropdown" items={aboutNav} onUpdate={handleUpdateNavigation} />
        </motion.div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">Social Media Links</h3>
            <div className="space-y-4">
              {socialMedia.map((social) => (
                <SocialMediaRow key={social.platform} social={social} onUpdate={handleUpdateSocial} />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Hero CTAs Tab */}
      {activeTab === 'hero' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg text-gray-900 mb-6">Hero Call-to-Action Buttons</h3>
            <div className="space-y-4">
              {heroCTAs.map((cta) => (
                <HeroCTARow key={cta.button_order} cta={cta} onUpdate={handleUpdateHeroCTA} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

const NavigationSection = ({ title, items, onUpdate }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold text-lg text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <input
                type="text"
                value={item.label}
                onChange={(e) => onUpdate(item.id, { label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Label"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={item.url}
                onChange={(e) => onUpdate(item.id, { url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="URL"
              />
            </div>
            <button
              onClick={() => onUpdate(item.id, { visible: !item.visible })}
              className={`p-2 rounded ${item.visible ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}
              title={item.visible ? 'Visible' : 'Hidden'}
            >
              {item.visible ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const SocialMediaRow = ({ social, onUpdate }) => {
  const [url, setUrl] = useState(social.url || '')
  const [visible, setVisible] = useState(social.visible)

  const handleSave = () => {
    onUpdate(social.platform, { url, visible })
  }

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
      <div className="w-32 font-medium capitalize">{social.platform}</div>
      <div className="flex-1">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleSave}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="URL"
        />
      </div>
      <button
        onClick={() => {
          setVisible(!visible)
          onUpdate(social.platform, { url, visible: !visible })
        }}
        className={`p-2 rounded ${visible ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}
      >
        {visible ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  )
}

const HeroCTARow = ({ cta, onUpdate }) => {
  const [label, setLabel] = useState(cta.label)
  const [url, setUrl] = useState(cta.url)
  const [visible, setVisible] = useState(cta.visible)

  const handleSave = () => {
    onUpdate(cta.button_order, { label, url, visible })
  }

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
      <div className="w-8 font-semibold text-gray-500">{cta.button_order}</div>
      <div className="flex-1">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleSave}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Button Label"
        />
      </div>
      <div className="flex-1">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleSave}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="URL"
        />
      </div>
      <button
        onClick={() => {
          setVisible(!visible)
          onUpdate(cta.button_order, { label, url, visible: !visible })
        }}
        className={`p-2 rounded ${visible ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}
      >
        {visible ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  )
}

export default WebsiteSettingsManager
