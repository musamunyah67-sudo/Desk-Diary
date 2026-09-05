import { useState, useEffect } from 'react'
import { getMaintenanceStatus } from '../services/supabaseService'

export const useMaintenanceStatus = () => {
  const [status, setStatus] = useState({ enabled: false, message: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    getMaintenanceStatus().then((data) => {
      if (isMounted) {
        setStatus(data)
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  return { ...status, loading }
}
