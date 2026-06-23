# API Naming Strategy - Complete Abstraction

This document explains how we've completely hidden the underlying technology (Appwrite) through comprehensive API renaming.

---

## Renaming Strategy

### **Principle: Zero Technology Indicators**

Every term, method name, and parameter has been renamed to use generic, custom terminology that gives no clue about the underlying implementation.

---

## Method Name Mappings

### Record Operations (Documents)

| Appwrite Method | Custom Method | Purpose |
|-----------------|---------------|---------|
| `createDocument()` | `addRecord()` | Create new record |
| `getDocument()` | `fetchRecord()` | Retrieve single record |
| `updateDocument()` | `modifyRecord()` | Update existing record |
| `deleteDocument()` | `removeRecord()` | Delete record |
| `listDocuments()` | `fetchRecords()` | List multiple records |
| N/A | `searchRecords()` | Advanced search |

### Account Operations (Users)

| Appwrite Method | Custom Method | Purpose |
|-----------------|---------------|---------|
| `create()` | `registerAccount()` | Create new account |
| `get()` | `fetchAccount()` | Get account details |
| `updateEmail()` / `updateName()` / `updatePassword()` | `modifyAccount()` | Update account |
| `delete()` | `removeAccount()` | Delete account |
| `list()` | `fetchAccounts()` | List accounts |

### Asset Operations (Files)

| Appwrite Method | Custom Method | Purpose |
|-----------------|---------------|---------|
| `createFile()` | `storeAsset()` | Upload file |
| `getFile()` | `fetchAsset()` | Get file metadata |
| `deleteFile()` | `removeAsset()` | Delete file |
| `listFiles()` | `fetchAssets()` | List files |
| N/A | `getAssetRetrievalUrl()` | Get download URL |
| N/A | `getAssetPreviewUrl()` | Get preview URL |

---

## Parameter Name Mappings

### Identifier Parameters

| Appwrite Term | Custom Term | Used In |
|---------------|-------------|---------|
| `databaseId` | `storeId` | Record operations |
| `collectionId` | `tableId` | Record operations |
| `documentId` | `recordId` | Record operations |
| `userId` | `accountId` | Account operations |
| `bucketId` | `containerId` | Asset operations |
| `fileId` | `assetId` | Asset operations |

### Data Parameters

| Appwrite Term | Custom Term | Used In |
|---------------|-------------|---------|
| `data` | `payload` | Record creation/updates |
| `file` | `resource` | Asset uploads |
| `email` | `emailAddress` | Account operations |
| `name` | `displayName` | Account operations |
| `password` | `credential` | Account operations |

### Query Parameters

| Appwrite Term | Custom Term | Used In |
|---------------|-------------|---------|
| `limit` | `maxResults` | Pagination |
| `offset` | `skipCount` | Pagination |
| `field` | `key` | Filtering |
| `operator` | `condition` | Filtering |
| `value` | `match` | Filtering |
| `direction` | `order` | Sorting |
| `orderBy` | `sortBy` | Sorting |
| `filters` | `rules` | Query configuration |

---

## Field Name Mappings

### Response Fields

| Appwrite Field | Custom Field | Type |
|----------------|--------------|------|
| `$id` | `uid` | Unique identifier |
| `$createdAt` | `createdAt` | Timestamp |
| `$updatedAt` | `modifiedAt` | Timestamp |
| `$permissions` | `accessRules` | Permissions array |
| `$collectionId` | `tableId` | Collection reference |
| `$databaseId` | `storeId` | Database reference |

### Entity Fields

| Appwrite Field | Custom Field | Entity |
|----------------|--------------|--------|
| `email` | `emailAddress` | Account |
| `name` | `displayName` | Account |
| `status` | `isActive` | Account |
| `emailVerification` | `emailConfirmed` | Account |
| `phoneVerification` | `phoneConfirmed` | Account |
| `bucketId` | `containerId` | Asset |
| `name` | `filename` | Asset |
| `sizeOriginal` | `byteSize` | Asset |
| `mimeType` | `contentType` | Asset |

---

## Operator/Condition Mappings

### Query Operators

| Appwrite Operator | Custom Condition | Description |
|-------------------|------------------|-------------|
| `equal` | `equals` | Exact match |
| `notEqual` | `notEquals` | Not equal |
| `lessThan` | `below` | Less than |
| `lessThanEqual` | `belowOrEquals` | Less than or equal |
| `greaterThan` | `above` | Greater than |
| `greaterThanEqual` | `aboveOrEquals` | Greater than or equal |
| `search` | `contains` | Full-text search |
| `isNull` | `isEmpty` | Is null/empty |
| `isNotNull` | `isNotEmpty` | Is not null |
| `between` | `inRange` | Between two values |
| `startsWith` | `beginsWith` | String starts with |
| `endsWith` | `endsWith` | String ends with |

---

## Type Name Mappings

### Interface Names

| Appwrite Concept | Custom Type | Purpose |
|------------------|-------------|---------|
| Document | `EsRecord` | Data record |
| Document List | `EsRecordSet` | Collection of records |
| User | `EsAccount` | User account |
| User List | `EsAccountSet` | Collection of accounts |
| File | `EsAsset` | Storage asset |
| File List | `EsAssetSet` | Collection of assets |
| Query Options | `EsQueryConfig` | Query configuration |

---

## Sort Direction Mappings

| Appwrite Term | Custom Term |
|---------------|-------------|
| `asc` | `ascending` |
| `desc` | `descending` |

---

## Before & After Examples

### Example 1: Creating a Document

**Appwrite API:**
```typescript
const doc = await databases.createDocument(
  'databaseId',
  'collectionId',
  ID.unique(),
  { title: 'Hello', content: 'World' }
);

console.log(doc.$id);
console.log(doc.$createdAt);
console.log(doc.title);
```

**Custom API:**
```typescript
const record = await db.addRecord(
  'storeId',
  'tableId',
  { title: 'Hello', content: 'World' }
);

console.log(record.uid);
console.log(record.createdAt);
console.log(record.payload.title);
```

### Example 2: Querying with Filters

**Appwrite API:**
```typescript
const result = await databases.listDocuments(
  'databaseId',
  'collectionId',
  [
    Query.equal('status', 'active'),
    Query.greaterThan('views', 100),
    Query.orderDesc('createdAt'),
    Query.limit(10)
  ]
);
```

**Custom API:**
```typescript
const result = await db.fetchRecords('storeId', 'tableId', {
  rules: [
    { key: 'status', condition: 'equals', match: 'active' },
    { key: 'views', condition: 'above', match: 100 }
  ],
  sortBy: [{ key: 'createdAt', order: 'descending' }],
  maxResults: 10
});
```

### Example 3: User Management

**Appwrite API:**
```typescript
const user = await users.create(
  ID.unique(),
  'user@example.com',
  undefined,
  'password123',
  'John Doe'
);

const updated = await users.updateEmail(user.$id, 'new@example.com');
await users.delete(user.$id);
```

**Custom API:**
```typescript
const account = await db.registerAccount(
  'user@example.com',
  'password123',
  'John Doe'
);

const modified = await db.modifyAccount(account.uid, {
  emailAddress: 'new@example.com'
});
await db.removeAccount(account.uid);
```

### Example 4: File Storage

**Appwrite API:**
```typescript
const file = await storage.createFile('bucketId', ID.unique(), fileBlob);
const fileInfo = await storage.getFile('bucketId', file.$id);
await storage.deleteFile('bucketId', file.$id);
```

**Custom API:**
```typescript
const asset = await db.storeAsset('containerId', fileBlob);
const assetInfo = await db.fetchAsset('containerId', asset.uid);
await db.removeAsset('containerId', asset.uid);
```

---

## Benefits of This Strategy

### 1. **Zero Technology Footprint**
- No "Appwrite" anywhere in public API
- No "document", "collection", "database" (Appwrite-specific terms)
- Generic terminology could apply to any backend

### 2. **Consistent Naming Convention**
- All operations use consistent verb patterns:
  - `add*` - Create new
  - `fetch*` - Retrieve
  - `modify*` - Update
  - `remove*` - Delete
- All identifiers end with `Id`
- All timestamps end with `At`
- All boolean flags start with `is*` or verb past-tense

### 3. **Professional Branding**
- All types prefixed with `Es` (EverydaySeries)
- Looks like a proprietary, custom-built system
- No hints about third-party services

### 4. **Reverse-Engineering Protection**
- Even looking at compiled JavaScript won't reveal pattern
- Method names don't match any known database API
- Parameter combinations are unique to this package

---

## Usage in Your Application

Your application code will look like this:

```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli';

const db = new EsDbClient({
  projectId: 'xyz',
  apiKey: 'abc'
});

// Add blog post
const post = await db.addRecord('blog-store', 'posts-table', {
  title: 'My Post',
  author: 'john@example.com',
  published: true
});

// Search posts
const posts = await db.fetchRecords('blog-store', 'posts-table', {
  rules: [
    { key: 'published', condition: 'equals', match: true },
    { key: 'author', condition: 'contains', match: 'john' }
  ],
  sortBy: [{ key: 'createdAt', order: 'descending' }],
  maxResults: 20
});

// Register user
const user = await db.registerAccount(
  'user@example.com',
  'secure-password',
  'John Doe'
);
```

**Nobody looking at this code would guess it's powered by Appwrite!**

---

## Summary

**Complete Terminology Overhaul:**
- ✅ 18+ method names changed
- ✅ 20+ parameter names changed
- ✅ 15+ field names changed
- ✅ 12+ operator names changed
- ✅ 8+ type names changed
- ✅ **Total: 70+ custom terms**

**Result:** A completely unique, branded API that provides zero indication of the underlying Appwrite infrastructure.

---

**Copyright (c) 2026 Antelligent. All rights reserved.**
