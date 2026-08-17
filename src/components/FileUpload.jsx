import { useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadImage, uploadVideo } from '../lib/cloudinary'
import toast from 'react-hot-toast'

const MAX_SIZE_MB = { image: 10, video: 100 }

const FileUpload = ({ onUploadComplete, type = 'image', accept = 'image/*' }) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    const maxMb = MAX_SIZE_MB[type] ?? MAX_SIZE_MB.image
    if (selectedFile.size > maxMb * 1024 * 1024) {
      toast.error(`That file is ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB — ${type}s are limited to ${maxMb}MB.`)
      e.target.value = ''
      return
    }

    setFile(selectedFile)
    if (type === 'image') {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      let url
      if (type === 'image') {
        url = await uploadImage(file)
      } else if (type === 'video') {
        url = await uploadVideo(file)
      }
      
      if (url) {
        onUploadComplete(url)
        toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully`)
        setFile(null)
        setPreview(null)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error?.message || `Failed to upload ${type}`)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
  }

  return (
    <div className="space-y-4">
      {!file ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
          <input
            type="file"
            id="file-upload"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">
              Click to upload {type === 'image' ? 'an image' : 'a video'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {type === 'image' ? 'PNG, JPG, GIF up to 10MB' : 'MP4, MOV up to 100MB'}
            </p>
          </label>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="font-medium text-gray-700 truncate">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {preview && (
            <div className="mb-4">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
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
