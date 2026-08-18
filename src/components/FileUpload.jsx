import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Upload, X, Loader2, ZoomIn, Check, RotateCcw } from 'lucide-react'
import { uploadImage, uploadVideo } from '../lib/cloudinary'
import { getCroppedImageFile } from '../lib/cropImage'
import toast from 'react-hot-toast'

const MAX_SIZE_MB = { image: 10, video: 100 }

const FileUpload = ({ onUploadComplete, type = 'image', accept = 'image/*', aspect = 4 / 3, containMode = false }) => {
  const [stage, setStage] = useState('pick') // 'pick' | 'crop' | 'ready'
  const [uploading, setUploading] = useState(false)

  const [rawSrc, setRawSrc] = useState(null) // data URL of the picked file
  const [rawFile, setRawFile] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const [finalFile, setFinalFile] = useState(null) // what actually gets uploaded
  const [finalPreview, setFinalPreview] = useState(null)

  const onCropComplete = useCallback((_area, pixels) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    const maxMb = MAX_SIZE_MB[type] ?? MAX_SIZE_MB.image
    if (selectedFile.size > maxMb * 1024 * 1024) {
      toast.error(`That file is ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB — ${type}s are limited to ${maxMb}MB.`)
      e.target.value = ''
      return
    }

    if (type === 'video') {
      // Videos skip the crop step entirely — upload as-is.
      setRawFile(selectedFile)
      setFinalFile(selectedFile)
      setFinalPreview(URL.createObjectURL(selectedFile))
      setStage('ready')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setRawSrc(reader.result)
      setRawFile(selectedFile)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setStage('crop')
    }
    reader.readAsDataURL(selectedFile)
  }

  const confirmCrop = async () => {
    if (!rawSrc || !croppedAreaPixels || !rawFile) return
    try {
      const cropped = await getCroppedImageFile(rawSrc, croppedAreaPixels, rawFile.name)
      setFinalFile(cropped)
      setFinalPreview(URL.createObjectURL(cropped))
      setStage('ready')
    } catch (error) {
      console.error('Crop error:', error)
      toast.error('Could not crop that image — try a different file.')
    }
  }

  const skipCrop = () => {
    // Admin wants the original file untouched, no crop applied.
    setFinalFile(rawFile)
    setFinalPreview(rawSrc)
    setStage('ready')
  }

  const backToCrop = () => setStage('crop')

  const handleUpload = async () => {
    if (!finalFile) return
    setUploading(true)
    try {
      const url = type === 'video' ? await uploadVideo(finalFile) : await uploadImage(finalFile)
      if (url) {
        onUploadComplete(url)
        toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully`)
        handleRemove()
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error?.message || `Failed to upload ${type}`)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setStage('pick')
    setRawSrc(null)
    setRawFile(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setFinalFile(null)
    setFinalPreview(null)
  }

  return (
    <div className="space-y-4">
      {stage === 'pick' && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
          <input
            type="file"
            id={`file-upload-${type}`}
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          <label htmlFor={`file-upload-${type}`} className="cursor-pointer flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">
              Click to upload {type === 'image' ? 'an image' : 'a video'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {type === 'image' ? "PNG, JPG, GIF up to 10MB — you'll crop it next" : 'MP4, MOV up to 100MB'}
            </p>
          </label>
        </div>
      )}

      {stage === 'crop' && (
        <div className="border border-gray-300 rounded-lg p-4 space-y-3">
          <p className="text-sm text-gray-600">
            {containMode
              ? 'Frame your logo — nothing outside the box will be cut off.'
              : "Drag to reposition, use the slider to zoom. This is exactly how it'll appear on the site."}
          </p>
          <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
            <Cropper
              image={rawSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              objectFit={containMode ? 'contain' : 'cover'}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex items-center gap-3">
            <ZoomIn size={18} className="text-gray-400 flex-shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div className="flex flex-wrap justify-end gap-3 pt-1">
            <button type="button" onClick={handleRemove} className="px-4 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={skipCrop} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Use original, don't crop
            </button>
            <button
              type="button"
              onClick={confirmCrop}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <Check size={16} /> Confirm crop
            </button>
          </div>
        </div>
      )}

      {stage === 'ready' && (
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="font-medium text-gray-700 truncate">{rawFile?.name}</p>
              <p className="text-sm text-gray-500">
                {finalFile ? (finalFile.size / 1024 / 1024).toFixed(2) : '0.00'} MB
              </p>
            </div>
            <button onClick={handleRemove} className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          {finalPreview && type === 'image' && (
            <div className="mb-3 relative">
              <img
                src={finalPreview}
                alt="Preview"
                className={`w-full rounded-lg ${containMode ? 'object-contain bg-gray-100 h-40' : 'object-cover h-48'}`}
              />
              {rawSrc && (
                <button
                  type="button"
                  onClick={backToCrop}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full px-3 py-1.5 shadow flex items-center gap-1 text-xs font-medium transition-colors"
                  title="Adjust crop"
                >
                  <RotateCcw size={13} /> Re-crop
                </button>
              )}
            </div>
          )}
          {finalPreview && type === 'video' && (
            <video src={finalPreview} controls className="mt-2 w-full h-40 rounded-lg mb-3" />
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default FileUpload
