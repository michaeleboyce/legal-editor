'use client'

import { useState, useEffect, useRef } from 'react'
import { updateLine } from '@/app/actions/document'
import { Button } from '@/components/ui/button'
import { Search, Download, Info, Edit2, Check, X, Filter, Undo, ChevronRight } from 'lucide-react'
import KeyboardShortcuts, { ShortcutHelp } from '@/components/KeyboardShortcuts'
import * as Diff from 'diff'

interface SerializedDocument {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  lines: Array<{
    id: string
    documentId: string
    lineNumber: number
    text: string
    pageNumber: number
    isEdited: boolean
    editedText: string | null
  }>
}

interface LegalTextEditorProps {
  document: SerializedDocument
}

type ViewMode = 'normal' | 'redline' | 'original'

export default function LegalTextEditor({ document }: LegalTextEditorProps) {
  const [lines, setLines] = useState(document.lines)
  const [editingLineId, setEditingLineId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 200 }) // Increased from 50
  const [showEditedOnly, setShowEditedOnly] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('normal')
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set())
  const searchInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Filter lines based on edited-only mode
  const filteredByEdit = showEditedOnly 
    ? lines.filter(line => line.isEdited && line.editedText !== line.text)
    : lines

  // Filtered lines based on search
  const filteredLines = searchTerm
    ? filteredByEdit.filter(line => {
        const text = line.isEdited && line.editedText ? line.editedText : line.text
        return text.toLowerCase().includes(searchTerm.toLowerCase())
      })
    : filteredByEdit

  // Visible lines for lazy loading
  const visibleLines = filteredLines.slice(visibleRange.start, visibleRange.end)

  // Set up intersection observer for lazy loading
  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id === 'load-more') {
          setVisibleRange(prev => ({
            ...prev,
            end: Math.min(prev.end + 200, filteredLines.length) // Increased from 50
          }))
        }
      })
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '100px',
      threshold: 0
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [filteredLines.length])

  const handleLineEdit = (lineId: string, newText: string) => {
    const line = lines.find(l => l.id === lineId)
    if (!line) return

    // Only mark as edited if the text actually changed
    const isActuallyEdited = newText !== line.text
    
    setLines(lines.map(l => 
      l.id === lineId 
        ? { ...l, editedText: isActuallyEdited ? newText : null, isEdited: isActuallyEdited }
        : l
    ))
    setHasChanges(true)
  }

  const handleLineBlur = async (lineId: string, newText: string) => {
    const line = lines.find(l => l.id === lineId)
    if (line) {
      // Only save if text actually changed from original
      if (newText !== line.text) {
        await updateLine(lineId, newText)
      } else {
        // If text is same as original, clear the edit
        setLines(lines.map(l => 
          l.id === lineId 
            ? { ...l, editedText: null, isEdited: false }
            : l
        ))
        await updateLine(lineId, line.text)
      }
    }
    setEditingLineId(null)
  }

  const revertLine = async (lineId: string) => {
    const line = lines.find(l => l.id === lineId)
    if (line) {
      setLines(lines.map(l => 
        l.id === lineId 
          ? { ...l, editedText: null, isEdited: false }
          : l
      ))
      await updateLine(lineId, line.text)
      setHasChanges(true)
    }
  }

  const toggleSection = (lineNumber: number) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(lineNumber)) {
        newSet.delete(lineNumber)
      } else {
        newSet.add(lineNumber)
        // Find the end of this section (next edited line or end of document)
        const currentIndex = lines.findIndex(l => l.lineNumber === lineNumber)
        if (currentIndex !== -1) {
          for (let i = currentIndex + 1; i < lines.length; i++) {
            if ((lines[i].isEdited && lines[i].editedText !== lines[i].text) || i === lines.length - 1) {
              // Collapse all lines between current and next edited (or end)
              for (let j = lineNumber + 1; j < lines[i].lineNumber; j++) {
                newSet.add(j)
              }
              break
            }
          }
        }
      }
      return newSet
    })
  }

  const exportAsText = () => {
    const text = lines
      .map(line => {
        const content = viewMode === 'original' 
          ? line.text
          : (line.isEdited && line.editedText ? line.editedText : line.text)
        return `${line.lineNumber}. ${content}`
      })
      .join('\n')
    
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `${document.name.replace('.pdf', '')}_${viewMode}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderDiffContent = (original: string, edited: string) => {
    const diff = Diff.diffWords(original, edited)
    
    return (
      <div className="space-y-1">
        <div className="flex flex-wrap items-baseline">
          {diff.map((part, index) => {
            if (part.removed) {
              return (
                <span key={`removed-${index}`} className="bg-red-100 text-red-700 line-through mx-0.5">
                  {part.value}
                </span>
              )
            } else if (part.added) {
              return (
                <span key={`added-${index}`} className="bg-green-100 text-green-700 mx-0.5">
                  {part.value}
                </span>
              )
            } else {
              return <span key={`unchanged-${index}`}>{part.value}</span>
            }
          })}
        </div>
      </div>
    )
  }

  const renderLineContent = (line: typeof lines[0]) => {
    if (viewMode === 'original') {
      return line.text
    } else if (viewMode === 'redline' && line.isEdited && line.editedText && line.editedText !== line.text) {
      // Show granular diff
      return renderDiffContent(line.text, line.editedText)
    } else {
      return line.isEdited && line.editedText ? line.editedText : line.text
    }
  }

  // Check if a line should be visible based on collapsed sections
  const isLineVisible = (lineNumber: number) => {
    if (showEditedOnly) return true // Don't collapse when filtering
    return !collapsedSections.has(lineNumber)
  }

  // Get visible lines considering collapsed sections
  const displayLines = visibleLines.filter(line => isLineVisible(line.lineNumber))

  // Check if line has real changes
  const hasRealChanges = (line: typeof lines[0]) => {
    return line.isEdited && line.editedText !== null && line.editedText !== line.text
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <KeyboardShortcuts
        onSearch={() => searchInputRef.current?.focus()}
        onExport={exportAsText}
        onEscape={() => setEditingLineId(null)}
      />
      
      {/* Enhanced Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={`Search ${showEditedOnly ? 'edited lines' : 'document'}...`}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setVisibleRange({ start: 0, end: 200 })
                }}
              />
            </div>
            {searchTerm && (
              <div className="text-sm">
                <span className="font-medium text-gray-900">{filteredLines.length}</span>
                <span className="text-gray-600"> results found</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Selector */}
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">Normal View</option>
              <option value="redline">Show Changes</option>
              <option value="original">Original Only</option>
            </select>

            {/* Filter Toggle */}
            <Button
              onClick={() => {
                setShowEditedOnly(!showEditedOnly)
                setVisibleRange({ start: 0, end: 200 })
              }}
              variant={showEditedOnly ? "default" : "outline"}
              className="bg-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              Edited Only
            </Button>

            {hasChanges && (
              <div className="flex items-center text-sm text-green-600">
                <Check className="h-4 w-4 mr-1" />
                <span>Saved</span>
              </div>
            )}
            
            <Button onClick={exportAsText} variant="outline" className="bg-white">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button 
              onClick={() => setShowHelp(!showHelp)} 
              variant="ghost"
              size="icon"
              title="Keyboard shortcuts"
              className="text-gray-600"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Help Panel */}
        {showHelp && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <ShortcutHelp />
          </div>
        )}
      </div>

      {/* Document Stats */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <span className="text-gray-600">
              Total Lines: <span className="font-medium text-gray-900">{lines.length}</span>
            </span>
            <span className="text-gray-600">
              Edited: <span className="font-medium text-gray-900">
                {lines.filter(l => hasRealChanges(l)).length}
              </span>
            </span>
            {showEditedOnly && (
              <span className="text-blue-600 font-medium">
                Showing edited lines only
              </span>
            )}
          </div>
          {displayLines.length < filteredLines.length && (
            <span className="text-gray-500">
              Showing {displayLines.length} of {filteredLines.length} lines
            </span>
          )}
        </div>
      </div>

      {/* Enhanced Editor */}
      <div ref={containerRef} className="max-h-[calc(100vh-300px)] overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {displayLines.map((line, index) => {
            const isCollapsible = showEditedOnly ? false : (
              index === 0 || 
              displayLines[index - 1]?.lineNumber !== line.lineNumber - 1
            )
            const hasChanges = hasRealChanges(line)
            
            return (
              <div
                key={line.id}
                className={`flex group transition-colors duration-150 ${
                  editingLineId === line.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                {/* Line Number */}
                <div 
                  className={`flex-shrink-0 w-20 px-4 py-3 text-right font-mono text-sm text-gray-400 select-none border-r border-gray-100 ${
                    isCollapsible && !showEditedOnly ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ userSelect: 'none' }}
                  onClick={() => isCollapsible && !showEditedOnly && toggleSection(line.lineNumber)}
                >
                  <div className="flex items-center justify-end space-x-1">
                    {isCollapsible && !showEditedOnly && (
                      <ChevronRight className="h-3 w-3" />
                    )}
                    <span>{line.lineNumber}</span>
                  </div>
                </div>
                
                {/* Legal Text */}
                <div className="flex-1 px-6 py-3">
                  {editingLineId === line.id && viewMode === 'normal' ? (
                    <div className="flex items-start space-x-2">
                      <textarea
                        className="flex-1 p-2 border border-blue-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        value={line.isEdited && line.editedText ? line.editedText : line.text}
                        onChange={(e) => handleLineEdit(line.id, e.target.value)}
                        onBlur={(e) => handleLineBlur(line.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            e.currentTarget.blur()
                          }
                          if (e.key === 'Escape') {
                            setEditingLineId(null)
                          }
                        }}
                        autoFocus
                        rows={Math.ceil((line.isEdited && line.editedText ? line.editedText : line.text).length / 80) || 1}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingLineId(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className={`font-mono text-sm py-2 pr-12 relative ${
                        viewMode === 'normal' ? 'cursor-text' : ''
                      } ${
                        viewMode === 'normal' && hasChanges ? 'text-blue-900' : 'text-gray-800'
                      }`}
                      onClick={() => viewMode === 'normal' && setEditingLineId(line.id)}
                    >
                      {renderLineContent(line)}
                      {viewMode === 'normal' && hasChanges && (
                        <div className="absolute right-2 top-2 flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              revertLine(line.id)
                            }}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            title="Revert to original"
                          >
                            <Undo className="h-3 w-3" />
                          </button>
                          <span className="px-2 py-1 text-xs font-sans bg-blue-100 text-blue-700 rounded">
                            edited
                          </span>
                        </div>
                      )}
                      {viewMode === 'normal' && !hasChanges && (
                        <button
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingLineId(line.id)
                          }}
                        >
                          <Edit2 className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          
          {/* Load More Trigger */}
          {displayLines.length < filteredLines.length && (
            <div
              id="load-more"
              ref={(el) => {
                if (el && observerRef.current) {
                  observerRef.current.observe(el)
                }
              }}
              className="py-8 text-center text-gray-500"
            >
              Loading more lines...
            </div>
          )}
        </div>
      </div>

      {/* CSS for better typography */}
      <style jsx>{`
        .line-numbers {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* Ensure monospace font maintains alignment */
        .font-mono {
          font-variant-ligatures: none;
          letter-spacing: -0.02em;
        }
        
        .line-through {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  )
}