'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { processPDF } from './pdf-processor'

export async function uploadDocument(formData: FormData) {
  try {
    const file = formData.get('file') as File
    
    if (!file || file.type !== 'application/pdf') {
      return { error: 'Please upload a valid PDF file' }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name

    // Process PDF to extract lines
    const lines = await processPDF(buffer)

    // Create document with lines
    const document = await prisma.document.create({
      data: {
        name: fileName,
        originalPdf: buffer,
        lines: {
          create: lines
        }
      }
    })

    revalidatePath('/documents')
    return { success: true, documentId: document.id }
  } catch (error) {
    console.error('Error uploading document:', error)
    return { error: 'Failed to upload document' }
  }
}

export async function getDocuments() {
  return await prisma.document.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { lines: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getDocument(id: string) {
  const document = await prisma.document.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      lines: {
        select: {
          id: true,
          documentId: true,
          lineNumber: true,
          text: true,
          pageNumber: true,
          isEdited: true,
          editedText: true
        },
        orderBy: { lineNumber: 'asc' }
      }
    }
  })

  if (!document) return null

  // Convert dates to ISO strings to avoid serialization issues
  return {
    ...document,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString()
  }
}

export async function updateLine(lineId: string, editedText: string) {
  try {
    await prisma.line.update({
      where: { id: lineId },
      data: {
        isEdited: true,
        editedText
      }
    })

    revalidatePath('/documents/[id]', 'page')
    return { success: true }
  } catch (error) {
    console.error('Error updating line:', error)
    return { error: 'Failed to update line' }
  }
}

export async function deleteDocument(id: string) {
  try {
    await prisma.document.delete({
      where: { id }
    })
    
    revalidatePath('/documents')
    return { success: true }
  } catch (error) {
    console.error('Error deleting document:', error)
    return { error: 'Failed to delete document' }
  }
}