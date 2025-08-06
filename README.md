# Legal Document Editor

A Next.js application for editing legal documents with line-by-line precision. Upload PDF files and edit them while maintaining line number references.

## Features

- **PDF Upload**: Drag-and-drop or browse to upload PDF files (up to 10MB)
- **Line-by-Line Editing**: Click any line to edit it individually
- **Smart Text Selection**: Copy text without line numbers interfering
- **Search Functionality**: Find text across all lines with real-time filtering
- **Change Tracking**: Edited lines are highlighted and marked
- **Auto-save**: Changes are saved automatically as you edit
- **Export**: Download edited documents as text files
- **Keyboard Shortcuts**:
  - `Cmd/Ctrl + F`: Focus search
  - `Cmd/Ctrl + S`: Export document
  - `Click`: Edit a line
  - `Enter`: Save current line
  - `Esc`: Cancel editing

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Prisma** with SQLite for data persistence
- **Tailwind CSS** for styling
- **pdf-parse-fork** for PDF text extraction

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd legal-editor
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up the database:
```bash
npx prisma db push
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload a PDF**: Click "Upload New Document" from the home page
2. **View Documents**: Browse uploaded documents from the documents list
3. **Edit a Document**: Click on any document to open the editor
4. **Edit Lines**: Click on any line to edit it. Press Enter to save or Esc to cancel
5. **Search**: Use the search bar or press Cmd/Ctrl+F to find specific text
6. **Export**: Click Export or press Cmd/Ctrl+S to download the edited document

## Project Structure

```
legal-editor/
├── app/                      # Next.js app directory
│   ├── actions/             # Server actions
│   │   ├── document.ts      # Document CRUD operations
│   │   └── pdf-processor.ts # PDF text extraction
│   ├── documents/           # Document list and editor pages
│   └── upload/              # Upload page
├── components/              # React components
│   ├── ui/                  # UI components
│   ├── LegalTextEditor.tsx  # Main editor component
│   └── KeyboardShortcuts.tsx # Keyboard shortcut handler
├── lib/                     # Utility functions
├── prisma/                  # Database schema
└── public/                  # Static assets
```

## Database Schema

The application uses SQLite with Prisma ORM:

- **Document**: Stores PDF metadata and original file
- **Line**: Individual lines with text, line numbers, and edit status

## Development

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
```

### Running in Production
```bash
pnpm start
```

## License

MIT