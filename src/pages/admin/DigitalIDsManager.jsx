import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'
import {
  UserPlus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  QrCode,
  Image as ImageIcon
} from 'lucide-react'
import { QRCodeCanvas as QRCode } from 'qrcode.react'
import toast from 'react-hot-toast'
import {
  getAllMembers,
  createMember,
  updateMember,
  deleteMember,
  regenerateMemberToken,
  toggleVerificationStatus,
  checkMemberIdUnique
} from '../../services/memberService'

const DigitalIDsManager = () => {
  const { user, accessToken, hasRole } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [verificationFilter, setVerificationFilter] = useState('all')

  // Form state
  const [formData, setFormData] = useState({
    memberId: '',
    fullName: '',
    position: '',
    status: 'active',
    photoFile: null
  })
  const [formLoading, setFormLoading] = useState(false)
  const [memberIdError, setMemberIdError] = useState('')

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    setLoading(true)
    try {
      const data = await getAllMembers({ accessToken })
      setMembers(data)
    } catch (error) {
      toast.error('Failed to load members')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMember = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setMemberIdError('')

    try {
      // Check member ID uniqueness
      const isUnique = await checkMemberIdUnique(formData.memberId, null, { accessToken })
      if (!isUnique) {
        setMemberIdError('This Member ID already exists')
        setFormLoading(false)
        return
      }

      const result = await createMember(formData, formData.photoFile, { 
        accessToken,
        userId: user.id 
      })

      toast.success('Member created successfully')
      setShowCreateForm(false)
      resetForm()
      loadMembers()

      // Show QR modal with the new member
      setSelectedMember(result)
      setShowQRModal(true)
    } catch (error) {
      toast.error(error.message || 'Failed to create member')
      console.error(error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateMember = async (e) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      // Check member ID uniqueness if changed
      if (formData.memberId !== selectedMember.member_id) {
        const isUnique = await checkMemberIdUnique(formData.memberId, selectedMember.id, { accessToken })
        if (!isUnique) {
          setMemberIdError('This Member ID already exists')
          setFormLoading(false)
          return
        }
      }

      await updateMember(selectedMember.id, {
        member_id: formData.memberId,
        full_name: formData.fullName,
        position: formData.position,
        status: formData.status
      }, formData.photoFile, { accessToken })

      toast.success('Member updated successfully')
      setShowEditForm(false)
      resetForm()
      loadMembers()
    } catch (error) {
      toast.error(error.message || 'Failed to update member')
      console.error(error)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteMember = async (member) => {
    if (!confirm(`Are you sure you want to delete ${member.full_name}?`)) return

    try {
      await deleteMember(member.id, { accessToken })
      toast.success('Member deleted successfully')
      loadMembers()
    } catch (error) {
      toast.error('Failed to delete member')
      console.error(error)
    }
  }

  const handleRegenerateQR = async (member) => {
    if (!confirm('Regenerating this QR code will invalidate the existing QR code on the member\'s ID card. Continue?')) return

    try {
      const result = await regenerateMemberToken(member.id, { accessToken })
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('QR code regenerated successfully')
      setSelectedMember({ ...member, verification_token: result.new_token })
      setShowQRModal(true)
      loadMembers()
    } catch (error) {
      toast.error('Failed to regenerate QR code')
      console.error(error)
    }
  }

  const handleToggleVerification = async (member) => {
    const newStatus = !member.verification_active
    const action = newStatus ? 'activate' : 'deactivate'

    if (!confirm(`Are you sure you want to ${action} verification for ${member.full_name}?`)) return

    try {
      await toggleVerificationStatus(member.id, newStatus, { accessToken })
      toast.success(`Verification ${action}d successfully`)
      loadMembers()
    } catch (error) {
      toast.error(`Failed to ${action} verification`)
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      memberId: '',
      fullName: '',
      position: '',
      status: 'active',
      photoFile: null
    })
    setMemberIdError('')
    setSelectedMember(null)
  }

  const openEditForm = (member) => {
    setSelectedMember(member)
    setFormData({
      memberId: member.member_id,
      fullName: member.full_name,
      position: member.position,
      status: member.status,
      photoFile: null
    })
    setShowEditForm(true)
  }

  const getVerificationURL = (token) => {
    const baseUrl = window.location.origin
    return `${baseUrl}/verify/${token}`
  }

  const downloadQR = (format = 'png') => {
    const canvas = document.getElementById('qr-canvas')
    if (!canvas) return

    const url = canvas.toDataURL(`image/${format}`)
    const link = document.createElement('a')
    link.download = `desk-diary-qr-${selectedMember?.member_id || 'member'}.${format}`
    link.href = url
    link.click()
    toast.success(`QR code downloaded as ${format.toUpperCase()}`)
  }

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.member_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    const matchesVerification = verificationFilter === 'all' || 
      (verificationFilter === 'active' ? member.verification_active : !member.verification_active)

    return matchesSearch && matchesStatus && matchesVerification
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Loading members...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-anton text-3xl text-primary">Digital IDs</h2>
        <button
          onClick={() => {
            resetForm()
            setShowCreateForm(true)
          }}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <UserPlus size={20} />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, ID, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Verification</option>
            <option value="active">Verification Active</option>
            <option value="inactive">Verification Inactive</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR</th>
                {hasRole('superadmin') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={hasRole('superadmin') ? 8 : 7} className="px-6 py-12 text-center text-gray-500">
                    No members found. Create your first member to get started.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <ImageIcon size={24} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.member_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' :
                        member.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.verification_active ? (
                        <CheckCircle size={20} className="text-green-500" />
                      ) : (
                        <XCircle size={20} className="text-red-500" />
                      )}
                    </td>
                    {hasRole('superadmin') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.created_by_email || 'Unknown'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedMember(member)
                            setShowQRModal(true)
                          }}
                          className="text-primary hover:text-primary/80"
                          title="View QR"
                        >
                          <QrCode size={18} />
                        </button>
                        <button
                          onClick={() => openEditForm(member)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleRegenerateQR(member)}
                          className="text-purple-600 hover:text-purple-800"
                          title="Regenerate QR"
                        >
                          <RefreshCw size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleVerification(member)}
                          className={member.verification_active ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}
                          title={member.verification_active ? 'Deactivate' : 'Activate'}
                        >
                          {member.verification_active ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Member Modal */}
      {showCreateForm && (
        <MemberFormModal
          title="Add New Member"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateMember}
          onCancel={() => {
            setShowCreateForm(false)
            resetForm()
          }}
          loading={formLoading}
          memberIdError={memberIdError}
        />
      )}

      {/* Edit Member Modal */}
      {showEditForm && (
        <MemberFormModal
          title="Edit Member"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdateMember}
          onCancel={() => {
            setShowEditForm(false)
            resetForm()
          }}
          loading={formLoading}
          memberIdError={memberIdError}
          isEdit
        />
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedMember && (
        <QRModal
          member={selectedMember}
          onClose={() => setShowQRModal(false)}
          onDownload={downloadQR}
          verificationURL={getVerificationURL(selectedMember.verification_token)}
        />
      )}
    </div>
  )
}

// Member Form Modal Component
const MemberFormModal = ({ title, formData, setFormData, onSubmit, onCancel, loading, memberIdError, isEdit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <h3 className="font-anton text-2xl text-primary mb-6">{title}</h3>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="William W. Flomo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Founder & Executive Director"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Member ID</label>
              <input
                type="text"
                required
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${memberIdError ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="470-0401-001"
              />
              {memberIdError && <p className="text-red-500 text-sm mt-1">{memberIdError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photograph</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, photoFile: e.target.files[0] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formData.photoFile && (
                <p className="text-sm text-gray-500 mt-1">Selected: {formData.photoFile.name}</p>
              )}
            </div>
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : isEdit ? 'Update Member' : 'Create Member'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// QR Code Modal Component
const QRModal = ({ member, onClose, onDownload, verificationURL }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-sm w-full"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-anton text-2xl text-primary">Digital Verification</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle size={24} />
            </button>
          </div>

          <div className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg border-2 border-primary inline-block">
              <QRCode
                id="qr-canvas"
                value={verificationURL}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">Member ID: <span className="font-semibold">{member.member_id}</span></p>
              <p className="text-sm text-gray-600">{member.full_name}</p>
              <p className="text-sm text-gray-600">{member.position}</p>
            </div>

            <div className="flex space-x-2 pt-4">
              <button
                onClick={() => onDownload('png')}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
              >
                <Download size={18} />
                <span>PNG</span>
              </button>
              <button
                onClick={() => window.open(verificationURL, '_blank')}
                className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center space-x-2"
              >
                <Eye size={18} />
                <span>View</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DigitalIDsManager
