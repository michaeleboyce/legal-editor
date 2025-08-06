'use server'

import { db, documents, lines } from '@/lib/db'
import { eq, desc, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { processPDF } from './pdf-processor'

export async function uploadDocument(formData: FormData) {
  try {
    console.log('[uploadDocument] Starting upload process')
    console.log('[uploadDocument] FormData entries:')
    for (const [key, value] of formData.entries()) {
      console.log(`[uploadDocument] ${key}:`, value)
    }
    
    const file = formData.get('file') as File
    
    if (!file) {
      console.error('[uploadDocument] No file provided')
      console.error('[uploadDocument] FormData keys:', Array.from(formData.keys()))
      return { error: 'No file provided. Please select a PDF file to upload.' }
    }
    
    if (file.type !== 'application/pdf') {
      console.error(`[uploadDocument] Invalid file type: ${file.type}`)
      return { error: `Invalid file type: ${file.type}. Please upload a PDF file.` }
    }

    console.log(`[uploadDocument] Processing file: ${file.name} (${file.size} bytes)`)
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name

    // Process PDF to extract lines
    console.log('[uploadDocument] Starting PDF processing...')
    const processedLines = await processPDF(buffer)
    console.log(`[uploadDocument] Extracted ${processedLines.length} lines from PDF`)

    // Create document
    console.log('[uploadDocument] Creating document in database...')
    const result = await db.insert(documents).values({
      name: fileName,
      originalPdf: buffer.toString('base64'), // Convert to base64 for PostgreSQL text storage
    }).returning()

    const document = result[0]
    console.log(`[uploadDocument] Document created with ID: ${document.id}`)

    // Create lines
    const linesToInsert = processedLines.map(line => ({
      documentId: document.id,
      lineNumber: line.lineNumber,
      text: line.text,
      pageNumber: line.pageNumber,
    }))

    console.log(`[uploadDocument] Inserting ${linesToInsert.length} lines into database...`)
    
    // Batch insert lines to avoid stack overflow with large documents
    const BATCH_SIZE = 500
    for (let i = 0; i < linesToInsert.length; i += BATCH_SIZE) {
      const batch = linesToInsert.slice(i, i + BATCH_SIZE)
      await db.insert(lines).values(batch)
      console.log(`[uploadDocument] Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(linesToInsert.length / BATCH_SIZE)}`)
    }
    
    console.log('[uploadDocument] All lines inserted successfully')

    revalidatePath('/documents')
    return { success: true, documentId: document.id }
  } catch (error) {
    console.error('[uploadDocument] Error uploading document:', error)
    console.error('[uploadDocument] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    if (error instanceof Error) {
      return { error: `Failed to upload document: ${error.message}` }
    }
    return { error: 'Failed to upload document: Unknown error occurred' }
  }
}

export async function deleteDocument(documentId: string) {
  try {
    console.log(`[deleteDocument] Deleting document with ID: ${documentId}`)
    
    // Delete associated lines first (cascade should handle this, but being explicit)
    await db.delete(lines).where(eq(lines.documentId, documentId))
    
    // Delete the document
    await db.delete(documents).where(eq(documents.id, documentId))
    
    console.log(`[deleteDocument] Document ${documentId} deleted successfully`)
    revalidatePath('/documents')
    revalidatePath('/upload')
    
    return { success: true }
  } catch (error) {
    console.error('[deleteDocument] Error deleting document:', error)
    return { error: 'Failed to delete document' }
  }
}

export async function getDocuments() {
  console.log('[getDocuments] Starting - Version 1.0.1 with originalPdf excluded')
  
  try {
    // First get all documents - explicitly exclude originalPdf to avoid large data transfers
    const docs = await db.select({
      id: documents.id,
      name: documents.name,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
    }).from(documents).orderBy(desc(documents.createdAt))
    
    console.log(`[getDocuments] Found ${docs.length} documents`)
    
    // Then get line counts in a single query using GROUP BY
    const lineCounts = await db.select({
      documentId: lines.documentId,
      count: sql<number>`count(*)`
    })
    .from(lines)
    .groupBy(lines.documentId)
    
    // Create a map for quick lookup
    const countMap = new Map(lineCounts.map(item => [item.documentId, item.count]))

    // Convert timestamps to ISO strings for serialization and add counts
    return docs.map(doc => ({
      id: doc.id,
      name: doc.name,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      _count: {
        lines: countMap.get(doc.id) || 0
      }
    }))
  } catch (error) {
    console.error('[getDocuments] Error fetching documents:', error)
    throw error
  }
}

export async function getDocument(id: string) {
  const [document] = await db.select({
    id: documents.id,
    name: documents.name,
    createdAt: documents.createdAt,
    updatedAt: documents.updatedAt,
  }).from(documents).where(eq(documents.id, id))
  
  if (!document) return null

  const documentLines = await db.select().from(lines)
    .where(eq(lines.documentId, id))
    .orderBy(lines.lineNumber)

  // Convert to match the expected format
  return {
    id: document.id,
    name: document.name,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
    lines: documentLines.map(line => ({
      ...line,
      createdAt: line.createdAt.toISOString(),
      updatedAt: line.updatedAt.toISOString(),
    }))
  }
}


export async function updateLine(lineId: string, editedText: string) {
  try {
    const [line] = await db.select().from(lines).where(eq(lines.id, lineId))
    
    if (!line) {
      return { error: 'Line not found' }
    }

    // Update the line
    await db.update(lines)
      .set({
        isEdited: true,
        editedText: editedText,
        updatedAt: new Date()
      })
      .where(eq(lines.id, lineId))

    // Update document's updatedAt timestamp
    await db.update(documents)
      .set({
        updatedAt: new Date()
      })
      .where(eq(documents.id, line.documentId))

    revalidatePath('/documents/[id]', 'page')
    return { success: true }
  } catch (error) {
    console.error('Error updating line:', error)
    return { error: 'Failed to update line' }
  }
}

