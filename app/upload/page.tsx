'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { uploadDocument } from '@/app/actions/document'
import { Button } from '@/components/ui/button'
import { Upload, FileText, ArrowLeft, Scale, Loader2, CheckCircle, AlertCircle, X, FileCheck } from 'lucide-react'
import Link from 'next/link'

export default function UploadPage() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<number | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileRef = useRef<File | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData()
    
    // Add the file from our ref
    if (fileRef.current) {
      formData.append('file', fileRef.current)
      console.log('[Upload] Added file to FormData:', fileRef.current.name)
    } else {
      console.log('[Upload] No file in ref')
    }
    
    // Debug: Check what's in the formData
    console.log('[Upload] Form submission started')
    for (const [key, value] of formData.entries()) {
      console.log(`[Upload] FormData - ${key}:`, value)
    }
    
    await processUpload(formData)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB in bytes
      if (file.size > maxSize) {
        setError(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds 10MB limit`)
        return
      }
      
      fileRef.current = file  // Store the actual file object
      setFileName(file.name)
      setFileSize(file.size)
      setError(null)
    }
  }

  const clearFileSelection = () => {
    fileRef.current = null  // Clear the file ref
    setFileName(null)
    setFileSize(null)
    setError(null)
    setUploadProgress(0)
    // Clear the file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  // Simulate upload progress for better UX
  useEffect(() => {
    if (isUploading && uploadProgress < 90) {
      const timer = setTimeout(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 15, 90))
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isUploading, uploadProgress])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const processUpload = async (formData: FormData) => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(10)

    try {
      
      const result = await uploadDocument(formData)
      
      if (result.error) {
        setError(result.error)
        setUploadProgress(0)
        // Don't clear the file selection on error - let user retry
      } else if (result.documentId) {
        setUploadProgress(100)
        setTimeout(() => {
          setUploadSuccess(true)
          setDocumentId(result.documentId)
          // Show success message for 1.5 seconds before redirecting
          setTimeout(() => {
            router.push(`/documents/${result.documentId}`)
          }, 1500)
        }, 300)
      }
    } catch (err) {
      console.error('Upload page error:', err)
      if (err instanceof Error) {
        setError(`Error: ${err.message}`)
      } else {
        setError('An unexpected error occurred. Check the console for details.')
      }
      // Clear the file selection on error
      clearFileSelection()
    } finally {
      setIsUploading(false)
      if (!uploadSuccess) {
        setUploadProgress(0)
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/pdf') {
        // Check file size
        const maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
          setError(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds 10MB limit`)
          return
        }
        
        fileRef.current = file  // Store the file
        setFileName(file.name)
        setFileSize(file.size)
        const formData = new FormData()
        formData.append('file', file)
        await processUpload(formData)
      } else {
        setError('Please upload a PDF file')
        clearFileSelection()
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Scale className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Upload Legal Document</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-gray-900 mb-2">Import Your Document</h2>
              <p className="text-gray-600">Upload a PDF file to begin editing</p>
            </div>

            {uploadSuccess ? (
              <div className="text-center py-12 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-700 shadow-lg">
                  <CheckCircle className="h-10 w-10 text-white animate-pulse" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Upload Successful!</h3>
                <p className="text-gray-600 mb-6">Your document has been processed and is ready for editing.</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                  <span>Redirecting to editor...</span>
                </div>
                <Link href={`/documents/${documentId}`}>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
                    <FileCheck className="mr-2 h-5 w-5" />
                    Go to Editor Now
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} onDragEnter={handleDrag}>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-200 ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : fileName 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <FileText className={`mx-auto h-16 w-16 mb-4 ${
                      fileName ? 'text-green-500' : 'text-gray-400'
                    }`} />
                    
                    {fileName ? (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="inline-flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-sm border border-green-200 mb-4">
                          <FileCheck className="h-5 w-5 text-green-600" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">{fileName}</p>
                            <p className="text-xs text-gray-500">{fileSize ? formatFileSize(fileSize) : ''}</p>
                          </div>
                          <button
                            type="button"
                            onClick={clearFileSelection}
                            className="ml-4 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Remove file"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                        <p className="text-sm text-green-600 font-medium">Ready to upload</p>
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-lg text-gray-700">
                            Drag and drop your PDF here, or{' '}
                            <span className="font-medium text-blue-600 hover:text-blue-500">
                              browse
                            </span>
                          </span>
                          <input
                            id="file-upload"
                            name="file"
                            type="file"
                            className="sr-only"
                            accept="application/pdf"
                            required
                            disabled={isUploading}
                            onChange={handleFileChange}
                          />
                        </label>
                        
                        <p className="text-sm text-gray-500 mt-2">PDF files up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Upload Failed</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setError(null)}
                        className="p-1 rounded-full hover:bg-red-100 transition-colors"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Progress Bar */}
                {isUploading && (
                  <div className="mt-6 animate-in fade-in duration-300">
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Processing document... {Math.round(uploadProgress)}%
                    </p>
                  </div>
                )}

                <div className="mt-8 flex justify-center">
                  <Button
                    type="submit"
                    disabled={isUploading || !fileName}
                    size="lg"
                    className={`min-w-[200px] transition-all duration-300 ${
                      isUploading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : fileName 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-5 w-5" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Info Section */}
          {!uploadSuccess && (
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl mb-1">📄</div>
                  <p className="text-sm text-gray-600">Supports all PDF formats</p>
                </div>
                <div>
                  <div className="text-2xl mb-1">🔒</div>
                  <p className="text-sm text-gray-600">Secure processing</p>
                </div>
                <div>
                  <div className="text-2xl mb-1">⚡</div>
                  <p className="text-sm text-gray-600">Fast extraction</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}