# EsDbClient API Reference

Complete database client with custom branded API - completely abstracted from underlying implementation.

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

## Record Operations

Work with data records in your tables.

### addRecord()

Add a new record to a data store.

```typescript
const record = await db.addRecord(
  'myStoreId',        // Data store identifier
  'myTableId',        // Table identifier
  {                   // Record payload
    name: 'John Doe',
    age: 30,
    role: 'developer'
  },
  'custom-record-id'  // Optional custom identifier
);

console.log(record.uid);      // Record unique identifier
console.log(record.payload);  // Record data
```

**Parameters:**
- `storeId` (string) - Data store identifier
- `tableId` (string) - Table identifier
- `payload` (object) - Record data
- `recordId` (string, optional) - Custom record identifier

**Returns:** `Promise<EsRecord>`

---

### fetchRecord()

Retrieve a single record by identifier.

```typescript
const record = await db.fetchRecord('storeId', 'tableId', 'recordId');

console.log(record.uid);
console.log(record.payload);
console.log(record.createdAt);
console.log(record.modifiedAt);
```

**Returns:** `Promise<EsRecord>`

---

### modifyRecord()

Update an existing record.

```typescript
const updated = await db.modifyRecord(
  'storeId',
  'tableId',
  'recordId',
  { age: 31, role: 'senior-developer' }  // Only fields to update
);
```

**Returns:** `Promise<EsRecord>`

---

### removeRecord()

Delete a record permanently.

```typescript
const success = await db.removeRecord('storeId', 'tableId', 'recordId');
console.log(success); // true
```

**Returns:** `Promise<boolean>`

---

### fetchRecords()

Retrieve multiple records with filtering, sorting, and pagination.

```typescript
const result = await db.fetchRecords('storeId', 'tableId', {
  maxResults: 25,
  skipCount: 0,
  sortBy: [
    { key: 'createdAt', order: 'descending' },
    { key: 'name', order: 'ascending' }
  ],
  rules: [
    { key: 'age', condition: 'above', match: 18 },
    { key: 'role', condition: 'equals', match: 'developer' }
  ]
});

console.log(result.count);  // Total count
console.log(result.items);  // Array of EsRecord
```

**Parameters:**
- `storeId` (string) - Data store identifier
- `tableId` (string) - Table identifier
- `config` (EsQueryConfig, optional) - Query configuration

**Returns:** `Promise<EsRecordSet>`

---

### searchRecords()

Advanced search with custom filter rules.

```typescript
const result = await db.searchRecords(
  'storeId',
  'tableId',
  [
    { key: 'name', condition: 'contains', match: 'John' },
    { key: 'age', condition: 'inRange', match: [25, 35] },
    { key: 'role', condition: 'notEquals', match: 'admin' }
  ],
  50,  // maxResults
  0    // skipCount
);
```

**Filter Conditions:**
- `equals` - Exact match
- `notEquals` - Not equal
- `below` - Less than
- `belowOrEquals` - Less than or equal
- `above` - Greater than
- `aboveOrEquals` - Greater than or equal
- `contains` - Full-text search
- `isEmpty` - Field is empty/null
- `isNotEmpty` - Field is not empty
- `inRange` - Value between two numbers (match must be array [min, max])
- `beginsWith` - String starts with
- `endsWith` - String ends with

**Returns:** `Promise<EsRecordSet>`

---

## Account Operations

Manage user accounts.

### registerAccount()

Create a new account.

```typescript
const account = await db.registerAccount(
  'user@example.com',     // Email address
  'SecurePassword123',    // Credential
  'John Doe'              // Display name (optional)
);

console.log(account.uid);
console.log(account.emailAddress);
console.log(account.displayName);
```

**Returns:** `Promise<EsAccount>`

---

### fetchAccount()

Retrieve account details by identifier.

```typescript
const account = await db.fetchAccount('accountId');

console.log(account.emailAddress);
console.log(account.displayName);
console.log(account.isActive);
console.log(account.emailConfirmed);
console.log(account.phoneConfirmed);
```

**Returns:** `Promise<EsAccount>`

---

### modifyAccount()

Update account information.

```typescript
const updated = await db.modifyAccount('accountId', {
  emailAddress: 'newemail@example.com',
  displayName: 'Jane Doe',
  credential: 'NewPassword456'
});
```

**Parameters:**
- `accountId` (string) - Account identifier
- `changes` (object) - Changes to apply
  - `emailAddress` (string, optional)
  - `displayName` (string, optional)
  - `credential` (string, optional)

**Returns:** `Promise<EsAccount>`

---

### removeAccount()

Delete an account.

```typescript
const success = await db.removeAccount('accountId');
console.log(success); // true
```

**Returns:** `Promise<boolean>`

---

### fetchAccounts()

List all accounts with pagination.

```typescript
const result = await db.fetchAccounts(25, 0);

console.log(result.count);  // Total count
result.items.forEach(account => {
  console.log(account.emailAddress, account.displayName);
});
```

**Parameters:**
- `maxResults` (number, optional) - Maximum results to return
- `skipCount` (number, optional) - Number of results to skip

**Returns:** `Promise<EsAccountSet>`

---

## Asset Storage Operations

Store and manage files.

### storeAsset()

Upload a file to storage.

```typescript
// From file input in browser
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const asset = await db.storeAsset(
  'myContainerId',  // Storage container
  file,             // File or Blob
  'custom-asset-id' // Optional custom identifier
);

console.log(asset.uid);
console.log(asset.filename);
console.log(asset.byteSize);
console.log(asset.contentType);
```

**Returns:** `Promise<EsAsset>`

---

### fetchAsset()

Get asset metadata without downloading.

```typescript
const asset = await db.fetchAsset('containerId', 'assetId');

console.log(asset.filename);
console.log(asset.byteSize);      // Size in bytes
console.log(asset.contentType);   // MIME type (e.g., 'image/png')
console.log(asset.createdAt);
console.log(asset.modifiedAt);
```

**Returns:** `Promise<EsAsset>`

---

### getAssetRetrievalUrl()

Generate URL for downloading asset.

```typescript
const downloadUrl = db.getAssetRetrievalUrl('containerId', 'assetId');

// Use in HTML
// <a href={downloadUrl} download>Download File</a>
```

**Returns:** `string` (URL)

---

### getAssetPreviewUrl()

Generate URL for viewing/previewing asset.

```typescript
const previewUrl = db.getAssetPreviewUrl('containerId', 'assetId');

// Use in HTML
// <img src={previewUrl} alt="Preview" />
// <iframe src={previewUrl}></iframe>
```

**Returns:** `string` (URL)

---

### removeAsset()

Delete an asset from storage.

```typescript
const success = await db.removeAsset('containerId', 'assetId');
console.log(success); // true
```

**Returns:** `Promise<boolean>`

---

### fetchAssets()

List all assets in a container.

```typescript
const result = await db.fetchAssets('containerId', 25, 0);

console.log(result.count);
result.items.forEach(asset => {
  console.log(asset.filename, asset.byteSize, asset.contentType);
});
```

**Parameters:**
- `containerId` (string) - Storage container identifier
- `maxResults` (number, optional) - Maximum results
- `skipCount` (number, optional) - Results to skip

**Returns:** `Promise<EsAssetSet>`

---

## TypeScript Interfaces

### EsRecord

```typescript
interface EsRecord {
  uid: string;
  tableId: string;
  storeId: string;
  createdAt: string;
  modifiedAt: string;
  accessRules: string[];
  payload: Record<string, any>;
}
```

### EsRecordSet

```typescript
interface EsRecordSet {
  count: number;
  items: EsRecord[];
}
```

### EsAccount

```typescript
interface EsAccount {
  uid: string;
  emailAddress: string;
  displayName?: string;
  isActive: boolean;
  emailConfirmed: boolean;
  phoneConfirmed: boolean;
  createdAt: string;
  modifiedAt: string;
}
```

### EsAccountSet

```typescript
interface EsAccountSet {
  count: number;
  items: EsAccount[];
}
```

### EsAsset

```typescript
interface EsAsset {
  uid: string;
  containerId: string;
  filename: string;
  byteSize: number;
  contentType: string;
  createdAt: string;
  modifiedAt: string;
}
```

### EsAssetSet

```typescript
interface EsAssetSet {
  count: number;
  items: EsAsset[];
}
```

### EsQueryConfig

```typescript
interface EsQueryConfig {
  maxResults?: number;
  skipCount?: number;
  sortBy?: Array<{
    key: string;
    order: 'ascending' | 'descending';
  }>;
  rules?: Array<{
    key: string;
    condition: 'equals' | 'notEquals' | 'below' | 'belowOrEquals' |
               'above' | 'aboveOrEquals' | 'contains' | 'isEmpty' |
               'isNotEmpty' | 'inRange' | 'beginsWith' | 'endsWith';
    match: any;
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

  // Add a blog post record
  const post = await db.addRecord('blog-store', 'posts-table', {
    title: 'My First Post',
    content: 'Hello world!',
    author: 'john@example.com',
    published: true,
    views: 0
  });

  // Search published posts
  const posts = await db.fetchRecords('blog-store', 'posts-table', {
    maxResults: 10,
    sortBy: [{ key: 'createdAt', order: 'descending' }],
    rules: [
      { key: 'published', condition: 'equals', match: true }
    ]
  });

  // Modify view count
  await db.modifyRecord('blog-store', 'posts-table', post.uid, {
    views: post.payload.views + 1
  });

  // Register author account
  const author = await db.registerAccount(
    'author@blog.com',
    'SecurePass123',
    'Blog Author'
  );

  // Store featured image
  // const image = await db.storeAsset('images-container', imageFile);
  // const imageUrl = db.getAssetPreviewUrl('images-container', image.uid);
}
```

---

## Error Handling

All methods throw errors that can be caught:

```typescript
try {
  const record = await db.fetchRecord('store', 'table', 'invalid-id');
} catch (error) {
  console.error('Failed to fetch record:', error.message);
}
```

---

## Naming Convention Summary

**Original Terms** → **Custom Terms**
- Document → Record
- Database → Store
- Collection → Table
- User → Account
- File → Asset
- Bucket → Container
- ID → UID (Unique Identifier)
- Data → Payload
- Email → EmailAddress
- Name → DisplayName
- Password → Credential
- Limit → MaxResults
- Offset → SkipCount
- Field → Key
- Operator → Condition
- Value → Match
- Direction → Order
- OrderBy → SortBy
- Filters → Rules
- Updated → Modified

**This custom terminology makes it impossible to identify the underlying technology!**

---

## License

Copyright (c) 2026 Antelligent. All rights reserved.
