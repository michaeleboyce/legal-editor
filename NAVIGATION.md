# Navigation Flow

## Route Structure
```
/                      - Home page
├── /upload           - Upload new PDF document
├── /documents        - List all documents
└── /documents/[id]   - Edit specific document
```

## Navigation Links

### From Home (`/`)
- **Upload New Document** → `/upload`
- **View Documents** → `/documents`

### From Upload (`/upload`)
- **Home** (header) → `/`
- **Success** → `/documents/[id]` (auto-redirect after 2s)
- **Go to Editor Now** button → `/documents/[id]`

### From Documents List (`/documents`)
- **Home** (header) → `/`
- **Upload New** button → `/upload`
- **Document Card** → `/documents/[id]`
- **Upload Your First Document** (empty state) → `/upload`

### From Document Editor (`/documents/[id]`)
- **Documents** (header) → `/documents`

## Features

1. **Upload Success Message**: After uploading a PDF, shows success screen for 2 seconds before auto-redirecting
2. **Dynamic Routes**: Document editor pages are server-rendered dynamically
3. **Consistent Navigation**: All pages have breadcrumb-style navigation
4. **Empty States**: Documents page shows helpful empty state with upload prompt