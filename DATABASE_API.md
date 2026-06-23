# EsDbClient - Database API Documentation

Complete database abstraction layer that provides document storage, user management, and file storage capabilities.

## Installation

```bash
npm install @antelligent-app/everyday-cli
```

## Quick Start

```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli';

const db = new EsDbClient({
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  endpoint: 'https://provider.everydayseries.ai' // Optional
});
```

---

## Document Operations

### Create Document

Create a new document in a collection.

```typescript
const doc = await db.createDocument(
  'databaseId',
  'collectionId',
  { name: 'John', age: 30, role: 'developer' },
  'custom-doc-id' // Optional, auto-generated if not provided
);

console.log(doc.id); // Document ID
console.log(doc.data); // Document data
console.log(doc.createdAt); // Timestamp
```

**Returns:** `EsDocument`

---

### Get Document

Retrieve a document by ID.

```typescript
const doc = await db.getDocument(
  'databaseId',
  'collectionId',
  'documentId'
);

console.log(doc.data); // { name: 'John', age: 30, ... }
```

**Returns:** `EsDocument`

---

### Update Document

Update an existing document.

```typescript
const updated = await db.updateDocument(
  'databaseId',
  'collectionId',
  'documentId',
  { age: 31, role: 'senior-developer' } // Only fields to update
);
```

**Returns:** `EsDocument`

---

### Delete Document

Delete a document permanently.

```typescript
const success = await db.deleteDocument(
  'databaseId',
  'collectionId',
  'documentId'
);

console.log(success); // true
```

**Returns:** `boolean`

---

### List Documents

List documents with optional filtering, sorting, and pagination.

```typescript
const result = await db.listDocuments('databaseId', 'collectionId', {
  limit: 25,
  offset: 0,
  orderBy: [
    { field: 'createdAt', direction: 'desc' },
    { field: 'name', direction: 'asc' }
  ],
  filters: [
    { field: 'age', operator: 'greaterThan', value: 18 },
    { field: 'role', operator: 'equal', value: 'developer' }
  ]
});

console.log(result.total); // Total count
console.log(result.documents); // Array of EsDocument
```

**Returns:** `EsDocumentList`

---

### Query Documents

Advanced querying with multiple filter conditions.

```typescript
const result = await db.queryDocuments(
  'databaseId',
  'collectionId',
  [
    { field: 'name', operator: 'search', value: 'John' },
    { field: 'age', operator: 'between', value: [25, 35] },
    { field: 'role', operator: 'notEqual', value: 'admin' }
  ],
  50,  // limit
  0    // offset
);
```

**Supported Operators:**
- `equal` - Exact match
- `notEqual` - Not equal
- `lessThan` - Less than
- `lessThanEqual` - Less than or equal
- `greaterThan` - Greater than
- `greaterThanEqual` - Greater than or equal
- `search` - Full-text search
- `isNull` - Field is null
- `isNotNull` - Field is not null
- `between` - Value between two numbers (requires array)
- `startsWith` - String starts with value
- `endsWith` - String ends with value

**Returns:** `EsDocumentList`

---

## User Operations

### Create User

Create a new user account.

```typescript
const user = await db.createUser(
  'user@example.com',
  'SecurePassword123',
  'John Doe' // Optional name
);

console.log(user.id);
console.log(user.email);
```

**Returns:** `EsUser`

---

### Get User

Retrieve user details by ID.

```typescript
const user = await db.getUser('userId');

console.log(user.email);
console.log(user.name);
console.log(user.status); // Active/inactive
console.log(user.emailVerification); // true/false
```

**Returns:** `EsUser`

---

### Update User

Update user information.

```typescript
const updated = await db.updateUser('userId', {
  email: 'newemail@example.com',
  name: 'Jane Doe',
  password: 'NewSecurePassword456'
});
```

**Returns:** `EsUser`

---

### Delete User

Delete a user account.

```typescript
const success = await db.deleteUser('userId');
console.log(success); // true
```

**Returns:** `boolean`

---

### List Users

List all users with pagination.

```typescript
const result = await db.listUsers(25, 0);

console.log(result.total); // Total user count
console.log(result.users); // Array of EsUser

// Iterate through users
result.users.forEach(user => {
  console.log(user.email, user.name);
});
```

**Returns:** `EsUserList`

---

## File Storage Operations

### Upload File

Upload a file to storage.

```typescript
// From file input in browser
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const uploaded = await db.uploadFile(
  'bucketId',
  file,
  'custom-file-id' // Optional
);

console.log(uploaded.id);
console.log(uploaded.name);
console.log(uploaded.size);
console.log(uploaded.mimeType);
```

**Returns:** `EsFile`

---

### Get File Metadata

Get file information without downloading.

```typescript
const file = await db.getFile('bucketId', 'fileId');

console.log(file.name);
console.log(file.size); // Bytes
console.log(file.mimeType); // 'image/png', 'application/pdf', etc.
console.log(file.createdAt);
```

**Returns:** `EsFile`

---

### Get File URLs

Generate URLs for file download or viewing.

```typescript
// Get download URL
const downloadUrl = db.getFileDownloadUrl('bucketId', 'fileId');
// Use in <a href={downloadUrl} download>Download</a>

// Get view URL (for images, PDFs, etc.)
const viewUrl = db.getFileViewUrl('bucketId', 'fileId');
// Use in <img src={viewUrl} /> or <iframe src={viewUrl} />
```

**Returns:** `string`

---

### Delete File

Delete a file from storage.

```typescript
const success = await db.deleteFile('bucketId', 'fileId');
console.log(success); // true
```

**Returns:** `boolean`

---

### List Files

List all files in a bucket.

```typescript
const result = await db.listFiles('bucketId', 25, 0);

console.log(result.total);
result.files.forEach(file => {
  console.log(file.name, file.size, file.mimeType);
});
```

**Returns:** `EsFileList`

---

## TypeScript Types

### EsDocument

```typescript
interface EsDocument {
  id: string;
  collectionId: string;
  databaseId: string;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
  data: Record<string, any>;
}
```

### EsDocumentList

```typescript
interface EsDocumentList {
  total: number;
  documents: EsDocument[];
}
```

### EsUser

```typescript
interface EsUser {
  id: string;
  email: string;
  name?: string;
  status: boolean;
  emailVerification: boolean;
  phoneVerification: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### EsUserList

```typescript
interface EsUserList {
  total: number;
  users: EsUser[];
}
```

### EsFile

```typescript
interface EsFile {
  id: string;
  bucketId: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}
```

### EsFileList

```typescript
interface EsFileList {
  total: number;
  files: EsFile[];
}
```

### EsQueryOptions

```typescript
interface EsQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
  filters?: Array<{
    field: string;
    operator: 'equal' | 'notEqual' | 'lessThan' | 'lessThanEqual' |
              'greaterThan' | 'greaterThanEqual' | 'search' | 'isNull' |
              'isNotNull' | 'between' | 'startsWith' | 'endsWith';
    value: any;
  }>;
}
```

---

## Complete Example

```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli';

async function example() {
  const db = new EsDbClient({
    projectId: 'my-project',
    apiKey: 'my-api-key'
  });

  // Create a blog post
  const post = await db.createDocument('blog-db', 'posts', {
    title: 'My First Post',
    content: 'Hello world!',
    author: 'john@example.com',
    published: true,
    views: 0
  });

  // Query published posts
  const posts = await db.listDocuments('blog-db', 'posts', {
    limit: 10,
    orderBy: [{ field: 'createdAt', direction: 'desc' }],
    filters: [
      { field: 'published', operator: 'equal', value: true }
    ]
  });

  // Update view count
  await db.updateDocument('blog-db', 'posts', post.id, {
    views: post.data.views + 1
  });

  // Create author user
  const user = await db.createUser(
    'author@blog.com',
    'SecurePass123',
    'Blog Author'
  );

  // Upload featured image
  // const image = await db.uploadFile('images', imageFile);
  // const imageUrl = db.getFileViewUrl('images', image.id);
}
```

---

## Error Handling

All methods throw errors that can be caught:

```typescript
try {
  const doc = await db.getDocument('db', 'collection', 'invalid-id');
} catch (error) {
  console.error('Failed to get document:', error.message);
}
```

---

## Security Note

This package provides a complete abstraction layer over the underlying database infrastructure. Users of this package don't need to know (and won't easily discover) the implementation details, providing an additional layer of security through obscurity when combined with:

1. Private npm registry or GitHub package
2. Restricted access to package source code
3. Compiled/minified distribution files

---

## License

Copyright (c) 2026 Antelligent. All rights reserved.

This software is proprietary and confidential.
