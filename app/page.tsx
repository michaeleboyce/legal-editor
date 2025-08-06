import Link from 'next/link'
import { FileText, Upload, Scale } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Scale className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Legal Document Editor</h1>
                <p className="text-sm text-gray-600">Professional Legal Document Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Edit Legal Documents with Precision
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload PDF documents and edit them line-by-line while maintaining accurate line number references for legal citations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Upload Card */}
          <Link href="/upload" className="group">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-blue-300 transition-all duration-200 h-full">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload New Document</h3>
                <p className="text-gray-600">
                  Import PDF files up to 10MB. Supports legal documents, contracts, and legislation.
                </p>
              </div>
            </div>
          </Link>

          {/* Documents Card */}
          <Link href="/documents" className="group">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-blue-300 transition-all duration-200 h-full">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">View Documents</h3>
                <p className="text-gray-600">
                  Access and manage your uploaded documents. Edit, search, and export with ease.
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h3 className="text-center text-xl font-semibold text-gray-900 mb-8">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-3xl mb-2">📝</div>
              <h4 className="font-medium text-gray-900 mb-1">Line-by-Line Editing</h4>
              <p className="text-sm text-gray-600">Edit specific lines while preserving formatting</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔍</div>
              <h4 className="font-medium text-gray-900 mb-1">Smart Search</h4>
              <p className="text-sm text-gray-600">Find text instantly across all lines</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💾</div>
              <h4 className="font-medium text-gray-900 mb-1">Auto-Save</h4>
              <p className="text-sm text-gray-600">Changes are saved automatically</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}