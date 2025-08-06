'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadDocument } from '@/app/actions/document'
import { Button } from '@/components/ui/button'
import { Upload, FileText, ArrowLeft, Scale, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function UploadPage() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [documentId, setDocumentId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await processUpload(formData)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setError(null)
    }
  }

  const processUpload = async (formData: FormData) => {
    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadDocument(formData)
      
      if (result.error) {
        setError(result.error)
      } else if (result.documentId) {
        setUploadSuccess(true)
        setDocumentId(result.documentId)
        // Show success message for 2 seconds before redirecting
        setTimeout(() => {
          router.push(`/documents/${result.documentId}`)
        }, 2000)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsUploading(false)
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
        setFileName(file.name)
        const formData = new FormData()
        formData.append('file', file)
        await processUpload(formData)
      } else {
        setError('Please upload a PDF file')
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
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Successful!</h3>
                <p className="text-gray-600 mb-6">Your document has been processed successfully.</p>
                <p className="text-sm text-gray-500">Redirecting to editor...</p>
                <div className="mt-4">
                  <Link href={`/documents/${documentId}`}>
                    <Button>
                      Go to Editor Now
                    </Button>
                  </Link>
                </div>
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
                      <div>
                        <p className="text-lg font-medium text-gray-900 mb-1">{fileName}</p>
                        <p className="text-sm text-gray-600">Ready to upload</p>
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
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="mt-8 flex justify-center">
                  <Button
                    type="submit"
                    disabled={isUploading || !fileName}
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
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