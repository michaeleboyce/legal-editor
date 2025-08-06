import { getDocument } from '@/app/actions/document'
import { notFound } from 'next/navigation'
import LegalTextEditor from '@/components/LegalTextEditor'
import Link from 'next/link'
import { ArrowLeft, Scale, FileText, BookOpen } from 'lucide-react'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}


export default async function DocumentEditorPage({ params }: PageProps) {
  const { id } = await params
  const document = await getDocument(id)

  if (!document) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Professional Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/documents" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
                <span>Documents</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                    {document.name}
                  </h1>
                  <p className="text-sm text-gray-600">Legal Document Editor</p>
                </div>
              </div>
            </div>
            
            {/* Document Info */}
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {document.lines.length} lines
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Scale className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {document.lines.filter((l) => l.isEdited && l.editedText && l.editedText !== l.text).length} edits
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Editor Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Instructions Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  How to Edit
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Click any line to edit it. Press Enter to save or Esc to cancel. Changes are only saved if text differs from original.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Editor Component */}
          <LegalTextEditor document={document} />
        </div>
      </main>
    </div>
  )
}