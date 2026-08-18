const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', (err) => reject(err))
    img.crossOrigin = 'anonymous'
    img.src = url
  })

// Cap the output so a 12MP phone photo doesn't turn into a multi-megabyte
// upload just because the admin picked a big crop area.
const MAX_OUTPUT_DIMENSION = 1600

export async function getCroppedImageFile(imageSrc, cropPixels, fileName, mimeType = 'image/jpeg') {
  const image = await createImage(imageSrc)

  let { width, height } = cropPixels
  if (width > MAX_OUTPUT_DIMENSION || height > MAX_OUTPUT_DIMENSION) {
    const scale = MAX_OUTPUT_DIMENSION / Math.max(width, height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    width,
    height
  )

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, 0.9))
  return new File([blob], fileName, { type: mimeType })
}
