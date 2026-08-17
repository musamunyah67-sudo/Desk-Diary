import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllRows, updateRow, deleteRow } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'

// Read-only inbox view for submissions people sent in via public forms
// (volunteer applications, contact messages, partnership inquiries, school
// submissions). Admins can review, change status, and delete.
const InboxManager = ({ title, description, table, columns, statusOptions }) => {
  const { accessToken } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState(null)

  useEffect(() => { load() }, [table])

  const load = async () => {
    setLoading(true)
    try {
      setRows(await getAllRows(table, 'created_at', false, { accessToken }))
    } catch (error) {
      console.error(error)
      toast.error(`Failed to load ${title.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await updateRow(table, id, { status }, { accessToken })
      toast.success('Status updated')
      load()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this submission?')) return
    try {
      await deleteRow(table, id, { accessToken })
      toast.success('Deleted')
      load()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="font-anton text-3xl text-primary">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{c.label}</th>
              ))}
              {statusOptions && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={columns.length + 2} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={columns.length + 2} className="px-6 py-12 text-center text-gray-500">No submissions yet.</td></tr>
            ) : rows.map((row) => (
              <tr key={row.id} onClick={() => setViewing(row)} className="cursor-pointer hover:bg-gray-50 transition-colors">
                {columns.map((c) => (
                  <td key={c.key} className="px-6 py-4 whitespace-nowrap">{String(row[c.key] ?? '').slice(0, 40)}</td>
                ))}
                {statusOptions && (
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={row.status}
                      onChange={(e) => handleStatusChange(row.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm capitalize"
                    >
                      {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                )}
                <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setViewing(row)} className="text-primary hover:text-blue-700 mr-3"><Eye size={18} /></button>
                  <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-anton text-2xl text-primary">Details</h3>
              <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <dl className="space-y-3">
              {Object.entries(viewing).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-semibold text-gray-500 uppercase">{k.replace(/_/g, ' ')}</dt>
                  <dd className="text-gray-800 break-words">{Array.isArray(v) ? v.join(', ') : String(v ?? '—')}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default InboxManager
