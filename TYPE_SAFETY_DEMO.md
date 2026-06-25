# Type Safety Demonstration

This document demonstrates the **strict type safety** provided by the EverydaySeries CLI's branded types.

## Branded Types

We use TypeScript's branded types to ensure users can only pass values created by our helper classes:

```typescript
// Branded types (internal)
export type EsPermissionString = string & { readonly __brand: 'EsPermission' };
export type EsRoleString = string & { readonly __brand: 'EsRole' };
export type EsQueryString = string & { readonly __brand: 'EsQuery' };
```

## What This Prevents

### ❌ Prevents Invalid Permissions

```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli';

const db = new EsDbClient({ projectId, apiKey });

// ❌ TypeScript ERROR: Type 'string' is not assignable to type 'EsPermissionString'
await db.addRecord('db', 'posts', { title: 'Hello' }, undefined, [
  'read("any")'  // ❌ Can't use plain strings!
]);

// ❌ TypeScript ERROR: Argument of type 'string' is not assignable to parameter of type 'EsRoleString'
await db.addRecord('db', 'posts', { title: 'Hello' }, undefined, [
  EsPermission.read('any')  // ❌ Can't pass plain string to EsPermission.read()
]);
```

### ✅ Requires Proper Usage

```typescript
import { EsDbClient, EsPermission, EsRole, EsID } from '@antelligent-app/everyday-cli';

const db = new EsDbClient({ projectId, apiKey });

// ✅ TypeScript HAPPY: Correct types!
await db.addRecord(
  'db',
  'posts',
  { title: 'Hello' },
  EsID.unique(),
  [
    EsPermission.read(EsRole.any()),           // ✅ Correct!
    EsPermission.write(EsRole.user('user123')) // ✅ Correct!
  ]
);
```

## Query Type Safety

### ❌ Prevents Invalid Queries

```typescript
// ❌ TypeScript ERROR: Type 'string' is not assignable to type 'EsQueryString'
await db.fetchRecordsWithQueries('db', 'posts', [
  'equal("status", "active")'  // ❌ Can't use plain strings!
]);
```

### ✅ Requires Proper Usage

```typescript
import { EsQuery } from '@antelligent-app/everyday-cli';

// ✅ TypeScript HAPPY: Correct types!
await db.fetchRecordsWithQueries('db', 'posts', [
  EsQuery.equal('status', 'active'),      // ✅ Correct!
  EsQuery.greaterThan('views', 100),      // ✅ Correct!
  EsQuery.orderDesc('createdAt'),         // ✅ Correct!
  EsQuery.limit(10)                       // ✅ Correct!
]);
```

## Type Safety for Logical Operators

### ❌ Prevents Mixing Query Strings

```typescript
// ❌ TypeScript ERROR: Type 'string[]' is not assignable to type 'EsQueryString[]'
EsQuery.or([
  'equal("a", 1)',  // ❌ Plain string not allowed!
  'equal("b", 2)'   // ❌ Plain string not allowed!
]);
```

### ✅ Requires Typed Queries

```typescript
// ✅ TypeScript HAPPY: Array of EsQueryString
EsQuery.or([
  EsQuery.equal('a', 1),  // ✅ Returns EsQueryString
  EsQuery.equal('b', 2)   // ✅ Returns EsQueryString
]);
```

## Benefits

### 1. **Compile-Time Safety**

Errors are caught at compile time, not runtime:

```typescript
// Without branded types (OLD - DANGEROUS)
await db.addRecord('db', 'posts', {}, undefined, [
  'typo_in_permission'  // ❌ No error until runtime!
]);

// With branded types (NEW - SAFE)
await db.addRecord('db', 'posts', {}, undefined, [
  'typo_in_permission'  // ✅ TypeScript ERROR immediately!
]);
```

### 2. **IDE Autocomplete**

Your IDE knows you must use `EsPermission`, `EsRole`, or `EsQuery`:

```typescript
// When you type this:
await db.addRecord('db', 'posts', {}, undefined, [
  // Your IDE suggests: EsPermission.read(), EsPermission.write(), etc.
]);
```

### 3. **Self-Documenting Code**

The types make it clear what's expected:

```typescript
// Method signature is self-documenting
async addRecord(
  storeId: string,
  tableId: string,
  payload: Record<string, any>,
  recordId?: string,
  permissions?: EsPermissionString[]  // ✅ Clear: Must use EsPermission methods!
): Promise<EsRecord>
```

### 4. **Prevents Appwrite Leakage**

Users can't accidentally use Appwrite directly:

```typescript
import { Permission, Role } from 'node-appwrite';  // ❌ Not exported!

// ❌ Can't import Appwrite's Permission/Role
// ✅ Must use our EsPermission/EsRole wrappers
```

## Type Compatibility

The branded types are still compatible with Appwrite internally:

```typescript
// Our branded type
type EsPermissionString = string & { readonly __brand: 'EsPermission' };

// At runtime, it's just a string, so it works with Appwrite
await this.databases.createDocument(
  storeId,
  tableId,
  recordId,
  payload,
  permissions  // EsPermissionString[] works as string[] internally
);
```

## Summary

| Feature | Without Branded Types | With Branded Types |
|---------|----------------------|-------------------|
| **Type Safety** | ❌ Can pass any string | ✅ Must use helper methods |
| **Runtime Errors** | ❌ Invalid strings fail at runtime | ✅ Caught at compile time |
| **IDE Support** | ❌ No autocomplete hints | ✅ Full autocomplete |
| **Code Clarity** | ❌ Unclear what's valid | ✅ Self-documenting |
| **Appwrite Hiding** | ❌ Users see Appwrite | ✅ Completely hidden |

## Real-World Example

```typescript
import {
  EsDbClient,
  EsPermission,
  EsRole,
  EsQuery,
  EsID,
  type EsPermissionString  // Can import types for advanced usage
} from '@antelligent-app/everyday-cli';

const db = new EsDbClient({ projectId, apiKey });

// Define reusable permissions
const publicReadPermissions: EsPermissionString[] = [
  EsPermission.read(EsRole.any())
];

const ownerPermissions = (userId: string): EsPermissionString[] => [
  EsPermission.read(EsRole.any()),
  EsPermission.write(EsRole.user(userId)),
  EsPermission.delete(EsRole.user(userId))
];

// Use with full type safety
const post = await db.addRecord(
  'blog_db',
  'posts',
  { title: 'My Post', content: 'Hello World!' },
  EsID.unique(),
  ownerPermissions('user_123')  // ✅ Type-safe!
);

// Query with full type safety
const results = await db.fetchRecordsWithQueries('blog_db', 'posts', [
  EsQuery.equal('authorId', 'user_123'),
  EsQuery.greaterThan('views', 100),
  EsQuery.or([
    EsQuery.equal('category', 'tech'),
    EsQuery.equal('category', 'tutorial')
  ]),
  EsQuery.orderDesc('createdAt'),
  EsQuery.limit(20)
]);
```

---

**Result**: Users get a completely type-safe API with no exposure to Appwrite internals! 🎉
