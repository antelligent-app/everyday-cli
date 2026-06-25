# @antelligent-app/everyday-cli

[![npm version](https://img.shields.io/npm/v/@antelligent-app/everyday-cli.svg)](https://www.npmjs.com/package/@antelligent-app/everyday-cli)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)

TypeScript client and CLI for EverydaySeries API - Execute flows, manage databases, and work with schemas with full type safety. **Now supports both Node.js (server) and browser (client) environments!**

## 🔧 v2.0.3 - Clean Documentation (Latest)

**Documentation cleanup** - Removed obsolete files, added clear documentation structure.

- ✅ **Removed 1,900+ lines** of obsolete/temporary documentation
- ✅ **Clean structure** - Only essential docs remain
- ✅ **Better navigation** - Documentation section guides users
- ✅ **No code changes** - Same great v2.0.2 ESM fix

---

## 🔧 v2.0.2 - THE REAL FIX

**v2.0.1 didn't actually solve the problem!** v2.0.2 provides the real solution by switching from CommonJS to ESM output.

- ✅ **Changed to pure ESM** (`import/export`) instead of CommonJS (`require/exports`)
- ✅ **Webpack/Vite/Turbopack now work perfectly** - proper tree-shaking and optimization
- ✅ **20-30% smaller bundles** - better dead code elimination
- ✅ **No code changes required** - Drop-in replacement for v2.0.0/v2.0.1

**Why v2.0.1 failed:** It used separate configs but still output CommonJS. Modern bundlers need ESM!

See [V2.0.2 - The Real Fix](./V2.0.2_REAL_FIX.md) for complete details.

## 🎉 What's New in v2.0.0

**Dual-Environment Support!** - The package now works seamlessly in both:
- ✅ **Server-side**: Node.js, Next.js Server Components, API Routes, Server Actions
- ✅ **Client-side**: Browser, Next.js Client Components

See [Migration Guide](./MIGRATION_V2.md) for upgrading from v1.x.

## Features

- 🚀 **Flow Execution** - Run flows with the EsClient API
- 🗄️ **Database Operations** - Complete CRUD operations with EsDbClient
- 🌐 **Dual Environment** - Works in both Node.js (server) and browser (client)
- 🔐 **Authentication** - Client-side login, OAuth, signup, password recovery
- 👥 **Teams & Collaboration** - Full team management with roles and permissions
- 📋 **Schema Management** - Define, validate, and sync database schemas
- 🔍 **Type-Safe** - Full TypeScript support with 48+ node types
- 🛠️ **CLI & Library** - Use as command-line tool or import in your code
- ⚡ **Lightweight** - Tree-shakeable, optimal bundle sizes
- 🎯 **Helper Methods** - Filter by node type, extract values, parse JSON

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
  - [Server-Side Usage (Node.js, API Routes)](#server-side-usage-nodejs-api-routes)
  - [Client-Side Usage (Browser, Client Components)](#client-side-usage-browser-client-components)
  - [Flow Execution (EsClient)](#flow-execution-esclient)
  - [Schema Management](#schema-management)
- [Next.js Integration](#nextjs-integration)
- [CLI Usage](#cli-usage)
- [API Reference](#api-reference)
  - [Server API (node-appwrite)](#server-api-node-appwrite)
  - [Client API (appwrite web SDK)](#client-api-appwrite-web-sdk)
  - [EsClient API](#esclient-api)
  - [Schema Commands](#schema-commands)
- [Configuration](#configuration)
- [Examples](#examples)
- [Migration from v1.x](#migration-from-v1x)
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

### Server-Side Usage (Node.js, API Routes)

For server-side code (Node.js, Next.js Server Components, API Routes):

```typescript
// Import from /server
import { EsDbClient, EsQuery, EsPermission, EsRole } from '@antelligent-app/everyday-cli/server';

const db = new EsDbClient({
  projectId: process.env.APPWRITE_PROJECT_ID!,
  apiKey: process.env.APPWRITE_API_KEY!  // API key required for admin operations
});

// Admin operations with full privileges
const users = await db.fetchRecordsWithQueries('main_db', 'users', [
  EsQuery.equal('status', 'active'),
  EsQuery.limit(10)
]);
```

### Client-Side Usage (Browser, Client Components)

For client-side code (Browser, Next.js Client Components):

```typescript
'use client';  // Next.js Client Component

// Import from /client
import { EsDbClient } from '@antelligent-app/everyday-cli/client';

const db = new EsDbClient({
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  // No API key - uses session authentication
});

// Authenticate first
await db.login('user@example.com', 'password');

// Or use OAuth
await db.loginWithProvider('google');

// Now perform operations (scoped to user's permissions)
const user = await db.getCurrentUser();
const myPosts = await db.fetchRecordsWithQueries('main_db', 'posts', [
  EsQuery.equal('authorId', user!.uid)
]);
```

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

## Next.js Integration

The package is designed for seamless Next.js integration with separate imports for server and client:

### Server Component Example

```typescript
// app/posts/page.tsx
import { EsDbClient, EsQuery } from '@antelligent-app/everyday-cli/server';

export default async function PostsPage() {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  const posts = await db.fetchRecordsWithQueries('main_db', 'posts', [
    EsQuery.equal('status', 'published'),
    EsQuery.orderDesc('createdAt'),
    EsQuery.limit(10)
  ]);

  return <PostList posts={posts.items} />;
}
```

### Client Component Example

```typescript
// app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { EsDbClient } from '@antelligent-app/everyday-cli/client';

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  const db = new EsDbClient({
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  });

  useEffect(() => {
    db.getCurrentUser().then(setUser);
  }, []);

  if (!user) return <div>Please login</div>;

  return <div>Welcome, {user.displayName}!</div>;
}
```

### API Route Example

```typescript
// app/api/posts/route.ts
import { EsDbClient, EsPermission, EsRole } from '@antelligent-app/everyday-cli/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  const body = await request.json();

  const post = await db.addRecord('main_db', 'posts', body, undefined, [
    EsPermission.read(EsRole.any()),
    EsPermission.write(EsRole.user(body.authorId))
  ]);

  return NextResponse.json(post);
}
```

**See [examples/nextjs-usage.tsx](./examples/nextjs-usage.tsx) for complete examples.**

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

##### `addRecord(storeId, tableId, payload, recordId?, permissions?)`

Create a new record in a collection with optional permissions.

```typescript
import { EsPermission, EsRole, EsID } from '@antelligent-app/everyday-cli';

// Simple record without permissions
const record = await db.addRecord('db_id', 'collection_id', { name: 'John' });

// With custom ID
const record2 = await db.addRecord('db_id', 'collection_id', { name: 'Jane' }, EsID.unique());

// With permissions (public read, owner write)
const userId = 'user123';
const record3 = await db.addRecord(
  'db_id',
  'posts',
  { title: 'My Post', content: 'Hello!' },
  EsID.unique(),
  [
    EsPermission.read(EsRole.any()),           // Anyone can read
    EsPermission.write(EsRole.user(userId)),   // Only owner can write
    EsPermission.delete(EsRole.user(userId))   // Only owner can delete
  ]
);
```

##### `fetchRecord(storeId, tableId, recordId)`

Retrieve a single record by ID.

```typescript
const record = await db.fetchRecord('db_id', 'collection_id', 'record_id');
```

##### `modifyRecord(storeId, tableId, recordId, payload, permissions?)`

Update an existing record with optional permission updates.

```typescript
// Update data only
const updated = await db.modifyRecord('db_id', 'collection_id', 'record_id', { age: 31 });

// Update data and permissions
const updated2 = await db.modifyRecord(
  'db_id',
  'posts',
  'record_id',
  { title: 'Updated Title' },
  [
    EsPermission.read(EsRole.any()),
    EsPermission.update(EsRole.users())  // Now any authenticated user can update
  ]
);
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

##### `fetchRecordsWithQueries(storeId, tableId, queries)` ⭐ New

Query records using raw Appwrite Query strings for advanced use cases.

```typescript
import { EsQuery } from '@antelligent-app/everyday-cli';

// Simple query
const results = await db.fetchRecordsWithQueries('db_id', 'collection_id', [
  EsQuery.equal('status', 'active'),
  EsQuery.greaterThan('views', 100),
  EsQuery.limit(10)
]);

// Complex query with OR conditions
const advanced = await db.fetchRecordsWithQueries('db_id', 'posts', [
  EsQuery.equal('status', 'published'),
  EsQuery.or([
    EsQuery.equal('category', 'tech'),
    EsQuery.equal('category', 'programming')
  ]),
  EsQuery.between('createdAt', '2024-01-01', '2024-12-31'),
  EsQuery.orderDesc('views'),
  EsQuery.limit(20)
]);
```

#### Permissions & Roles

The CLI exports `EsPermission`, `EsRole`, `EsQuery`, and `EsID` helpers that provide a clean API while hiding Appwrite implementation details.

##### Permission Types

```typescript
import { EsPermission, EsRole } from '@antelligent-app/everyday-cli';

// Read permissions
EsPermission.read(role)

// Write permissions
EsPermission.write(role)
EsPermission.create(role)
EsPermission.update(role)
EsPermission.delete(role)
```

##### Role Types

```typescript
// Public access (anyone, including guests)
EsRole.any()

// Authenticated users
EsRole.users()

// Specific user
EsRole.user('userId')

// Team members
EsRole.team('teamId')
EsRole.team('teamId', 'owner')  // Specific team role

// Label-based access
EsRole.label('admin')
```

##### Common Permission Patterns

```typescript
// Public read, owner write
[
  EsPermission.read(EsRole.any()),
  EsPermission.write(EsRole.user(userId)),
  EsPermission.delete(EsRole.user(userId))
]

// Team collaboration
[
  EsPermission.read(EsRole.team('teamId')),
  EsPermission.write(EsRole.team('teamId')),
  EsPermission.update(EsRole.team('teamId')),
  EsPermission.delete(EsRole.user(ownerId))
]

// Authenticated users only
[
  EsPermission.read(EsRole.users()),
  EsPermission.write(EsRole.users())
]

// Admin only
[
  EsPermission.read(EsRole.label('admin')),
  EsPermission.write(EsRole.label('admin')),
  EsPermission.delete(EsRole.label('super_admin'))
]
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

#### Team Operations (Client-Side Only)

Teams are only available in the client-side package (`@antelligent-app/everyday-cli/client`) as they require user-scoped authentication.

##### `createTeam(name, teamId?, roles?)`

Create a new team with the current user as owner.

```typescript
import { EsDbClient, EsID } from '@antelligent-app/everyday-cli/client';

// Simple team creation
const team = await db.createTeam('Engineering Team');

// With custom ID and roles
const team2 = await db.createTeam(
  'Marketing Team',
  EsID.unique(),
  ['owner']
);

console.log(team.uid, team.name, team.totalMembers);
```

##### `getTeam(teamId)`

Get team details by ID.

```typescript
const team = await db.getTeam('team_id');
console.log(team.name, team.totalMembers, team.createdAt);
```

##### `listTeams(maxResults?, skipCount?)`

List all teams the current user belongs to.

```typescript
const teams = await db.listTeams(10, 0);
console.log(`Found ${teams.count} teams`);
teams.items.forEach(team => {
  console.log(`- ${team.name} (${team.totalMembers} members)`);
});
```

##### `updateTeamName(teamId, name)`

Rename a team (requires owner permission).

```typescript
const updatedTeam = await db.updateTeamName('team_id', 'New Team Name');
```

##### `deleteTeam(teamId)`

Delete a team (requires owner permission).

```typescript
await db.deleteTeam('team_id');
```

##### `listTeamMembers(teamId, maxResults?, skipCount?)`

List all members of a team.

```typescript
const members = await db.listTeamMembers('team_id', 10, 0);
console.log(`Team has ${members.count} members`);
members.items.forEach(member => {
  console.log(`- ${member.userName} (${member.userEmail})`);
  console.log(`  Roles: ${member.roles.join(', ')}`);
});
```

##### `createTeamMembership(teamId, email, roles, redirectUrl?)`

Invite a user to join a team by email.

```typescript
// Basic invitation
const membership = await db.createTeamMembership(
  'team_id',
  'user@example.com',
  ['member']
);

// With custom redirect URL
const membership2 = await db.createTeamMembership(
  'team_id',
  'admin@example.com',
  ['admin', 'member'],
  'https://myapp.com/team/invited'
);
```

**Common Roles:**
- `owner` - Full control over team (delete team, manage all members)
- `admin` - Can manage members and settings
- `member` - Basic team membership

##### `updateTeamMemberRoles(teamId, membershipId, roles)`

Update roles for a team member.

```typescript
// Promote to admin
await db.updateTeamMemberRoles('team_id', 'membership_id', ['admin', 'member']);

// Demote to regular member
await db.updateTeamMemberRoles('team_id', 'membership_id', ['member']);
```

##### `deleteTeamMembership(teamId, membershipId)`

Remove a member from a team.

```typescript
await db.deleteTeamMembership('team_id', 'membership_id');
```

##### `getTeamMembership(teamId, membershipId)`

Get details about a specific team membership.

```typescript
const membership = await db.getTeamMembership('team_id', 'membership_id');
console.log(`${membership.userName} - ${membership.userEmail}`);
console.log(`Roles: ${membership.roles.join(', ')}`);
console.log(`Joined: ${membership.joined}`);
```

**Complete Team Management Example:**

```typescript
'use client';
import { useState, useEffect } from 'react';
import { EsDbClient } from '@antelligent-app/everyday-cli/client';

const db = new EsDbClient({
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
});

export function TeamManager() {
  const [teams, setTeams] = useState([]);

  async function createNewTeam(name: string) {
    const team = await db.createTeam(name);
    setTeams([...teams, team]);
  }

  async function inviteMember(teamId: string, email: string) {
    await db.createTeamMembership(teamId, email, ['member']);
    alert(`Invitation sent to ${email}`);
  }

  useEffect(() => {
    async function loadTeams() {
      const result = await db.listTeams();
      setTeams(result.items);
    }
    loadTeams();
  }, []);

  return (
    <div>
      <h2>My Teams</h2>
      {teams.map(team => (
        <div key={team.uid}>
          <h3>{team.name}</h3>
          <p>{team.totalMembers} members</p>
        </div>
      ))}
    </div>
  );
}
```

See `examples/teams-usage.tsx` for more comprehensive examples.

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

### Example 4: Team Management (Client-Side)

See `examples/teams-usage.tsx` for comprehensive React examples including:
- Creating and managing teams
- Listing user teams
- Inviting and managing team members
- Updating member roles
- Complete team management UI component

```typescript
'use client';
import { EsDbClient } from '@antelligent-app/everyday-cli/client';

const db = new EsDbClient({
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
});

// Create a team
const team = await db.createTeam('Engineering Team');

// Invite members
await db.createTeamMembership(team.uid, 'user@example.com', ['member']);

// List team members
const members = await db.listTeamMembers(team.uid);
```

### Example 5: Permissions Usage

See `examples/permissions-usage.ts` for comprehensive permission patterns including:
- Public vs authenticated access
- User-specific permissions
- Team collaboration patterns
- Role-based access control

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

## Migration from v1.x

If you're upgrading from v1.x, you need to update your imports:

### Before (v1.x)
```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli';
```

### After (v2.x)

#### For Server-Side Code
```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli/server';
```

#### For Client-Side Code
```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli/client';
```

**Key Differences:**
- **Server** (`/server`): Uses `node-appwrite`, requires API key, has admin methods (`registerAccount`, `fetchAccounts`)
- **Client** (`/client`): Uses `appwrite` web SDK, session-based auth, has auth methods (`login`, `logout`, `signup`)

**See [MIGRATION_V2.md](./MIGRATION_V2.md) for detailed migration guide.**

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

// Database helpers (also exported)
import { EsQuery, EsPermission, EsRole, EsID } from '@antelligent-app/everyday-cli';
```

### Available Exports

The package exports the following:

**Clients:**
- `EsClient` - Flow execution client
- `EsDbClient` - Database operations client

**Database Helpers:**
- `EsQuery` - Query builder for advanced filtering
- `EsPermission` - Permission helper for document access control
- `EsRole` - Role helper for defining access roles
- `EsID` - ID generator (`EsID.unique()`, `EsID.custom()`)

**Types:**
- All TypeScript interfaces and types for type-safe development

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

## Documentation

### Essential Guides

- **[README.md](./README.md)** - Complete API reference and usage guide (you are here)
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and release notes
- **[V2.0.2_REAL_FIX.md](./V2.0.2_REAL_FIX.md)** - Understanding the v2.0.2 ESM fix
- **[NEXTJS_QUICK_START.md](./NEXTJS_QUICK_START.md)** - Quick start for Next.js users
- **[MIGRATION_V2.md](./MIGRATION_V2.md)** - Migrating from v1.x to v2.x

### Examples

- **[examples/nextjs-usage.tsx](./examples/nextjs-usage.tsx)** - Next.js integration examples
- **[examples/teams-usage.tsx](./examples/teams-usage.tsx)** - Teams management examples
- **[examples/permissions-usage.ts](./examples/permissions-usage.ts)** - Permissions patterns

## Support

For support, please visit:
- Documentation: [EverydaySeries Docs](https://app.everydayseries.ai/docs)
- Issues: [GitHub Issues](https://github.com/antelligent-app/everyday-cli/issues)
- Email: support@antelligent.app

---

**Built with ❤️ by Antelligent**
