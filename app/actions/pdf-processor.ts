// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse-fork')

interface ProcessedLine {
  lineNumber: number
  text: string
  pageNumber: number
}

export async function processPDF(buffer: Buffer): Promise<ProcessedLine[]> {
  try {
    console.log('[processPDF] Starting PDF processing...')
    console.log(`[processPDF] Buffer size: ${buffer.length} bytes`)
    
    const data = await pdfParse(buffer)
    console.log(`[processPDF] PDF parsed successfully`)
    console.log(`[processPDF] Total pages: ${data.numpages}`)
    console.log(`[processPDF] Text length: ${data.text.length} characters`)
    
    // Split the text into pages (PDF pages are typically separated by form feed)
    const pages = data.text.split('\f').filter((page: string) => page.trim().length > 0)
    console.log(`[processPDF] Found ${pages.length} non-empty pages`)
    
    const lines: ProcessedLine[] = []
    let globalLineNumber = 1

    // Process each page
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const pageText = pages[pageIndex]
      const pageLines = pageText.split('\n')
      console.log(`[processPDF] Page ${pageIndex + 1}: ${pageLines.length} lines`)

      // Process each line in the page
      for (const line of pageLines) {
        const trimmedLine = line.trim()
        
        // Skip empty lines and common headers/footers
        if (trimmedLine && !isHeaderOrFooter(trimmedLine)) {
          lines.push({
            lineNumber: globalLineNumber++,
            text: trimmedLine,
            pageNumber: pageIndex + 1
          })
        }
      }
    }

    console.log(`[processPDF] Extracted ${lines.length} lines before merging`)

    // Post-process to merge wrapped lines intelligently
    const mergedLines = mergeWrappedLines(lines)
    console.log(`[processPDF] ${mergedLines.length} lines after merging`)
    
    // Renumber after merging
    const finalLines = mergedLines.map((line, index) => ({
      ...line,
      lineNumber: index + 1
    }))
    
    console.log(`[processPDF] Processing complete. Final line count: ${finalLines.length}`)
    return finalLines
  } catch (error) {
    console.error('[processPDF] Error processing PDF:', error)
    console.error('[processPDF] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    if (error instanceof Error) {
      throw new Error(`Failed to process PDF: ${error.message}`)
    }
    throw new Error('Failed to process PDF: Unknown error')
  }
}

function isHeaderOrFooter(text: string): boolean {
  return (
    text.includes('VerDate Sep') ||
    text.includes('Frm ') ||
    text.includes('Fmt ') ||
    text.includes('Sfmt ') ||
    text.includes('PO 00000') ||
    text.includes('Jkt ') ||
    text.includes('E:\\PUBLAW\\') ||
    text.includes('jmbennett on') ||
    text.match(/^\d+\s+STAT\.\s+\d+/) !== null || // Page headers like "137 STAT. 136"
    text.length < 3 // Very short lines
  )
}

function mergeWrappedLines(lines: ProcessedLine[]): ProcessedLine[] {
  const merged: ProcessedLine[] = []
  let i = 0

  while (i < lines.length) {
    const currentLine = lines[i]
    
    // Check if this line might be a continuation
    if (i < lines.length - 1) {
      const nextLine = lines[i + 1]
      
      // Only merge if on the same page
      if (currentLine.pageNumber === nextLine.pageNumber && shouldMergeLines(currentLine.text, nextLine.text)) {
        // Handle word breaks with hyphens
        let mergedText = currentLine.text
        if (currentLine.text.endsWith('-')) {
          // Remove hyphen and join directly
          mergedText = currentLine.text.slice(0, -1) + nextLine.text
        } else {
          // Add space between words
          mergedText = currentLine.text + ' ' + nextLine.text
        }
        
        merged.push({
          ...currentLine,
          text: mergedText
        })
        i += 2 // Skip the next line as it's been merged
        continue
      }
    }
    
    merged.push(currentLine)
    i++
  }

  return merged
}

function shouldMergeLines(current: string, next: string): boolean {
  // Don't merge if current line ends with punctuation that typically ends a sentence
  if (current.match(/[.!?;:]$/)) {
    return false
  }

  // Don't merge if next line starts with a section number or bullet
  if (next.match(/^(SEC\.|Sec\.|SECTION|TITLE|\d+\.|[A-Z]\.|[IVX]+\.|•|–|-|\(\d+\)|[a-z]\))/)) {
    return false
  }

  // Don't merge if next line is all caps (likely a title)
  if (next === next.toUpperCase() && next.length > 5 && !next.match(/^[0-9]/)) {
    return false
  }

  // Don't merge if current line looks like a complete section reference
  if (current.match(/\.$/) && current.match(/(Sec\.|SEC\.|Section)/i)) {
    return false
  }

  // Merge if current line ends with a hyphen (word continuation)
  if (current.endsWith('-')) {
    return true
  }

  // Merge if current line doesn't end with punctuation and next line starts lowercase
  if (!current.match(/[.,:;!?]$/) && next.match(/^[a-z]/)) {
    return true
  }

  // Merge if the current line ends with certain words that typically continue
  if (current.match(/\b(of|the|and|or|in|to|for|with|a|an)$/i)) {
    return true
  }

  return false
}