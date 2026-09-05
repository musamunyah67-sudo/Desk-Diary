import { supabase } from '../lib/supabase'

// Helper function for REST API calls to bypass SDK timeout issues
export const restFetch = async (endpoint, options = {}) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  if (import.meta.env.DEV) console.log(`REST API call: ${endpoint}`, options.method || 'GET')
  
  const headers = {
    'apikey': supabaseAnonKey,
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  // Add authorization header if access token is available
  if (options.accessToken) {
    headers['Authorization'] = `Bearer ${options.accessToken}`
  }
  
  const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    headers,
    ...options
  })
  
  if (import.meta.env.DEV) console.log(`REST API response: ${endpoint}`, response.status)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    console.error(`REST API error: ${endpoint}`, error)
    throw error
  }
  
  // Handle empty responses (e.g., DELETE operations)
  const text = await response.text()
  if (!text) {
    if (import.meta.env.DEV) console.log(`REST API empty response: ${endpoint}`)
    return null
  }
  
  try {
    const data = JSON.parse(text)
    if (import.meta.env.DEV) console.log(`REST API success: ${endpoint}`, data)
    return data
  } catch (e) {
    console.error(`REST API JSON parse error: ${endpoint}`, e, text)
    throw new Error(`Failed to parse response: ${text.substring(0, 100)}`)
  }
}

// Stories
export const getStories = async (category = null) => {
  try {
    let endpoint = 'stories?published=eq.true&order=created_at.desc'
    if (category) {
      endpoint = `stories?published=eq.true&category=eq.${category}&order=created_at.desc`
    }
    const data = await restFetch(endpoint)
    return data
  } catch (error) {
    console.log('Error fetching stories:', error)
    return []
  }
}

export const getStoryById = async (id) => {
  try {
    const data = await restFetch(`stories?id=eq.${id}`)
    return data[0] || null
  } catch (error) {
    console.log('Error fetching story by id:', error)
    return null
  }
}

// News
export const getNews = async (category = null) => {
  try {
    let endpoint = 'news?published=eq.true&order=created_at.desc'
    if (category) {
      endpoint = `news?published=eq.true&category=eq.${category}&order=created_at.desc`
    }
    const data = await restFetch(endpoint)
    return data
  } catch (error) {
    console.log('Error fetching news:', error)
    return []
  }
}

export const getNewsById = async (id) => {
  try {
    const data = await restFetch(`news?id=eq.${id}`)
    return data[0] || null
  } catch (error) {
    console.log('Error fetching news by id:', error)
    return null
  }
}

// Events
export const getEvents = async (status = null) => {
  try {
    let endpoint = 'events?order=date.asc'
    if (status) {
      endpoint = `events?status=eq.${status}&order=date.asc`
    }
    const data = await restFetch(endpoint)
    return data
  } catch (error) {
    console.log('Error fetching events:', error)
    return []
  }
}

export const getEventById = async (id) => {
  try {
    const data = await restFetch(`events?id=eq.${id}`)
    return data[0] || null
  } catch (error) {
    console.log('Error fetching event by id:', error)
    return null
  }
}

// Gallery
export const getGallery = async (category = null) => {
  try {
    let endpoint = 'gallery?order=created_at.desc'
    if (category) {
      endpoint = `gallery?category=eq.${category}&order=created_at.desc`
    }
    const data = await restFetch(endpoint)
    return data
  } catch (error) {
    console.log('Error fetching gallery:', error)
    return []
  }
}

export const getGalleryItemById = async (id) => {
  try {
    const data = await restFetch(`gallery?id=eq.${id}`)
    return data[0] || null
  } catch (error) {
    console.log('Error fetching gallery item by id:', error)
    return null
  }
}

// Partners
// `featured` and `isPartner` are independent flags on the same row — a
// school can be featured without being a formal partner org, or a partner
// without appearing on the featured highlights. Pass null to skip a filter.
export const getPartners = async (featured = null, isPartner = null) => {
  try {
    const filters = []
    if (featured !== null) filters.push(`featured=eq.${featured}`)
    if (isPartner !== null) filters.push(`is_partner=eq.${isPartner}`)
    const endpoint = filters.length
      ? `partners?${filters.join('&')}&order=name.asc`
      : 'partners?order=name.asc'
    const data = await restFetch(endpoint)
    return data
  } catch (error) {
    console.log('Error fetching partners:', error)
    return []
  }
}

export const getPartnerById = async (id) => {
  try {
    const data = await restFetch(`partners?id=eq.${id}`)
    return data[0] || null
  } catch (error) {
    console.log('Error fetching partner by id:', error)
    return null
  }
}

// Programs
export const getPrograms = async () => {
  try {
    const data = await restFetch('programs')
    return data
  } catch (error) {
    console.log('Error fetching programs:', error)
    return []
  }
}

export const getProgramById = async (id) => {
  try {
    const data = await restFetch(`programs?id=eq.${id}`)
    return data[0] || null
  } catch (error) {
    console.log('Error fetching program by id:', error)
    return null
  }
}

// Volunteer Opportunities
export const getVolunteerOpportunities = async () => {
  try {
    const data = await restFetch('volunteer_opportunities')
    return data
  } catch (error) {
    console.log('Error fetching volunteer opportunities:', error)
    return []
  }
}

export const getVolunteerOpportunityById = async (id) => {
  try {
    const data = await restFetch(`volunteer_opportunities?id=eq.${id}`)
    return data[0] || null
  } catch (error) {
    console.log('Error fetching volunteer opportunity by id:', error)
    return null
  }
}

// Campaigns
export const getCampaigns = async () => {
  try {
    const data = await restFetch('campaigns')
    return data
  } catch (error) {
    console.log('Error fetching campaigns:', error)
    return []
  }
}

export const getCampaignById = async (id) => {
  try {
    const data = await restFetch(`campaigns?id=eq.${id}`)
    return data[0] || null
  } catch (error) {
    console.log('Error fetching campaign by id:', error)
    return null
  }
}

// Testimonials
export const getTestimonials = async () => {
  try {
    const data = await restFetch('testimonials?published=eq.true&order=created_at.desc')
    return data
  } catch (error) {
    console.log('Error fetching testimonials:', error)
    return []
  }
}

// Volunteer Resources
export const getVolunteerResources = async () => {
  try {
    const data = await restFetch('volunteer_resources?order=created_at.desc')
    return data
  } catch (error) {
    console.log('Error fetching volunteer resources:', error)
    return []
  }
}

// Donation Methods
export const getDonationMethods = async () => {
  try {
    const data = await restFetch('donation_methods?order=display_order.asc')
    return data
  } catch (error) {
    console.log('Error fetching donation methods:', error)
    return []
  }
}

// Sponsors
export const getSponsors = async () => {
  try {
    const data = await restFetch('sponsors?order=created_at.desc')
    return data
  } catch (error) {
    console.log('Error fetching sponsors:', error)
    return []
  }
}

// Supporters
export const getSupporters = async () => {
  try {
    const data = await restFetch('supporters?order=created_at.desc')
    return data
  } catch (error) {
    console.log('Error fetching supporters:', error)
    return []
  }
}

// Platform Settings
export const getPlatformSettings = async (key) => {
  try {
    const data = await restFetch(`platform_settings?key=eq.${key}`)
    return data[0]?.value || null
  } catch (error) {
    console.log('Error fetching platform settings:', error)
    return null
  }
}

export const updatePlatformSettings = async (key, value, options = {}) => {
  console.log('Updating platform settings:', key, value)
  const response = await restFetch(`platform_settings?key=eq.${key}`, {
    method: 'PATCH',
    body: JSON.stringify({ value }),
    ...options
  })
  console.log('Platform settings update response:', response)
  return response
}

// Contact Settings
export const getContactSettings = async () => {
  try {
    const data = await restFetch('contact_settings?limit=1')
    return data[0] || null
  } catch (error) {
    console.log('Error fetching contact settings:', error)
    return null
  }
}

export const updateContactSettings = async (settings, options = {}) => {
  console.log('Updating contact settings:', settings)
  const response = await restFetch('contact_settings', {
    method: 'PATCH',
    body: JSON.stringify(settings),
    ...options
  })
  console.log('Contact settings update response:', response)
  return response
}

// Newsletter
export const subscribeToNewsletter = async (email) => {
  const response = await restFetch('newsletter_subscriptions', {
    method: 'POST',
    body: JSON.stringify({ email })
  })
  return response
}

// Volunteer Application
export const submitVolunteerApplication = async (application) => {
  const response = await restFetch('volunteer_applications', {
    method: 'POST',
    body: JSON.stringify(application)
  })
  return response
}

// Contact form
export const submitContactMessage = async (message) => {
  const response = await restFetch('contact_messages', {
    method: 'POST',
    body: JSON.stringify(message)
  })
  return response
}

// Partnership inquiry
export const submitPartnershipInquiry = async (inquiry) => {
  const response = await restFetch('partnership_inquiries', {
    method: 'POST',
    body: JSON.stringify(inquiry)
  })
  return response
}

// School partnership submission
export const submitSchoolSubmission = async (submission) => {
  const response = await restFetch('school_submissions', {
    method: 'POST',
    body: JSON.stringify(submission)
  })
  return response
}

// ---------------------------------------------------------------------
// Generic CRUD helper — used by the admin dashboard's generic content
// manager so every content type (news, events, gallery, partners,
// programs, volunteer opportunities/resources, campaigns, testimonials,
// donation methods, sponsors, supporters) shares one implementation
// instead of needing hand-written duplicates for each.
// ---------------------------------------------------------------------
export const getAllRows = async (table, orderBy = 'created_at', ascending = false, options = {}) => {
  const orderDir = ascending ? 'asc' : 'desc'
  const data = await restFetch(`${table}?order=${orderBy}.${orderDir}`, options)
  return data
}

export const createRow = async (table, data, options = {}) => {
  const response = await restFetch(table, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options
  })
  return response && Array.isArray(response) ? response[0] : response
}

export const updateRow = async (table, id, updates, options = {}) => {
  const response = await restFetch(`${table}?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
    ...options
  })
  return response && Array.isArray(response) ? response[0] : response
}

export const deleteRow = async (table, id, options = {}) => {
  await restFetch(`${table}?id=eq.${id}`, {
    method: 'DELETE',
    ...options
  })
}

// ---------------------------------------------------------------------
// User roles / admin management
// Uses the SECURITY DEFINER RPC functions defined in supabase-schema.sql
// so this can be called safely from the browser with the anon/authed
// client — the functions re-check the caller's own role server-side.
// ---------------------------------------------------------------------
export const listAdminUsers = async (options = {}) => {
  const response = await restFetch('rpc/list_admin_users', {
    method: 'POST',
    ...options
  })
  return response
}

export const assignRoleByEmail = async (email, role, options = {}) => {
  const response = await restFetch('rpc/assign_role_by_email', {
    method: 'POST',
    body: JSON.stringify({ target_email: email, new_role: role }),
    ...options
  })
  return response
}

export const revokeRoleByEmail = async (email, options = {}) => {
  const response = await restFetch('rpc/revoke_role_by_email', {
    method: 'POST',
    body: JSON.stringify({ target_email: email }),
    ...options
  })
  return response
}

// Creates a brand-new login (not just promoting an existing account) via the
// create-user Edge Function, which uses the service_role key server-side.
// See supabase/functions/create-user/index.ts.
export const createUserLogin = async ({ email, password, role, sendInvite }, options = {}) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const headers = {
    'apikey': supabaseAnonKey,
    'Content-Type': 'application/json',
  }

  // Add Authorization header if accessToken is provided
  if (options.accessToken) {
    headers['Authorization'] = `Bearer ${options.accessToken}`
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/create-user`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'create_user', email, password, role, sendInvite })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.error || error.message || 'Failed to create user')
  }

  return response.json()
}

// Sets a NEW password for an EXISTING user, as a Superadmin/Admin, via the
// same create-user Edge Function (service_role required — see
// supabase/functions/create-user/index.ts). Use this for "reset this
// person's password" from the admin dashboard.
export const resetUserPassword = async ({ targetUserId, newPassword }, options = {}) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const headers = {
    'apikey': supabaseAnonKey,
    'Content-Type': 'application/json',
  }
  if (options.accessToken) {
    headers['Authorization'] = `Bearer ${options.accessToken}`
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/create-user`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'reset_password', targetUserId, newPassword })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.error || error.message || 'Failed to reset password')
  }

  return response.json()
}

// Lets the CURRENTLY LOGGED-IN admin change their own password. Unlike
// resetUserPassword above, this needs no elevated privileges at all — it's
// the standard Supabase Auth "update my own user" endpoint, authenticated
// with the caller's own access token. Any signed-in user can always change
// their own password this way; no service_role key involved.
export const updateOwnPassword = async (newPassword, options = {}) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'PUT',
    headers: {
      'apikey': supabaseAnonKey,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${options.accessToken}`,
    },
    body: JSON.stringify({ password: newPassword })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.error_description || error.msg || error.message || 'Failed to update password')
  }

  return response.json()
}

// Admin functions - using generic CRUD helpers now
export const getAllStories = async () => getAllRows('stories', 'created_at', false)
export const createStory = async (story) => createRow('stories', story)
export const updateStory = async (id, updates) => updateRow('stories', id, updates)
export const deleteStory = async (id) => deleteRow('stories', id)

export const getAllNews = async () => getAllRows('news', 'created_at', false)
export const createNews = async (news) => createRow('news', news)
export const updateNews = async (id, updates) => updateRow('news', id, updates)
export const deleteNews = async (id) => deleteRow('news', id)

export const getAllEvents = async () => getAllRows('events', 'date', true)
export const createEvent = async (event) => createRow('events', event)
export const updateEvent = async (id, updates) => updateRow('events', id, updates)
export const deleteEvent = async (id) => deleteRow('events', id)

export const createEventRegistration = async (registration) => createRow('event_registrations', registration)
export const getEventRegistrations = async () => getAllRows('event_registrations', 'created_at', false)

export const getAllGallery = async () => getAllRows('gallery', 'created_at', false)
export const createGalleryItem = async (item) => createRow('gallery', item)
export const deleteGalleryItem = async (id) => deleteRow('gallery', id)

export const getAllPartners = async () => getAllRows('partners', 'created_at', false)
export const createPartner = async (partner) => createRow('partners', partner)
export const updatePartner = async (id, updates) => updateRow('partners', id, updates)
export const deletePartner = async (id) => deleteRow('partners', id)

export const getAllVolunteerOpportunities = async () => getAllRows('volunteer_opportunities', 'created_at', false)
export const createVolunteerOpportunity = async (opportunity) => createRow('volunteer_opportunities', opportunity)
export const updateVolunteerOpportunity = async (id, updates) => updateRow('volunteer_opportunities', id, updates)
export const deleteVolunteerOpportunity = async (id) => deleteRow('volunteer_opportunities', id)

export const getAllCampaigns = async () => getAllRows('campaigns', 'created_at', false)
export const createCampaign = async (campaign) => createRow('campaigns', campaign)
export const updateCampaign = async (id, updates) => updateRow('campaigns', id, updates)
export const deleteCampaign = async (id) => deleteRow('campaigns', id)

// ---------------------------------------------------------------------
// Maintenance mode
// get_maintenance_status() is public (anon included) — every page load
// needs to know whether to show the maintenance page.
// set_maintenance_mode() is the only write path, and the database itself
// (not this file) rejects anyone but the exact maintenance owner — see
// create_maintenance_mode.sql.
// ---------------------------------------------------------------------
export const getMaintenanceStatus = async () => {
  try {
    const response = await restFetch('rpc/get_maintenance_status', { method: 'POST' })
    return response || { enabled: false, message: null }
  } catch (error) {
    // If this fails for any reason, fail OPEN (site behaves as if
    // maintenance mode is off) rather than accidentally locking
    // everyone out because of a transient network/API error.
    console.error('Error fetching maintenance status:', error)
    return { enabled: false, message: null }
  }
}

export const setMaintenanceMode = async (enabled, message, options = {}) => {
  const response = await restFetch('rpc/set_maintenance_mode', {
    method: 'POST',
    body: JSON.stringify({ p_enabled: enabled, p_message: message ?? null }),
    ...options
  })
  return response
}
