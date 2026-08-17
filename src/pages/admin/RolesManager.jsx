import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, UserMinus, UserPlus, Mail, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { listAdminUsers, assignRoleByEmail, revokeRoleByEmail, createUserLogin } from '../../services/supabaseService'

// Lets Admins/Superadmins assign and revoke roles (Admin, Superadmin) for
// people who already have an account. Reserved for Admin/Superadmin only,
// per the requirement that only they can create/manage roles.
//
// Note: creating a brand-new login from scratch (rather than promoting an
// existing account) requires Supabase's Admin API with the service_role
// key, which must run on a trusted server (never in this public frontend).
// The intended flow here is: the person signs up / is invited via Supabase
// Auth, then a Superadmin promotes their email to 'admin' below.
const RolesManager = () => {
  const { role: myRole, user, accessToken } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [newRole, setNewRole] = useState('admin')
  const [submitting, setSubmitting] = useState(false)

  // Create-brand-new-login form state
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createRole, setCreateRole] = useState('admin')
  const [sendInvite, setSendInvite] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await listAdminUsers({ accessToken })
      setAdmins(data)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load roles (make sure the schema RPC functions are installed)')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await assignRoleByEmail(email.trim(), newRole, { accessToken })
      toast.success(`${email} is now ${newRole}`)
      setEmail('')
      load()
    } catch (error) {
      toast.error(error.message || 'Failed to assign role')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRevoke = async (targetEmail) => {
    if (!confirm(`Revoke admin access for ${targetEmail}?`)) return
    try {
      await revokeRoleByEmail(targetEmail, { accessToken })
      toast.success('Role revoked')
      load()
    } catch (error) {
      toast.error(error.message || 'Failed to revoke role')
    }
  }

  const handleCreateLogin = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const result = await createUserLogin({
        email: createEmail.trim(),
        password: sendInvite ? undefined : createPassword,
        role: createRole,
        sendInvite,
      }, { accessToken })
      toast.success(sendInvite ? `Invite sent to ${result.user.email}` : `Login created for ${result.user.email}`)
      setCreateEmail('')
      setCreatePassword('')
      load()
    } catch (error) {
      toast.error(error.message || 'Failed to create login')
    } finally {
      setCreating(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="font-anton text-3xl text-primary">Admins & Roles</h2>
        <p className="text-gray-600">
          Create new logins, or assign/revoke Admin / Superadmin access. Reserved for Admins and Superadmins only.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Mail size={20} /> Create a Brand-New Login</h3>
        <p className="text-gray-500 text-sm mb-4">
          Use this when the person doesn't have an account yet. Send them an email invite (they set their own
          password), or set a temporary password yourself.
        </p>
        <form onSubmit={handleCreateLogin} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="email"
              required
              placeholder="newperson@example.com"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="admin">Admin</option>
              {myRole === 'superadmin' && <option value="superadmin">Superadmin</option>}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sendInvite"
              checked={sendInvite}
              onChange={(e) => setSendInvite(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <label htmlFor="sendInvite" className="text-sm text-gray-700">
              Email them an invite link instead of setting a password myself
            </label>
          </div>

          {!sendInvite && (
            <div className="flex items-center gap-2">
              <KeyRound size={18} className="text-gray-400" />
              <input
                type="password"
                required={!sendInvite}
                minLength={8}
                placeholder="Temporary password (min 8 characters)"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={creating}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating...' : sendInvite ? 'Send Invite' : 'Create Login'}
          </button>
        </form>
        <p className="text-gray-400 text-xs mt-3">
          This calls a secure server-side function — it never uses a privileged key in the browser, and it
          re-checks that you're an Admin/Superadmin before doing anything.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><UserPlus size={20} /> Grant a Role to an Existing Account</h3>
        <form onSubmit={handleAssign} className="flex flex-col md:flex-row gap-4">
          <input
            type="email"
            required
            placeholder="person@example.com (must already have an account)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="admin">Admin</option>
            {myRole === 'superadmin' && <option value="superadmin">Superadmin</option>}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Grant'}
          </button>
        </form>
        <p className="text-gray-400 text-xs mt-3">
          Only a Superadmin can grant the Superadmin role. The person must already have signed in at least once
          (an account must exist) before you can promote them.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
            ) : admins.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">No admins yet.</td></tr>
            ) : admins.map((a) => (
              <tr key={a.user_id}>
                <td className="px-6 py-4">{a.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold capitalize">
                    <Shield size={12} /> {a.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {myRole === 'superadmin' && a.email !== user?.email && (
                    <button onClick={() => handleRevoke(a.email)} className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 text-sm">
                      <UserMinus size={16} /> Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

export default RolesManager
