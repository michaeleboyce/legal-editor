import { getDocuments } from '@/app/actions/document'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, Plus, ArrowLeft, Scale } from 'lucide-react'
import DocumentsClient from './documents-client'

type DocumentWithCount = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  _count: {
    lines: number
  }
}

export default async function DocumentsPage() {
  let documents: DocumentWithCount[] = []
  let error: string | null = null

  try {
    documents = await getDocuments()
  } catch (e) {
    console.error('[DocumentsPage] Error loading documents:', e)
    error = 'Failed to load documents'
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
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

            {/* Document Grid - Using Client Component for interactivity */}
            <DocumentsClient documents={documents} />
          </div>
        )}
      </main>
    </div>
  )
}