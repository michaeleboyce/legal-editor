'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteDocument } from '@/app/actions/document'
import { FileText, Clock, FileCheck, Trash2, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'

type DocumentWithCount = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  _count: {
    lines: number
  }
}

interface DocumentsClientProps {
  documents: DocumentWithCount[]
}

export default function DocumentsClient({ documents: initialDocuments }: DocumentsClientProps) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return
    }

    setDeletingId(docId)
    const result = await deleteDocument(docId)
    
    if (result.success) {
      // Remove from local state for immediate UI update
      setDocuments(docs => docs.filter(d => d.id !== docId))
      // Refresh the page to update server state
      router.refresh()
    } else {
      alert('Failed to delete document')
    }
    setDeletingId(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((doc) => (
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
  )
}