import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Briefcase,
  Calendar,
  Image as ImageIcon
} from 'lucide-react'
import { verifyMember } from '../services/memberService'

const VerifyMember = () => {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [verificationData, setVerificationData] = useState(null)

  useEffect(() => {
    verifyMemberToken()
  }, [token])

  const verifyMemberToken = async () => {
    setLoading(true)
    try {
      const result = await verifyMember(token)
      setVerificationData(result)
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationData({
        success: false,
        result: 'invalid',
        message: 'Verification failed'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying...</p>
        </div>
      </div>
    )
  }

  if (!verificationData || !verificationData.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h1 className="font-anton text-3xl text-primary mb-2">DESK DIARY</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 font-semibold text-lg">⚠️ VERIFICATION FAILED</p>
            <p className="text-red-600 text-sm mt-2">We could not verify this Desk Diary ID.</p>
          </div>
          <p className="text-gray-500 text-sm">Please check the QR code or contact Desk Diary administration.</p>
        </motion.div>
      </div>
    )
  }

  const { result, member_id, full_name, position, status, photo_url, issued_at } = verificationData

  const getStatusConfig = () => {
    switch (result) {
      case 'verified':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-500',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          title: '🟢 VERIFIED',
          message: 'This is a valid Desk Diary member.'
        }
      case 'inactive':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-500',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          title: '🟠 INACTIVE',
          message: 'This Desk Diary membership is currently inactive.'
        }
      case 'suspended':
        return {
          icon: XCircle,
          bgColor: 'bg-red-100',
          iconColor: 'text-red-500',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          title: '🔴 SUSPENDED',
          message: 'This Desk Diary membership has been suspended.'
        }
      case 'revoked':
        return {
          icon: XCircle,
          bgColor: 'bg-red-100',
          iconColor: 'text-red-500',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          title: '🔴 VERIFICATION INVALID',
          message: 'This Desk Diary ID is no longer valid.'
        }
      default:
        return {
          icon: AlertCircle,
          bgColor: 'bg-gray-100',
          iconColor: 'text-gray-500',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          title: '⚠️ VERIFICATION FAILED',
          message: 'We could not verify this Desk Diary ID.'
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-anton text-4xl text-primary mb-2">DESK DIARY</h1>
          <p className="text-gray-600">Digital Member Verification</p>
        </div>

        {/* Verification Status Card */}
        <div className={`bg-white rounded-lg shadow-lg border-2 ${statusConfig.borderColor} overflow-hidden mb-6`}>
          <div className={`${statusConfig.bgColor} p-6 text-center`}>
            <StatusIcon size={48} className={`${statusConfig.iconColor} mx-auto mb-2`} />
            <p className={`font-anton text-2xl ${statusConfig.textColor}`}>{statusConfig.title}</p>
            <p className={statusConfig.textColor}>{statusConfig.message}</p>
          </div>

          {/* Member Information */}
          <div className="p-6">
            {/* Photo */}
            <div className="flex justify-center mb-6">
              {photo_url ? (
                <img
                  src={photo_url}
                  alt={full_name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                  <ImageIcon size={48} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Member Details */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <User className="text-gray-400 mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Member</p>
                  <p className="font-semibold text-gray-900">{full_name}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Briefcase className="text-gray-400 mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="font-semibold text-gray-900">{position}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="text-gray-400 mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    status === 'active' ? 'bg-green-100 text-green-800' :
                    status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="text-gray-400 mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Member ID</p>
                  <p className="font-mono text-sm text-gray-900">{member_id}</p>
                </div>
              </div>

              {issued_at && (
                <div className="flex items-start space-x-3">
                  <Calendar className="text-gray-400 mt-1 shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Issued</p>
                    <p className="text-sm text-gray-900">{new Date(issued_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Verification Result */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">Verification</p>
              <p className="font-semibold text-gray-900">
                {result === 'verified' ? '✓ Verified Desk Diary Member' :
                 result === 'inactive' ? 'Membership Inactive' :
                 result === 'suspended' ? 'Membership Suspended' :
                 result === 'revoked' ? 'Verification Invalid' :
                 'Verification Failed'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Scan the QR code on any Desk Diary ID card</p>
          <p className="mt-1">to verify member authenticity</p>
        </div>
      </motion.div>
    </div>
  )
}

export default VerifyMember
