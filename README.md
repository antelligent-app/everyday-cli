# @antelligent-app/everyday-cli

[![npm version](https://img.shields.io/npm/v/@antelligent-app/everyday-cli.svg)](https://www.npmjs.com/package/@antelligent-app/everyday-cli)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)

TypeScript client and CLI for EverydaySeries API - Execute flows, manage databases, and work with schemas with full type safety.

## Features

- 🚀 **Flow Execution** - Run flows with the EsClient API
- 🗄️ **Database Operations** - Complete CRUD operations with EsDbClient
- 📋 **Schema Management** - Define, validate, and sync database schemas
- 🔍 **Type-Safe** - Full TypeScript support with 48+ node types
- 🛠️ **CLI & Library** - Use as command-line tool or import in your code
- ⚡ **Lightweight** - Minimal dependencies, production-ready
- 🎯 **Helper Methods** - Filter by node type, extract values, parse JSON

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
  - [Flow Execution (EsClient)](#flow-execution-esclient)
  - [Database Operations (EsDbClient)](#database-operations-esdbclient)
  - [Schema Management](#schema-management)
- [CLI Usage](#cli-usage)
- [API Reference](#api-reference)
  - [EsClient API](#esclient-api)
  - [EsDbClient API](#esdbclient-api)
  - [Schema Commands](#schema-commands)
- [Configuration](#configuration)
- [Examples](#examples)
- [TypeScript Types](#typescript-types)
- [Development](#development)
- [License](#license)

## Installation

### From npm (recommended)

```bash
npm install @antelligent-app/everyday-cli
```

### From GitHub

```bash
npm install github:antelligent-app/everyday-cli
```

## Quick Start

### Flow Execution (EsClient)

Execute flows and process results with the EsClient:

```typescript
import { EsClient } from '@antelligent-app/everyday-cli';

// Initialize the client
const client = new EsClient({
  apiKey: 'es-your-api-key-here',
  slug: 'my-project-slug'
});

// Run a flow (all values must be strings)
const result = await client.run('your-flow-id', {
  email: 'user@example.com',
  content: 'Hello from EverydaySeries!',
  subject: 'Test Email'
});

// Access full nodes (with metadata, source, target)
console.log(result.nodes);

// Access just the data (cleaner, lighter)
console.log(result.data);

// Filter nodes by type (type-safe with autocomplete)
const textOutputs = client.getNodesByType(result.nodes, 'text_output');

// Get data from specific node types
const textData = client.getNodesDataByType(result.nodes, 'text_output');

// Extract and parse values (auto-parses JSON strings)
const firstOutput = client.getNodeByType(result.nodes, 'text_output');
const value = client.getNodeValue(firstOutput);
```

### Database Operations (EsDbClient)

Perform CRUD operations on your database:

```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli';

// Initialize the database client
const db = new EsDbClient({
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  endpoint: 'https://provider.everydayseries.ai/v1' // optional
});

// Create a record
const user = await db.addRecord('database_id', 'users', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

// Read a record
const fetchedUser = await db.fetchRecord('database_id', 'users', user.uid);

// Update a record
const updated = await db.modifyRecord('database_id', 'users', user.uid, {
  age: 31
});

// Query records with filters
const activeUsers = await db.fetchRecords('database_id', 'users', {
  rules: [
    { key: 'isActive', condition: 'equals', match: true }
  ],
  maxResults: 10,
  sortBy: [{ key: 'createdAt', order: 'descending' }]
});

// Delete a record
await db.removeRecord('database_id', 'users', user.uid);

// Account management
const account = await db.registerAccount(
  'user@example.com',
  'SecurePassword123!',
  'Display Name'
);

// File storage
const asset = await db.storeAsset('bucket_id', fileBlob);
const downloadUrl = db.getAssetRetrievalUrl('bucket_id', asset.uid);
```

### Schema Management

Define and manage database schemas with the CLI:

```bash
# Initialize a new schema
everyday-cli schema init --database-id main_db --database-name "Main Database"

# Validate your schema
everyday-cli schema validate

# Push schema to remote server
everyday-cli schema push --api-key xxx --project-id yyy

# Pull schema from remote server
everyday-cli schema pull --database-id main_db

# View schema information
everyday-cli schema info
```

## CLI Usage

### Flow Execution

```bash
# Basic usage
everyday-cli <flow-id> -k <api-key> -s <slug> -v '{"key":"value"}'

# Using environment variable
export EVERYDAY_API_KEY=es-your-key
everyday-cli flow-id -s my-slug -v '{"email":"test@example.com"}'

# Filter by node type
everyday-cli flow-id -k es-xxx -s slug -v '{"q":"search"}' -n text_output

# Get help
everyday-cli --help
```

**Flow Options:**
- `-k, --api-key` - API key (or use `EVERYDAY_API_KEY` env var)
- `-s, --slug` - Flow execution slug
- `-v, --value` - JSON key-value pairs (all values converted to strings)
- `-n, --node-type` - Filter output by node type
- `-h, --help` - Show help

### Schema Commands

```bash
# Initialize schema
everyday-cli schema init [-d database-id] [-n database-name] [-f]

# Validate schema
everyday-cli schema validate [-p path/to/schema.json]

# Push to server
everyday-cli schema push [--dry-run] [--api-key key] [--project-id id]

# Pull from server
everyday-cli schema pull [--database-id id] [--api-key key] [--project-id id]

# Show info
everyday-cli schema info [-p path/to/schema.json]
```

## API Reference

### EsClient API

#### Constructor

```typescript
new EsClient(config: EsClientConfig)
```

**Config:**
- `apiKey` (required) - Your EverydaySeries API key
- `slug` (required) - Slug for flow execution
- `baseUrl` (optional) - API base URL (default: `https://app.everydayseries.ai`)

#### Methods

##### `run(id, value)`

Execute a flow by ID with a key-value object where all values must be strings.

```typescript
await client.run('flow-id', { key1: 'value1', key2: 'value2' });
```

**Returns:** `Promise<RunFlowResult>`

##### `getNodesByType(nodes, nodeType)`

Filter nodes by type with type-safe autocomplete.

```typescript
const textNodes = client.getNodesByType(result.nodes, 'text_output');
```

##### `getNodeByType(nodes, nodeType)`

Get the first node of a specific type.

```typescript
const firstTextNode = client.getNodeByType(result.nodes, 'text_output');
```

##### `getNodeValue(node)`

Extract and parse the value from a node. Automatically parses JSON strings.

```typescript
const value = client.getNodeValue(node);
```

##### `getNodesData(nodes)`

Get only the data from nodes (excludes metadata, source, target, etc.).

```typescript
const allData = client.getNodesData(result.nodes);
```

##### `getNodesDataByType(nodes, nodeType)`

Get data from nodes of a specific type.

```typescript
const textData = client.getNodesDataByType(result.nodes, 'text_output');
```

### EsDbClient API

#### Constructor

```typescript
new EsDbClient(config: EsDbClientConfig)
```

**Config:**
- `projectId` (required) - Your project ID
- `apiKey` (required) - Your API key
- `endpoint` (optional) - API endpoint (default: `https://provider.everydayseries.ai/v1`)

#### Record Operations

##### `addRecord(storeId, tableId, payload, recordId?)`

Create a new record in a collection.

```typescript
const record = await db.addRecord('db_id', 'collection_id', { name: 'John' });
```

##### `fetchRecord(storeId, tableId, recordId)`

Retrieve a single record by ID.

```typescript
const record = await db.fetchRecord('db_id', 'collection_id', 'record_id');
```

##### `modifyRecord(storeId, tableId, recordId, payload)`

Update an existing record.

```typescript
const updated = await db.modifyRecord('db_id', 'collection_id', 'record_id', { age: 31 });
```

##### `removeRecord(storeId, tableId, recordId)`

Delete a record.

```typescript
await db.removeRecord('db_id', 'collection_id', 'record_id');
```

##### `fetchRecords(storeId, tableId, config?)`

Query records with filters, sorting, and pagination.

```typescript
const results = await db.fetchRecords('db_id', 'collection_id', {
  rules: [{ key: 'age', condition: 'above', match: 25 }],
  sortBy: [{ key: 'name', order: 'ascending' }],
  maxResults: 10,
  skipCount: 0
});
```

**Filter Conditions:**
- `equals`, `notEquals`
- `below`, `belowOrEquals`, `above`, `aboveOrEquals`
- `contains`, `beginsWith`, `endsWith`
- `isEmpty`, `isNotEmpty`
- `inRange`

##### `searchRecords(storeId, tableId, rules, maxResults?, skipCount?)`

Advanced search with custom filter rules.

```typescript
const results = await db.searchRecords('db_id', 'collection_id', [
  { key: 'status', condition: 'equals', match: 'active' },
  { key: 'age', condition: 'above', match: 18 }
], 10, 0);
```

#### Account Operations

##### `registerAccount(emailAddress, credential, displayName?)`

Create a new user account.

```typescript
const account = await db.registerAccount('user@example.com', 'password123', 'John Doe');
```

##### `fetchAccount(accountId)`

Get account details.

```typescript
const account = await db.fetchAccount('account_id');
```

##### `modifyAccount(accountId, changes)`

Update account information.

```typescript
const updated = await db.modifyAccount('account_id', {
  displayName: 'New Name',
  emailAddress: 'new@example.com'
});
```

##### `removeAccount(accountId)`

Delete an account.

```typescript
await db.removeAccount('account_id');
```

##### `fetchAccounts(maxResults?, skipCount?)`

List all accounts with pagination.

```typescript
const accounts = await db.fetchAccounts(10, 0);
```

#### Asset Storage Operations

##### `storeAsset(containerId, resource, assetId?)`

Upload a file to storage.

```typescript
const asset = await db.storeAsset('bucket_id', fileBlob);
```

##### `fetchAsset(containerId, assetId)`

Get asset metadata.

```typescript
const asset = await db.fetchAsset('bucket_id', 'asset_id');
```

##### `getAssetRetrievalUrl(containerId, assetId)`

Generate download URL for an asset.

```typescript
const url = db.getAssetRetrievalUrl('bucket_id', 'asset_id');
```

##### `getAssetPreviewUrl(containerId, assetId)`

Generate preview URL for an asset.

```typescript
const url = db.getAssetPreviewUrl('bucket_id', 'asset_id');
```

##### `removeAsset(containerId, assetId)`

Delete an asset.

```typescript
await db.removeAsset('bucket_id', 'asset_id');
```

##### `fetchAssets(containerId, maxResults?, skipCount?)`

List assets in a container.

```typescript
const assets = await db.fetchAssets('bucket_id', 10, 0);
```

### Schema Commands

The schema management system allows you to define database structure as code and synchronize it with your Appwrite backend.

#### Schema File Format

Create a `schema.json` file:

```json
{
  "$schema": "@antelligent-app/everyday-cli/schema",
  "version": "1.0.0",
  "database": {
    "id": "main_db",
    "name": "Main Database"
  },
  "collections": [
    {
      "id": "users",
      "name": "Users",
      "attributes": [
        {
          "key": "name",
          "type": "string",
          "size": 255,
          "required": true
        },
        {
          "key": "email",
          "type": "email",
          "size": 320,
          "required": true
        },
        {
          "key": "age",
          "type": "integer",
          "required": false,
          "min": 0,
          "max": 150
        }
      ],
      "indexes": [
        {
          "key": "email_idx",
          "type": "unique",
          "attributes": ["email"]
        }
      ]
    }
  ],
  "buckets": [
    {
      "id": "avatars",
      "name": "User Avatars",
      "maximumFileSize": 5242880,
      "allowedFileExtensions": ["jpg", "jpeg", "png", "gif"]
    }
  ]
}
```

## Configuration

### Environment Variables

Create a `.env` file:

```bash
# Flow API Key (for EsClient)
EVERYDAY_API_KEY=es-your-api-key-here

# Database API Configuration (for EsDbClient)
EVERYDAY_PROJECT_ID=your-project-id-here
EVERYDAY_ENDPOINT=https://provider.everydayseries.ai/v1

# Optional: Default slug
EVERYDAY_SLUG=your-default-slug
```

### Getting API Keys

1. **Flow API Key**: Log in to [EverydaySeries](https://app.everydayseries.ai) and navigate to your account settings
2. **Database Credentials**: Get your project ID and API key from your Appwrite/EverydaySeries provider dashboard

## Examples

### Example 1: Email Flow with Error Handling

```typescript
import { EsClient } from '@antelligent-app/everyday-cli';

const client = new EsClient({
  apiKey: process.env.EVERYDAY_API_KEY!,
  slug: 'email-automation'
});

async function sendEmail(to: string, subject: string, body: string) {
  const result = await client.run('email-flow-id', {
    email: to,
    subject: subject,
    content: body
  });

  if (!result.success) {
    throw new Error(`Email failed: ${result.error}`);
  }

  const outputs = client.getNodesDataByType(result.nodes, 'text_output');
  return outputs;
}
```

### Example 2: User Management

```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli';

const db = new EsDbClient({
  projectId: process.env.EVERYDAY_PROJECT_ID!,
  apiKey: process.env.EVERYDAY_API_KEY!
});

async function createUser(email: string, name: string, age: number) {
  // Create user record
  const user = await db.addRecord('main_db', 'users', {
    email,
    name,
    age,
    isActive: true,
    createdAt: new Date().toISOString()
  });

  // Create associated account
  const account = await db.registerAccount(email, 'temp-password', name);

  return { user, account };
}

async function getActiveUsers() {
  return await db.fetchRecords('main_db', 'users', {
    rules: [
      { key: 'isActive', condition: 'equals', match: true }
    ],
    sortBy: [{ key: 'name', order: 'ascending' }]
  });
}
```

### Example 3: File Upload with Metadata

```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli';
import * as fs from 'fs';

const db = new EsDbClient({
  projectId: process.env.EVERYDAY_PROJECT_ID!,
  apiKey: process.env.EVERYDAY_API_KEY!
});

async function uploadUserAvatar(userId: string, filePath: string) {
  // Read file
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]);

  // Upload to storage
  const asset = await db.storeAsset('avatars', blob);

  // Save metadata to database
  await db.modifyRecord('main_db', 'users', userId, {
    avatarId: asset.uid,
    avatarUrl: db.getAssetRetrievalUrl('avatars', asset.uid)
  });

  return asset;
}
```

## Supported Node Types

The package includes TypeScript definitions for 48 node types with full autocomplete support:

**Output Nodes:** `text_output`, `md_output`, `img_output`, `video_output`, `audio_output`, `html_output`

**Input Nodes:** `multi_text_input`, `selection`

**AI Nodes:** `prompt_ai`, `tool_ai`, `replicate_ai`, `image_to_text`, `text_to_image`

**Integration Nodes:** `github`, `gmail`, `notion`, `slack`, `jira`, `airtable`, `ghost_post`

**Data Processing:** `concat`, `json_splitter`, `pass_on`, `csv`, `sql`, `sql_output`

**Analysis:** `language_detection`, `entity_recognition`, `key_phrase_extraction`, `sentiment_analysis`, `pii_entity_recognition`

**Utilities:** `webhook_output`, `email_output`, `timer`, `delay`, `cron`, `api_call`, `python_run`, `read_pdf`, `validation`, `note`, `markdown`

**Advanced:** `super_node`, `integration_output`, `writer_output`, `writer_create`, `okr_output`, `series_symbol`

## TypeScript Types

All types are fully documented with JSDoc comments:

```typescript
import type {
  // Client configs
  EsClientConfig,
  EsDbClientConfig,

  // Flow types
  FlowNode,
  FlowValue,
  RunFlowResult,
  NodeType,

  // Database types
  EsRecord,
  EsRecordSet,
  EsAccount,
  EsAccountSet,
  EsAsset,
  EsAssetSet,
  EsQueryConfig
} from '@antelligent-app/everyday-cli';
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Lint the code
npm run lint

# Format the code
npm run format
```

### Project Structure

```
everyday-cli/
├── src/
│   ├── client.ts         # EsClient (flow execution)
│   ├── dbClient.ts       # EsDbClient (database operations)
│   ├── cli.ts            # CLI entry point
│   ├── types.ts          # TypeScript type definitions
│   └── schema/
│       ├── cli.ts        # Schema CLI commands
│       ├── manager.ts    # Schema sync manager
│       ├── parser.ts     # Schema file parser
│       ├── validator.ts  # Schema validator
│       └── types.ts      # Schema type definitions
├── dist/                 # Built JavaScript files
├── test/                 # Test files
└── examples/             # Example usage
```

## Publishing

This package is published to npm. To install for GitHub:

```bash
# Install from GitHub
npm install github:antelligent-app/everyday-cli

# Install from npm
npm install @antelligent-app/everyday-cli
```

## Contributing

This is a proprietary package. For issues or feature requests, please contact the maintainers.

## License

Copyright (c) 2026 Antelligent. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use is strictly prohibited.

## Support

For support, please visit:
- Documentation: [EverydaySeries Docs](https://app.everydayseries.ai/docs)
- Issues: [GitHub Issues](https://github.com/antelligent-app/everyday-cli/issues)
- Email: support@antelligent.app

---

**Built with ❤️ by Antelligent**
