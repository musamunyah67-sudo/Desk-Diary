import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, Save } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import FileUpload from '../../components/FileUpload'
import { useAuth } from '../../contexts/AuthContext'
import { getAllRows, createRow, updateRow, deleteRow } from '../../services/supabaseService'

// A single reusable admin manager: table listing + add/edit modal + delete,
// wired directly to Supabase, driven entirely by a `fields` config.
//
// fields: [{ name, label, type, required, options, placeholder }]
//   type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'date' | 'image' | 'video' | 'tags'
//   'tags' = comma-separated list stored as a text[] column (e.g. programs, skills, features)
const ContentManager = ({ title, description, table, fields, titleField = 'title', orderBy = 'created_at' }) => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const { accessToken } = useAuth()

  useEffect(() => {
    load()
  }, [table])

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAllRows(table, orderBy, false, { accessToken })
      setRows(data)
    } catch (error) {
      console.error(error)
      toast.error(`Failed to load ${title.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData) => {
    try {
      // Convert 'tags' fields from comma-separated strings to arrays before saving
      const payload = { ...formData }
      fields.forEach((f) => {
        if (f.type === 'tags' && typeof payload[f.name] === 'string') {
          payload[f.name] = payload[f.name]
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        }
        if (f.type === 'number' && payload[f.name] !== '' && payload[f.name] !== undefined) {
          payload[f.name] = Number(payload[f.name])
        }
        // Handle checkbox fields - ensure they're boolean
        if (f.type === 'checkbox') {
          payload[f.name] = !!payload[f.name]
        }
      })

      // For tables with 'published' field, ensure it defaults to false if not set
      if (!payload.published && fields.find(f => f.name === 'published')) {
        payload.published = false
      }

      console.log('Saving payload:', payload)

      if (editingRow) {
        await updateRow(table, editingRow.id, payload, { accessToken })
        toast.success(`${title} updated`)
      } else {
        await createRow(table, payload, { accessToken })
        toast.success(`${title} created`)
      }
      setShowModal(false)
      setEditingRow(null)
      load()
    } catch (error) {
      console.error(error)
      toast.error(`Failed to save: ${error.message || 'unknown error'}`)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(`Delete this ${title.toLowerCase().replace(/s$/, '')}? This cannot be undone.`)) return
    try {
      await deleteRow(table, id, { accessToken })
      toast.success('Deleted successfully')
      load()
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete')
    }
  }

  const statusField = fields.find((f) => f.name === 'published' || f.name === 'featured' || f.name === 'status')

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-anton text-3xl text-primary">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
        <button
          onClick={() => { setEditingRow(null); setShowModal(true) }}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add New</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {fields.find((f) => f.name === titleField)?.label || 'Title'}
                </th>
                {statusField && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {statusField.label}
                  </th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => { setEditingRow(row); setShowModal(true) }}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">{String(row[titleField] ?? '').slice(0, 80)}</td>
                  {statusField && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {statusField.type === 'checkbox' ? (
                        <span className={`px-2 py-1 rounded-full text-xs ${row[statusField.name] ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {row[statusField.name] ? (statusField.name === 'published' ? 'Published' : 'Yes') : (statusField.name === 'published' ? 'Draft' : 'No')}
                        </span>
                      ) : (
                        <span className="capitalize">{row[statusField.name]}</span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={(e) => { e.stopPropagation(); setEditingRow(row); setShowModal(true) }} className="text-primary hover:text-blue-700 mr-3">
                      <Edit size={18} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id) }} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={statusField ? 3 : 2} className="px-6 py-12 text-center text-gray-500">
                    No content yet. Click "Add New" to create content.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <RowModal
          title={title}
          fields={fields}
          row={editingRow}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingRow(null) }}
        />
      )}
    </motion.div>
  )
}

const RowModal = ({ title, fields, row, onSave, onClose }) => {
  const initial = {}
  fields.forEach((f) => {
    if (f.type === 'tags') {
      initial[f.name] = row?.[f.name] ? row[f.name].join(', ') : ''
    } else if (f.type === 'checkbox') {
      initial[f.name] = row?.[f.name] ?? false
    } else if (f.type === 'select') {
      // Default to the first real option, never ''. An empty string here
      // would visually show the first option (browsers auto-select it)
      // while the actual saved value stays '', which then fails the
      // database's CHECK constraint on category/status columns.
      initial[f.name] = row?.[f.name] ?? (f.options && f.options.length ? f.options[0] : '')
    } else {
      initial[f.name] = row?.[f.name] ?? ''
    }
  })
  const [formData, setFormData] = useState(initial)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-anton text-2xl text-primary">{row ? `Edit ${title}` : `Add New ${title}`}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              {f.type !== 'checkbox' && (
                <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
              )}

              {(f.type === 'text' || f.type === 'email' || f.type === 'tel' || f.type === 'url') && (
                <input
                  type={f.type === 'text' ? 'text' : f.type}
                  value={formData[f.name]}
                  onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={f.placeholder}
                  required={f.required}
                />
              )}

              {f.type === 'number' && (
                <input
                  type="number"
                  step="0.01"
                  value={formData[f.name]}
                  onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={f.placeholder}
                  required={f.required}
                />
              )}

              {f.type === 'date' && (
                <input
                  type="date"
                  value={formData[f.name]}
                  onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required={f.required}
                />
              )}

              {f.type === 'textarea' && (
                <textarea
                  value={formData[f.name]}
                  onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={f.placeholder}
                  required={f.required}
                />
              )}

              {f.type === 'tags' && (
                <input
                  type="text"
                  value={formData[f.name]}
                  onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={f.placeholder || 'Comma-separated, e.g. Media Club, Leadership'}
                />
              )}

              {f.type === 'select' && (
                <select
                  value={formData[f.name]}
                  onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {f.type === 'checkbox' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={f.name}
                    checked={!!formData[f.name]}
                    onChange={(e) => setFormData({ ...formData, [f.name]: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <label htmlFor={f.name} className="ml-2 text-sm text-gray-700">{f.label}</label>
                </div>
              )}

              {(f.type === 'image' || f.type === 'video') && (() => {
                // If this field declares `typeFrom`, use the current value of
                // that other field (e.g. a "Media Type" select) to decide
                // whether to upload as an image or a video, instead of a
                // hardcoded type. Without this, a field statically typed
                // 'image' would always upload through Cloudinary's image
                // endpoint — which enforces a 10MB cap — even for a video
                // file the user picked "video" for elsewhere in the form.
                const uploadType = f.typeFrom ? (formData[f.typeFrom] || 'image') : f.type
                return (
                  <>
                    <FileUpload
                      key={uploadType}
                      type={uploadType}
                      accept={uploadType === 'video' ? 'video/*' : 'image/*'}
                      onUploadComplete={(url) => setFormData({ ...formData, [f.name]: url })}
                    />
                    {formData[f.name] && uploadType === 'image' && (
                      <img src={formData[f.name]} alt="Preview" className="mt-2 w-full h-40 object-cover rounded-lg" />
                    )}
                    {formData[f.name] && uploadType === 'video' && (
                      <video src={formData[f.name]} controls className="mt-2 w-full h-40 rounded-lg" />
                    )}
                  </>
                )
              })()}
            </div>
          ))}

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex items-center space-x-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Save size={20} />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContentManager
