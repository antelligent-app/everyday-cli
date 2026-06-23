# Schema System Plan: Prisma-Like Schema Manager for EsDbClient

## Overview

Create a Prisma-like schema system that allows users to:
1. Define their entire database schema in a single `schema.json` file
2. Run a single command to create/sync the schema with Appwrite
3. Get TypeScript autocomplete for all database IDs, collection IDs, and field names
4. Automatically generate type-safe client methods

---

## Current State Analysis

From `/Users/koushikroy/work/1ramp/scripts`, I found:
- **Manual scripts** for each collection (`create-organizations-collection.js`, `create-teams-collection.js`, etc.)
- **Schema update scripts** that add attributes one by one
- **No centralized schema definition**
- **Repetitive code** across 40+ script files

**Problems:**
- ❌ Need to write separate script for each collection
- ❌ No single source of truth for schema
- ❌ Manual ID management (copy-paste from console)
- ❌ No type safety
- ❌ No autocomplete for IDs

---

## Proposed Solution: Schema-First Development

### 1. Single Schema Definition

Create `appwrite.schema.json`:

```json
{
  "$schema": "@antelligent-app/everyday-cli/schema",
  "version": "1.0.0",
  "database": {
    "id": "main-db",
    "name": "Main Database"
  },
  "collections": [
    {
      "id": "organizations",
      "name": "Organizations",
      "permissions": [
        "create(users)",
        "read(users)",
        "update(users)",
        "delete(users)"
      ],
      "attributes": [
        {
          "key": "name",
          "type": "string",
          "size": 128,
          "required": true
        },
        {
          "key": "phone",
          "type": "string",
          "size": 32,
          "required": false
        },
        {
          "key": "ownerId",
          "type": "string",
          "size": 128,
          "required": true
        },
        {
          "key": "teamId",
          "type": "string",
          "size": 128,
          "required": false
        }
      ],
      "indexes": [
        {
          "key": "owner_index",
          "type": "key",
          "attributes": ["ownerId"],
          "orders": ["ASC"]
        }
      ]
    },
    {
      "id": "teams",
      "name": "Teams",
      "permissions": ["create(users)", "read(users)"],
      "attributes": [
        {
          "key": "name",
          "type": "string",
          "size": 128,
          "required": true
        },
        {
          "key": "description",
          "type": "string",
          "size": 1024,
          "required": false
        }
      ]
    },
    {
      "id": "activity_feed",
      "name": "Activity Feed",
      "permissions": ["create(users)", "read(users)"],
      "attributes": [
        {
          "key": "title",
          "type": "string",
          "size": 256,
          "required": true
        },
        {
          "key": "detail",
          "type": "string",
          "size": 512,
          "required": false
        },
        {
          "key": "category",
          "type": "string",
          "size": 64,
          "required": false
        },
        {
          "key": "ownerId",
          "type": "string",
          "size": 128,
          "required": true
        },
        {
          "key": "timestamp",
          "type": "datetime",
          "required": false
        }
      ],
      "indexes": [
        {
          "key": "owner_time_index",
          "type": "key",
          "attributes": ["ownerId", "timestamp"],
          "orders": ["ASC", "DESC"]
        }
      ]
    }
  ],
  "buckets": [
    {
      "id": "documents",
      "name": "Documents",
      "permissions": ["create(users)", "read(users)"],
      "fileSecurity": true,
      "enabled": true,
      "maximumFileSize": 10485760,
      "allowedFileExtensions": ["pdf", "doc", "docx"],
      "compression": "gzip",
      "encryption": true,
      "antivirus": true
    }
  ]
}
```

---

## 2. CLI Commands

### Install & Setup

```bash
# Initialize schema file
npx everyday-cli init

# Creates: appwrite.schema.json with starter template
```

### Schema Management

```bash
# Push schema to Appwrite (create/update)
npx everyday-cli schema push

# Pull current schema from Appwrite
npx everyday-cli schema pull

# Validate schema file
npx everyday-cli schema validate

# Show diff between local and remote
npx everyday-cli schema diff

# Generate TypeScript types
npx everyday-cli generate
```

---

## 3. Generated TypeScript Types

After running `npx everyday-cli generate`, create `appwrite-schema.d.ts`:

```typescript
// Auto-generated from appwrite.schema.json
// DO NOT EDIT MANUALLY

export interface AppwriteSchema {
  database: {
    id: 'main-db';
    name: 'Main Database';
  };

  collections: {
    organizations: {
      id: 'organizations';
      attributes: {
        name: string;
        phone?: string;
        ownerId: string;
        teamId?: string;
      };
    };
    teams: {
      id: 'teams';
      attributes: {
        name: string;
        description?: string;
      };
    };
    activity_feed: {
      id: 'activity_feed';
      attributes: {
        title: string;
        detail?: string;
        category?: string;
        ownerId: string;
        timestamp?: Date;
      };
    };
  };

  buckets: {
    documents: {
      id: 'documents';
      maxFileSize: 10485760;
      allowedExtensions: ['pdf', 'doc', 'docx'];
    };
  };
}

// Type-safe collection IDs
export type CollectionId = keyof AppwriteSchema['collections'];

// Type-safe bucket IDs
export type BucketId = keyof AppwriteSchema['buckets'];

// Helper type to get collection attributes
export type CollectionAttributes<T extends CollectionId> =
  AppwriteSchema['collections'][T]['attributes'];
```

---

## 4. Type-Safe Client Usage

### Before (No Type Safety)

```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli';

const db = new EsDbClient({ projectId: '...', apiKey: '...' });

// ❌ No autocomplete, easy to make mistakes
const record = await db.addRecord(
  'main-db',           // Typo risk
  'organiztions',      // Typo - will fail at runtime!
  {
    name: 'Acme Corp',
    phoen: '555-1234'  // Typo - no error!
  }
);
```

### After (Full Type Safety)

```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli';
import { schema } from './appwrite-schema'; // Auto-generated

const db = new EsDbClient({ projectId: '...', apiKey: '...' });
const typedDb = db.withSchema(schema);

// ✅ Full autocomplete and type checking
const record = await typedDb.addRecord(
  'organizations',  // ✓ Autocomplete suggests: organizations, teams, activity_feed
  {
    name: 'Acme Corp',     // ✓ Required field
    phone: '555-1234',     // ✓ Optional field, correct spelling
    ownerId: 'user123',    // ✓ Required field
    // phoen: '...'        // ❌ TypeScript error: unknown field
  }
);

// ✅ Return type is inferred
record.payload.name;      // ✓ Type: string
record.payload.phone;     // ✓ Type: string | undefined
record.payload.teamId;    // ✓ Type: string | undefined

// ✅ Query with type safety
const results = await typedDb.fetchRecords('organizations', {
  rules: [
    { key: 'ownerId', condition: 'equals', match: 'user123' },
    // { key: 'invalidField', ... } // ❌ TypeScript error
  ]
});
```

---

## 5. Architecture

### Project Structure

```
everyday-cli/
├── src/
│   ├── cli/
│   │   ├── commands/
│   │   │   ├── init.ts          # Initialize schema file
│   │   │   ├── push.ts          # Push schema to Appwrite
│   │   │   ├── pull.ts          # Pull schema from Appwrite
│   │   │   ├── diff.ts          # Show schema diff
│   │   │   ├── validate.ts      # Validate schema
│   │   │   └── generate.ts      # Generate TypeScript types
│   │   ├── index.ts             # CLI entry point
│   │   └── utils.ts
│   ├── schema/
│   │   ├── parser.ts            # Parse schema.json
│   │   ├── validator.ts         # Validate schema structure
│   │   ├── syncer.ts            # Sync with Appwrite
│   │   ├── generator.ts         # Generate TypeScript types
│   │   ├── differ.ts            # Compare local vs remote
│   │   └── types.ts             # Schema type definitions
│   ├── dbClient.ts
│   ├── client.ts
│   └── types.ts
├── templates/
│   ├── schema.template.json     # Starter schema template
│   └── types.template.ts        # TypeScript template
├── bin/
│   └── cli.js                   # CLI executable
└── package.json
```

---

## 6. Implementation Phases

### Phase 1: Schema Definition & Validation
**Goal:** Define schema format and validate user input

**Tasks:**
1. Define JSON schema structure
2. Create schema validator
3. Create schema parser
4. Write tests for validation

**Deliverable:** Users can create `appwrite.schema.json` and validate it

---

### Phase 2: Schema Push (Sync to Appwrite)
**Goal:** Read schema and create/update Appwrite resources

**Tasks:**
1. Implement `schema push` command
2. Create collections from schema
3. Add attributes to collections
4. Create indexes
5. Handle updates (add new fields, skip existing)
6. Create buckets
7. Error handling & rollback

**Deliverable:** `npx everyday-cli schema push` creates entire database

---

### Phase 3: Schema Pull (Import from Appwrite)
**Goal:** Generate schema from existing Appwrite database

**Tasks:**
1. Implement `schema pull` command
2. Read all collections from Appwrite
3. Read all attributes
4. Read all indexes
5. Read all buckets
6. Generate schema.json file

**Deliverable:** `npx everyday-cli schema pull` generates schema from existing DB

---

### Phase 4: TypeScript Generation
**Goal:** Generate type-safe client

**Tasks:**
1. Implement `generate` command
2. Parse schema.json
3. Generate TypeScript interfaces for each collection
4. Generate union types for IDs
5. Generate type-safe wrapper methods
6. Add JSDoc comments

**Deliverable:** `npx everyday-cli generate` creates `appwrite-schema.d.ts`

---

### Phase 5: Type-Safe Client Wrapper
**Goal:** Provide type-safe database client

**Tasks:**
1. Create `withSchema()` method on EsDbClient
2. Add generic type parameters
3. Override methods with typed versions
4. Add intellisense support
5. Write tests

**Deliverable:** Fully typed database client with autocomplete

---

### Phase 6: Schema Diff & Migrations
**Goal:** Show changes and handle migrations

**Tasks:**
1. Implement `schema diff` command
2. Compare local vs remote schemas
3. Show added/removed/modified fields
4. Generate migration plan
5. Optional: Create migration files

**Deliverable:** See changes before pushing

---

## 7. Schema File Specification

### Full Schema Structure

```typescript
interface SchemaDefinition {
  $schema: string;
  version: string;

  database: {
    id: string;
    name: string;
  };

  collections: CollectionDefinition[];
  buckets?: BucketDefinition[];
}

interface CollectionDefinition {
  id: string;
  name: string;
  permissions: PermissionString[];
  documentSecurity?: boolean;
  attributes: AttributeDefinition[];
  indexes?: IndexDefinition[];
}

interface AttributeDefinition {
  key: string;
  type: 'string' | 'integer' | 'float' | 'boolean' | 'datetime' |
        'email' | 'ip' | 'url' | 'enum';
  size?: number;          // For string types
  required: boolean;
  default?: any;
  array?: boolean;
  min?: number;          // For numeric types
  max?: number;          // For numeric types
  elements?: string[];   // For enum type
}

interface IndexDefinition {
  key: string;
  type: 'key' | 'fulltext' | 'unique';
  attributes: string[];
  orders?: ('ASC' | 'DESC')[];
}

interface BucketDefinition {
  id: string;
  name: string;
  permissions: PermissionString[];
  fileSecurity?: boolean;
  enabled?: boolean;
  maximumFileSize?: number;
  allowedFileExtensions?: string[];
  compression?: 'none' | 'gzip' | 'zstd';
  encryption?: boolean;
  antivirus?: boolean;
}

type PermissionString =
  | 'create(users)'
  | 'read(users)'
  | 'update(users)'
  | 'delete(users)'
  | 'create(any)'
  | 'read(any)'
  | 'update(any)'
  | 'delete(any)';
```

---

## 8. CLI Usage Examples

### Example 1: New Project Setup

```bash
# Step 1: Initialize
npx everyday-cli init
# Creates: appwrite.schema.json

# Step 2: Edit schema (add your collections)
nano appwrite.schema.json

# Step 3: Validate
npx everyday-cli schema validate
# ✓ Schema is valid

# Step 4: Push to Appwrite
npx everyday-cli schema push
# ✓ Created database: main-db
# ✓ Created collection: organizations (3 attributes, 1 index)
# ✓ Created collection: teams (2 attributes)
# ✓ Created bucket: documents

# Step 5: Generate types
npx everyday-cli generate
# ✓ Generated: appwrite-schema.d.ts
```

### Example 2: Existing Project (Import)

```bash
# Pull existing schema from Appwrite
npx everyday-cli schema pull

# ✓ Detected 5 collections
# ✓ Detected 2 buckets
# ✓ Generated: appwrite.schema.json

# Generate TypeScript types
npx everyday-cli generate
# ✓ Generated: appwrite-schema.d.ts
```

### Example 3: Making Changes

```bash
# Edit schema.json (add new field)
nano appwrite.schema.json

# See what will change
npx everyday-cli schema diff
# Collections:
#   organizations:
#     + email (string, optional)
#   teams:
#     ~ description (size: 1024 → 2048)

# Push changes
npx everyday-cli schema push
# ✓ Added attribute 'email' to organizations
# ✓ Updated attribute 'description' in teams
```

---

## 9. Benefits

### For Developers

✅ **Single Source of Truth** - One file defines entire database
✅ **Type Safety** - Full TypeScript autocomplete
✅ **No Manual Scripts** - Automated schema management
✅ **Version Control** - Schema changes tracked in git
✅ **Team Collaboration** - Share schema easily
✅ **Migration Support** - See changes before applying
✅ **Faster Development** - No context switching to Appwrite console

### For Your Package

✅ **Differentiation** - Unique Prisma-like feature for Appwrite
✅ **Better DX** - Superior developer experience
✅ **Reduced Errors** - Type safety prevents mistakes
✅ **Easier Onboarding** - New developers understand schema quickly
✅ **Professional Tool** - Production-ready database management

---

## 10. Comparison with Current Approach

### Current Approach (Manual Scripts)

```bash
# Need to run 10+ scripts manually
node scripts/create-organizations-collection.js
node scripts/create-teams-collection.js
node scripts/create-activity-collection.js
# ... 40 more scripts

# No type safety
const record = await db.addRecord('organizations', {...});
// ❌ Typos in collection ID
// ❌ Typos in field names
// ❌ No autocomplete
```

### New Approach (Schema-First)

```bash
# One command to rule them all
npx everyday-cli schema push

# Full type safety
const record = await typedDb.addRecord('organizations', {
  name: 'Acme',  // ✓ Autocomplete
  // ✓ Type checked
});
```

---

## 11. Implementation Priority

### Must Have (MVP)
1. ✅ Schema definition format
2. ✅ Schema validation
3. ✅ `schema push` command (create collections)
4. ✅ Basic TypeScript generation
5. ✅ Type-safe wrapper

### Should Have
6. ✅ `schema pull` command
7. ✅ `schema diff` command
8. ✅ Index creation
9. ✅ Bucket creation

### Nice to Have
10. ⚠️ Migration files
11. ⚠️ Schema versioning
12. ⚠️ Rollback support
13. ⚠️ Interactive mode

---

## 12. Next Steps

### Step 1: Create Schema Types (Week 1)
- Define TypeScript interfaces for schema
- Create JSON schema for validation
- Write schema parser

### Step 2: Implement Push Command (Week 2)
- Create `schema push` command
- Implement collection creation
- Implement attribute creation
- Handle errors gracefully

### Step 3: TypeScript Generation (Week 3)
- Create type generator
- Generate collection types
- Generate wrapper methods
- Add JSDoc comments

### Step 4: Testing & Polish (Week 4)
- Write comprehensive tests
- Add examples
- Write documentation
- Create video tutorial

---

## 13. Success Metrics

✅ Developers can define schema in <5 minutes
✅ Schema push creates entire database
✅ 100% type safety with zero manual types
✅ Autocomplete works for all IDs and fields
✅ Reduced setup time from hours to minutes
✅ Zero runtime errors from typos

---

## Conclusion

This schema system will transform your `everyday-cli` package from a simple wrapper into a **professional, Prisma-like database toolkit** that:

1. **Saves hours** of manual schema management
2. **Prevents errors** with type safety
3. **Improves DX** with autocomplete everywhere
4. **Standardizes** database management across teams
5. **Differentiates** your package from competitors

**Ready to implement?** Start with Phase 1 (Schema Definition) and iterate from there!

---

**Total Estimated Time:** 4-6 weeks for full implementation
**MVP Time:** 2-3 weeks for core features
**ROI:** 10x improvement in developer productivity
