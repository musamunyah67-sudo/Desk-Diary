const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const DRIVE_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || ''

// Load Google Identity Services dynamically
let gisLoaded = false
let tokenClient = null
let accessToken = null

const loadGis = () => {
  return new Promise((resolve, reject) => {
    if (gisLoaded) {
      resolve()
      return
    }

    console.log('[Google Drive] Loading GIS script...')
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => {
      gisLoaded = true
      console.log('[Google Drive] GIS script loaded successfully')
      resolve()
    }
    script.onerror = (error) => {
      console.error('[Google Drive] GIS script failed to load:', error)
      reject(new Error('Failed to load Google Identity Services script'))
    }
    document.head.appendChild(script)
  })
}

const initializeGoogleAuth = async () => {
  if (!CLIENT_ID) {
    throw new Error(
      'Google Drive is not configured. Set VITE_GOOGLE_CLIENT_ID in .env'
    )
  }

  console.log('[Google Drive] Initializing Google Auth...')
  console.log('[Google Drive] Client ID:', CLIENT_ID.substring(0, 20) + '...')

  await loadGis()

  console.log('[Google Drive] Script loaded, initializing token client...')
  if (!tokenClient) {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (response) => {
        console.log('[Google Drive] Token callback received:', response)
        accessToken = response.access_token
      },
    })
    console.log('[Google Drive] Token client initialized')
  }
}

const getAccessToken = async () => {
  await initializeGoogleAuth()

  if (accessToken) {
    // Verify token is still valid by making a simple API call
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (response.ok) {
        return accessToken
      }
    } catch (error) {
      console.log('[Google Drive] Token expired, requesting new one')
    }
  }

  // Request new token
  return new Promise((resolve, reject) => {
    tokenClient.requestAccessToken({
      prompt: '',
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response.access_token)
        }
      },
    })
  })
}

const uploadToDrive = async (file, folderId = DRIVE_FOLDER_ID) => {
  console.log('Google Drive upload started:', { fileName: file.name, fileSize: file.size, folderId })

  const token = await getAccessToken()
  console.log('[Google Drive] Access token obtained')

  const metadata = {
    name: file.name,
    parents: folderId ? [folderId] : undefined,
  }

  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', file)

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  })

  console.log('Google Drive response status:', response.status)

  if (!response.ok) {
    const errText = await response.text()
    console.error('Google Drive upload error:', errText)
    throw new Error(`Google Drive upload failed (${response.status}): ${errText}`)
  }

  const data = await response.json()
  console.log('Google Drive upload success:', data)

  // Make file publicly viewable
  const permissionResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone',
    }),
  })

  if (!permissionResponse.ok) {
    const errorText = await permissionResponse.text()
    console.error('[Google Drive] Failed to set public permissions:', errorText)
  } else {
    console.log('[Google Drive] Public permissions set successfully')
  }

  // Get the file ID and create direct embeddable link
  // Use uc?export=view format which is most reliable for <img> tags
  const fileId = data.id
  const embeddableUrl = `https://drive.google.com/uc?export=view&id=${fileId}`
  console.log('Google Drive embeddable URL:', embeddableUrl)
  return embeddableUrl
}

// Export functions that match Cloudinary's interface
export const uploadImage = (file) => uploadToDrive(file)
export const uploadVideo = (file) => uploadToDrive(file)
export const uploadFile = (file) => uploadToDrive(file)

// Helper to get direct download link from Drive link
export const getDriveDownloadLink = (driveUrl) => {
  if (!driveUrl) return driveUrl

  // If it's already in the correct format, return as-is
  if (driveUrl.includes('uc?export=view')) {
    return driveUrl
  }

  // Convert thumbnail format to uc?export=view format
  if (driveUrl.includes('drive.google.com/thumbnail?id=')) {
    const fileId = driveUrl.match(/thumbnail\?id=([^&]+)/)?.[1]
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`
    }
  }

  // Convert view link to direct download link if needed
  if (driveUrl.includes('drive.google.com/file/d/')) {
    const fileId = driveUrl.match(/\/file\/d\/([^\/]+)/)?.[1]
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`
    }
  }

  return driveUrl
}
