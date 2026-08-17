const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const uploadToCloudinary = async (file, resourceType) => {
  console.log('Cloudinary upload started:', { CLOUD_NAME, UPLOAD_PRESET, resourceType, fileName: file.name, fileSize: file.size })
  
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env ' +
      '(create an unsigned upload preset in the Cloudinary dashboard first).'
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'desk-diary')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: 'POST', body: formData }
  )

  console.log('Cloudinary response status:', response.status)

  if (!response.ok) {
    const errText = await response.text()
    console.error('Cloudinary upload error:', errText)
    throw new Error(`Cloudinary upload failed (${response.status}): ${errText}`)
  }

  const data = await response.json()
  console.log('Cloudinary upload success:', data)
  return data.secure_url
}

// Both return the uploaded file's secure URL (string), ready to store
// directly in Supabase (e.g. image_url, media_url columns).
export const uploadImage = (file) => uploadToCloudinary(file, 'image')
export const uploadVideo = (file) => uploadToCloudinary(file, 'video')
