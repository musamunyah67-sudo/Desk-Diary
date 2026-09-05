import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wrench, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { getMaintenanceStatus, setMaintenanceMode } from '../../services/supabaseService'
import { MAINTENANCE_OWNER_EMAIL } from '../../lib/maintenanceConfig'

const MaintenanceControl = () => {
  const { accessToken } = useAuth()
  const [status, setStatus] = useState({ enabled: false, message: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    const data = await getMaintenanceStatus()
    setStatus(data)
    setMessage(data.message || '')
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleToggle = async () => {
    setSaving(true)
    try {
      await setMaintenanceMode(!status.enabled, message, { accessToken })
      toast.success(!status.enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled')
      await load()
    } catch (error) {
      toast.error(error.message || 'Failed to update maintenance mode')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveMessage = async () => {
    setSaving(true)
    try {
      await setMaintenanceMode(status.enabled, message, { accessToken })
      toast.success('Maintenance message updated')
      await load()
    } catch (error) {
      toast.error(error.message || 'Failed to update message')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-gray-500">Loading maintenance status...</div>
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="font-anton text-2xl text-primary flex items-center space-x-2">
          <Wrench size={22} />
          <span>🔐 Maintenance Control</span>
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Take the public site offline for everyone except the maintenance owner.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl space-y-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Website Maintenance Mode</p>
          <p className="text-sm text-gray-500 mb-1">Current Status:</p>
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${status.enabled ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="font-semibold text-lg">
              {status.enabled ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
        </div>

        <div className="flex items-start space-x-2 bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700">Authorized Maintenance Owner</p>
            <p>{MAINTENANCE_OWNER_EMAIL}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maintenance message (optional, shown to visitors)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. Expect us back online by 6pm GMT."
          />
          <button
            onClick={handleSaveMessage}
            disabled={saving}
            className="mt-2 text-sm text-primary hover:underline disabled:opacity-50"
          >
            Save message
          </button>
        </div>

        <button
          onClick={handleToggle}
          disabled={saving}
          className={`w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
            status.enabled
              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {saving ? 'Saving...' : status.enabled ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
        </button>
      </div>
    </motion.div>
  )
}

export default MaintenanceControl
