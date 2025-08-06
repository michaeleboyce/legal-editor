'use client'

import { useState, useEffect } from 'react'
import { getDocuments, deleteDocument } from '@/app/actions/document'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, Plus, ArrowLeft, Clock, FileCheck, Scale, Trash2, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type DocumentWithCount = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  _count: {
    lines: number
  }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    setLoading(true)
    const docs = await getDocuments()
    setDocuments(docs)
    setLoading(false)
  }

  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return
    }

    setDeletingId(docId)
    const result = await deleteDocument(docId)
    
    if (result.success) {
      // Remove from local state for immediate UI update
      setDocuments(docs => docs.filter(d => d.id !== docId))
    } else {
      alert('Failed to delete document')
    }
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    )
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
                <h1 className="text-xl font-semibold text-gray-900">Document Library</h1>
              </div>
            </div>
            
            <Link href="/upload">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Plus className="mr-2 h-4 w-4" />
                Upload New
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {documents.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Documents Yet</h3>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                Get started by uploading your first legal document to begin editing.
              </p>
              <Link href="/upload">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Your First Document
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Stats Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-light text-gray-900">{documents.length}</p>
                  <p className="text-sm text-gray-600">Total Documents</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-light text-gray-900">
                    {documents.reduce((sum: number, doc: DocumentWithCount) => sum + doc._count.lines, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Lines</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-light text-gray-900">
                    {documents.filter((doc: DocumentWithCount) => doc.updatedAt !== doc.createdAt).length}
                  </p>
                  <p className="text-sm text-gray-600">Edited Documents</p>
                </div>
              </div>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc: DocumentWithCount) => (
                <div key={doc.id} className="group relative">
                  <Link href={`/documents/${doc.id}`}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        {doc.updatedAt !== doc.createdAt && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Edited
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 truncate pr-8" title={doc.name}>
                        {doc.name}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FileCheck className="mr-2 h-4 w-4 text-gray-400" />
                          {doc._count.lines} lines
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-gray-400" />
                          {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                          Open Editor →
                        </span>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, doc.id)}
                    disabled={deletingId === doc.id}
                    className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                    title="Delete document"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-500" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}