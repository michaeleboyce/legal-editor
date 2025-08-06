'use client'

import { useHotkeys } from 'react-hotkeys-hook'

interface KeyboardShortcutsProps {
  onSearch: () => void
  onExport: () => void
  onEscape: () => void
}

export default function KeyboardShortcuts({ onSearch, onExport, onEscape }: KeyboardShortcutsProps) {
  // Cmd/Ctrl + F for search
  useHotkeys('cmd+f, ctrl+f', (e) => {
    e.preventDefault()
    onSearch()
  })

  // Cmd/Ctrl + S for export/save
  useHotkeys('cmd+s, ctrl+s', (e) => {
    e.preventDefault()
    onExport()
  })

  // Escape to exit edit mode
  useHotkeys('escape', () => {
    onEscape()
  })

  return null
}

export function ShortcutHelp() {
  return (
    <div className="text-xs text-gray-500 space-y-1">
      <div><kbd className="px-2 py-1 bg-gray-100 rounded">Cmd/Ctrl + F</kbd> Search</div>
      <div><kbd className="px-2 py-1 bg-gray-100 rounded">Cmd/Ctrl + S</kbd> Export</div>
      <div><kbd className="px-2 py-1 bg-gray-100 rounded">Click</kbd> Edit line</div>
      <div><kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> Save line</div>
      <div><kbd className="px-2 py-1 bg-gray-100 rounded">Esc</kbd> Cancel edit</div>
    </div>
  )
}