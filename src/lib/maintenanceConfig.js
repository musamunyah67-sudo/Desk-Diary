export const MAINTENANCE_OWNER_EMAIL = 'grfmajor7@gmail.com'

export const isMaintenanceOwner = (email) =>
  typeof email === 'string' && email.trim().toLowerCase() === MAINTENANCE_OWNER_EMAIL
