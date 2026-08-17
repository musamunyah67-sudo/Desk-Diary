import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

const AuthContext = createContext(null)

const SESSION_KEY = 'desk_diary_session'

const saveSession = (session) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch (e) {
    // localStorage may be unavailable (private browsing, quota, etc.) —
    // the app still works, it just won't survive a refresh.
    console.error('Could not persist session:', e)
  }
}

const loadSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch (e) {
    // ignore
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState(null)
  const [accessToken, setAccessToken] = useState(null)

  const refreshSession = async (refreshToken) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    })
    if (!response.ok) throw new Error('Session expired')
    return response.json()
  }

  useEffect(() => {
    const restoreSession = async () => {
      const stored = loadSession()
      if (!stored) {
        setLoading(false)
        return
      }

      try {
        // Refresh if the access token is expired (or about to be)
        const isExpired = !stored.expiresAt || Date.now() > stored.expiresAt - 60_000
        const data = isExpired ? await refreshSession(stored.refreshToken) : null
        const finalAccessToken = data?.access_token || stored.accessToken
        const finalRefreshToken = data?.refresh_token || stored.refreshToken
        const finalUser = data?.user || stored.user
        const finalExpiresAt = data ? Date.now() + (data.expires_in * 1000) : stored.expiresAt

        setUser(finalUser)
        setAccessToken(finalAccessToken)
        saveSession({ user: finalUser, accessToken: finalAccessToken, refreshToken: finalRefreshToken, expiresAt: finalExpiresAt })
        await fetchUserRole(finalUser.id, finalAccessToken)
      } catch (error) {
        // Refresh token is no longer valid — clear the stale session
        clearSession()
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const fetchUserRole = async (userId, token) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const bearerToken = token || accessToken

      const response = await fetch(
        `${supabaseUrl}/rest/v1/user_roles?user_id=eq.${userId}&select=role`,
        {
          headers: {
            'apikey': supabaseAnonKey,
            // Authenticate as this user (not anon) so the RLS policy on
            // user_roles, which checks auth.uid(), actually matches them.
            'Authorization': `Bearer ${bearerToken || supabaseAnonKey}`,
          }
        }
      )

      if (!response.ok) {
        console.log('User roles lookup failed, defaulting to user role', response.status)
        setRole('user')
        return
      }

      const data = await response.json()
      setRole(data?.[0]?.role || 'user')
    } catch (error) {
      console.error('Error fetching user role:', error)
      setRole('user')
    }
  }

  const login = async (email, password) => {
    try {
      // Direct REST API login instead of the SDK to bypass a timeout issue
      // in the supabase.auth client seen in this environment.
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('AuthContext: login failed', response.status)
        throw new Error(errorData.error_description || errorData.error || 'Login failed')
      }

      // NOTE: intentionally not logging `data` here — it contains the raw
      // access_token/refresh_token, which should never land in the browser
      // console (readable by devtools, extensions, or anyone at the machine).
      const data = await response.json()

      const userId = data.user?.id || data.user_id
      const sessionUser = {
        id: userId,
        email: data.user?.email || email,
        ...data.user
      }
      setUser(sessionUser)
      
      // Store access token for REST API calls
      setAccessToken(data.access_token)

      // Persist so the session survives a page refresh
      saveSession({
        user: sessionUser,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000)
      })
      
      // Fetch actual role from database, authenticated as this user via the
      // REST API directly (bearer token) — NOT via supabase.auth, which is
      // the part of the SDK that hangs/times out in this environment. This
      // matches the pattern used everywhere else in supabaseService.js.
      await fetchUserRole(userId, data.access_token)

      toast.success('Login successful')
      return data
    } catch (error) {
      console.error('AuthContext: Login error', error.message)
      toast.error(error.message)
      throw error
    }
  }

  const logout = async () => {
    try {
      clearSession()
      setUser(null)
      setRole(null)
      setAccessToken(null)
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Error logging out')
      throw error
    }
  }

  const hasRole = (requiredRole) => {
    if (requiredRole === 'superadmin') return role === 'superadmin'
    if (requiredRole === 'admin') return role === 'admin' || role === 'superadmin'
    return true
  }

  return (
    <AuthContext.Provider value={{ user, loading, role, accessToken, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
