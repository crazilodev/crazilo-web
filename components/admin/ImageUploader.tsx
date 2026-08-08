'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface ImageUploaderProps {
  bucket: string
  folder?: string
  images: string[]
  onImagesChange: (images: string[]) => void
  maxFiles?: number
}

export default function ImageUploader({
  bucket,
  folder = '',
  images,
  onImagesChange,
  maxFiles = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)

  const uploadFile = async (file: File): Promise<string | null> => {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const filename = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage.from(bucket).upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) {
      toast.error(`Upload failed: ${error.message}`)
      return null
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
    return data.publicUrl
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length >= maxFiles) {
        toast.error(`Max ${maxFiles} images allowed`)
        return
      }

      setUploading(true)
      const remainingSlots = maxFiles - images.length
      const filesToUpload = acceptedFiles.slice(0, remainingSlots)

      const uploadedUrls: string[] = []
      for (const file of filesToUpload) {
        const url = await uploadFile(file)
        if (url) uploadedUrls.push(url)
      }

      onImagesChange([...images, ...uploadedUrls])
      setUploading(false)
      if (uploadedUrls.length > 0) {
        toast.success(`${uploadedUrls.length} image(s) uploaded!`)
      }
    },
    [images, maxFiles, onImagesChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: maxFiles - images.length,
    disabled: uploading || images.length >= maxFiles,
  })

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {images.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-brand-red bg-red-50'
              : 'border-gray-200 hover:border-brand-red hover:bg-gray-50'
          } ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-brand-red animate-spin" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                <Upload className="w-7 h-7 text-brand-red" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
                </p>
                <p className="text-xs text-gray-400 mt-1">or click to browse • JPG, PNG, WebP • Max 10MB each</p>
              </div>
              <p className="text-xs text-gray-400">{images.length}/{maxFiles} images</p>
            </div>
          )}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((url, index) => (
            <div key={url} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
              <Image src={url} alt={`Image ${index + 1}`} fill className="object-cover" />
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1 font-semibold">
                  THUMBNAIL
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>First uploaded image will be used as thumbnail</span>
        </div>
      )}
    </div>
  )
}
