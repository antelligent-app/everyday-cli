# Package Summary: everyday-cli v1.0.2

Complete abstraction package for EverydaySeries platform with hidden Appwrite implementation.

---

## 📦 What This Package Provides

### 1. **Flow Execution Client (`EsClient`)**
Execute automated flows on the EverydaySeries platform.

**Features:**
- Run flows with parameters
- Filter nodes by type (48 node types supported)
- Extract and parse data
- Full TypeScript support

**Usage:**
```typescript
import { EsClient } from '@antelligent-app/everyday-cli';

const client = new EsClient({
  apiKey: 'es-xxx',
  slug: 'my-project'
});

const result = await client.run('flow-id', { key: 'value' });
const outputs = client.getNodesByType(result.nodes, 'text_output');
```

---

### 2. **Database Client (`EsDbClient`)** 🔐

Complete database abstraction with **zero Appwrite references**.

**Features:**
- ✅ Record CRUD operations (add, fetch, modify, remove)
- ✅ Advanced querying with 12 filter conditions
- ✅ Account management (register, fetch, modify, remove)
- ✅ Asset storage (store, fetch, retrieve, remove)
- ✅ Pagination and sorting
- ✅ Full TypeScript support

**Usage:**
```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli';

const db = new EsDbClient({
  projectId: 'my-project',
  apiKey: 'my-key'
});

// Add record
const record = await db.addRecord('storeId', 'tableId', {
  title: 'Hello',
  content: 'World'
});

// Search records
const results = await db.fetchRecords('storeId', 'tableId', {
  rules: [
    { key: 'status', condition: 'equals', match: 'active' }
  ],
  sortBy: [{ key: 'createdAt', order: 'descending' }],
  maxResults: 10
});

// Register account
const account = await db.registerAccount(
  'user@example.com',
  'password',
  'John Doe'
);

// Store asset
const asset = await db.storeAsset('containerId', fileBlob);
```

---

## 🔒 Security Architecture

### **Complete API Abstraction**

**What Users See:**
```typescript
db.addRecord('storeId', 'tableId', payload)
db.fetchRecords('storeId', 'tableId', config)
db.registerAccount(emailAddress, credential, displayName)
db.storeAsset(containerId, resource)
```

**What They Don't See:**
- Appwrite SDK methods
- Appwrite terminology
- Implementation details
- Backend infrastructure

### **70+ Custom Terms**

| Category | Custom Terms |
|----------|-------------|
| Methods | `addRecord`, `fetchRecord`, `modifyRecord`, `removeRecord`, `registerAccount`, `fetchAccount`, `storeAsset`, etc. |
| Parameters | `storeId`, `tableId`, `payload`, `emailAddress`, `displayName`, `credential`, `containerId`, etc. |
| Fields | `uid`, `modifiedAt`, `accessRules`, `emailConfirmed`, `byteSize`, `contentType`, etc. |
| Conditions | `equals`, `above`, `below`, `contains`, `isEmpty`, `inRange`, `beginsWith`, etc. |
| Config | `maxResults`, `skipCount`, `sortBy`, `rules`, `ascending`, `descending`, etc. |

**Result:** Zero technology indicators!

---

## 📂 Project Structure

```
everyday-cli/
├── src/                          # Source code (private)
│   ├── client.ts                # Flow execution client
│   ├── dbClient.ts              # Database client (Appwrite abstraction)
│   ├── cli.ts                   # Command-line interface
│   ├── types.ts                 # All type definitions
│   └── index.ts                 # Main exports
│
├── dist/                         # Compiled JavaScript (distributed)
│   ├── client.js
│   ├── dbClient.js              # 14KB compiled
│   ├── types.js
│   ├── index.js
│   └── *.d.ts                   # TypeScript declarations
│
├── examples/
│   └── database-usage.ts        # Usage examples
│
├── Documentation
│   ├── README.md                # Main documentation
│   ├── DB_API_REFERENCE.md      # Database API reference
│   ├── DATABASE_API.md          # Original database docs
│   ├── API_NAMING_STRATEGY.md   # Naming conventions explained
│   ├── SECURITY_BENEFITS.md     # Security architecture
│   └── PACKAGE_SUMMARY.md       # This file
│
├── package.json                 # Package configuration
├── tsconfig.json                # TypeScript config
└── LICENSE                      # Proprietary license
```

---

## 📋 API Overview

### **EsDbClient Methods**

#### Records (Documents)
- `addRecord(storeId, tableId, payload, recordId?)` - Create
- `fetchRecord(storeId, tableId, recordId)` - Read one
- `modifyRecord(storeId, tableId, recordId, payload)` - Update
- `removeRecord(storeId, tableId, recordId)` - Delete
- `fetchRecords(storeId, tableId, config?)` - List with filters
- `searchRecords(storeId, tableId, rules, max?, skip?)` - Advanced search

#### Accounts (Users)
- `registerAccount(emailAddress, credential, displayName?)` - Create
- `fetchAccount(accountId)` - Read
- `modifyAccount(accountId, changes)` - Update
- `removeAccount(accountId)` - Delete
- `fetchAccounts(maxResults?, skipCount?)` - List

#### Assets (Files)
- `storeAsset(containerId, resource, assetId?)` - Upload
- `fetchAsset(containerId, assetId)` - Get metadata
- `getAssetRetrievalUrl(containerId, assetId)` - Download URL
- `getAssetPreviewUrl(containerId, assetId)` - Preview URL
- `removeAsset(containerId, assetId)` - Delete
- `fetchAssets(containerId, max?, skip?)` - List

---

## 🎯 TypeScript Types

### Records
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

interface EsRecordSet {
  count: number;
  items: EsRecord[];
}
```

### Accounts
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

interface EsAccountSet {
  count: number;
  items: EsAccount[];
}
```

### Assets
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

interface EsAssetSet {
  count: number;
  items: EsAsset[];
}
```

### Query Configuration
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

## 🚀 Installation & Distribution

### **GitHub (Private Repository)**

```bash
# Install from private GitHub repo
npm install github:antelligent-app/everyday-cli

# Or in package.json
"dependencies": {
  "@antelligent-app/everyday-cli": "github:antelligent-app/everyday-cli"
}
```

### **GitHub Packages (Recommended)**

```bash
# Configure .npmrc
echo "@antelligent-app:registry=https://npm.pkg.github.com" >> .npmrc

# Install
npm install @antelligent-app/everyday-cli
```

### **Private npm Registry**

```bash
npm publish --registry https://your-private-registry.com
npm install @antelligent-app/everyday-cli --registry https://your-private-registry.com
```

---

## 🛡️ Security Layers

### Layer 1: Private Package
- ✅ Private GitHub repository
- ✅ Requires authentication to install
- ✅ Source code never public

### Layer 2: Compiled Distribution
- ✅ Only `dist/` distributed (`.js` files)
- ✅ Source `.ts` files kept private
- ✅ `.npmignore` excludes `src/`, `test/`, examples

### Layer 3: API Abstraction
- ✅ Custom branded methods (`addRecord`, not `createDocument`)
- ✅ Custom parameter names (`storeId`, not `databaseId`)
- ✅ Custom field names (`uid`, not `$id`)
- ✅ Zero Appwrite terminology

### Layer 4: Backend Configuration
- ✅ Custom endpoint domain
- ✅ Non-obvious project IDs
- ✅ API keys are secrets
- ✅ Server-side proxy recommended

---

## 📊 Package Stats

- **Size:** ~14KB (dbClient.js)
- **Dependencies:** `node-appwrite@26.2.0`
- **Dev Dependencies:** TypeScript, Jest, ESLint, Prettier
- **Node Version:** >=18.0.0
- **TypeScript:** 6.0.3
- **License:** UNLICENSED (Proprietary)

---

## 🎓 Usage Example

```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli';

async function app() {
  const db = new EsDbClient({
    projectId: process.env.PROJECT_ID,
    apiKey: process.env.API_KEY
  });

  // Blog post management
  const post = await db.addRecord('blog-store', 'posts-table', {
    title: 'Getting Started',
    content: 'Welcome to our blog!',
    author: 'john@example.com',
    published: true,
    tags: ['intro', 'welcome']
  });

  // Search published posts
  const posts = await db.fetchRecords('blog-store', 'posts-table', {
    rules: [
      { key: 'published', condition: 'equals', match: true },
      { key: 'tags', condition: 'contains', match: 'intro' }
    ],
    sortBy: [{ key: 'createdAt', order: 'descending' }],
    maxResults: 10
  });

  // User registration
  const author = await db.registerAccount(
    'john@example.com',
    'SecurePassword123',
    'John Doe'
  );

  // File upload
  // const avatar = await db.storeAsset('avatars-container', avatarFile);
  // const avatarUrl = db.getAssetPreviewUrl('avatars-container', avatar.uid);
}
```

---

## ✅ Verification Checklist

Before deploying:

- [x] Package is in private GitHub repository
- [x] Source code (`src/`) excluded from distribution
- [x] Only compiled code (`dist/`) distributed
- [x] No Appwrite references in public API
- [x] All method names are custom
- [x] All parameter names are custom
- [x] All field names are custom
- [x] TypeScript types are complete
- [x] Documentation is comprehensive
- [x] Examples demonstrate all features

---

## 📞 Support

For issues or questions about this package:
- Repository: github.com/antelligent-app/everyday-cli
- Issues: github.com/antelligent-app/everyday-cli/issues

---

## 📜 License

Copyright (c) 2026 Antelligent. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use is strictly prohibited.

---

**Built with ❤️ by Antelligent**
