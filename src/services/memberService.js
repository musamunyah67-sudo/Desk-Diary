import { restFetch } from './supabaseService'
import { uploadImage } from '../lib/cloudinary'

// Generate a cryptographically secure random token
const generateSecureToken = () => {
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for older browsers
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Get all members with creator info
export const getAllMembers = async (options = {}) => {
  try {
    const response = await restFetch('rpc/get_all_members', {
      method: 'POST',
      ...options
    })
    return response
  } catch (error) {
    console.error('Error fetching members:', error)
    return []
  }
}

// Create a new member with automatic QR generation
export const createMember = async (memberData, photoFile, options = {}) => {
  try {
    // Upload photo if provided
    let photoUrl = null
    if (photoFile) {
      photoUrl = await uploadImage(photoFile)
    }

    // Generate secure verification token
    const verificationToken = generateSecureToken()

    // Create member record
    const memberPayload = {
      member_id: memberData.memberId,
      full_name: memberData.fullName,
      position: memberData.position,
      status: memberData.status || 'active',
      photo_url: photoUrl,
      verification_token: verificationToken,
      verification_active: true,
      created_by: options.userId // Will be set from auth context
    }

    const response = await restFetch('members', {
      method: 'POST',
      body: JSON.stringify(memberPayload),
      ...options
    })

    return {
      ...response,
      verification_token: verificationToken
    }
  } catch (error) {
    console.error('Error creating member:', error)
    throw error
  }
}

// Update an existing member
export const updateMember = async (memberId, updates, photoFile, options = {}) => {
  try {
    // Upload new photo if provided
    if (photoFile) {
      updates.photo_url = await uploadImage(photoFile)
    }

    const response = await restFetch(`members?id=eq.${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
      ...options
    })

    return response && Array.isArray(response) ? response[0] : response
  } catch (error) {
    console.error('Error updating member:', error)
    throw error
  }
}

// Delete a member
export const deleteMember = async (memberId, options = {}) => {
  try {
    await restFetch(`members?id=eq.${memberId}`, {
      method: 'DELETE',
      ...options
    })
  } catch (error) {
    console.error('Error deleting member:', error)
    throw error
  }
}

// Regenerate QR code (new token)
export const regenerateMemberToken = async (memberId, options = {}) => {
  try {
    const response = await restFetch('rpc/regenerate_member_token', {
      method: 'POST',
      body: JSON.stringify({ member_uuid: memberId }),
      ...options
    })
    return response
  } catch (error) {
    console.error('Error regenerating token:', error)
    throw error
  }
}

// Toggle verification active status
export const toggleVerificationStatus = async (memberId, isActive, options = {}) => {
  try {
    const response = await restFetch(`members?id=eq.${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify({ verification_active: isActive }),
      ...options
    })
    return response && Array.isArray(response) ? response[0] : response
  } catch (error) {
    console.error('Error toggling verification status:', error)
    throw error
  }
}

// Verify a member by token (public function)
export const verifyMember = async (token) => {
  try {
    const response = await restFetch('rpc/verify_member', {
      method: 'POST',
      body: JSON.stringify({ verification_token: token })
    })
    return response
  } catch (error) {
    console.error('Error verifying member:', error)
    return {
      success: false,
      result: 'invalid',
      message: 'Verification failed'
    }
  }
}

// Get verification logs
export const getVerificationLogs = async (options = {}) => {
  try {
    const response = await restFetch('verification_logs?order=verified_at.desc&limit=100', options)
    return response
  } catch (error) {
    console.error('Error fetching verification logs:', error)
    return []
  }
}

// Check if member ID is unique
export const checkMemberIdUnique = async (memberId, excludeId = null, options = {}) => {
  try {
    let endpoint = `members?member_id=eq.${memberId}`
    if (excludeId) {
      endpoint += `&id=neq.${excludeId}`
    }
    const response = await restFetch(endpoint, options)
    return response.length === 0
  } catch (error) {
    console.error('Error checking member ID uniqueness:', error)
    return false
  }
}
