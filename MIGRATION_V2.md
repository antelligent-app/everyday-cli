# Migration Guide: v1.x → v2.0.0

## 🎉 What's New in v2.0.0

Version 2.0.0 introduces **dual-environment support**, allowing you to use `@antelligent-app/everyday-cli` in both:
- **Server environments**: Node.js, Next.js Server Components, API Routes, Server Actions
- **Client environments**: Browser, Next.js Client Components

This enables seamless integration in modern full-stack applications like Next.js!

---

## ⚠️ Breaking Changes

### Import Paths Have Changed

**Before (v1.x):**
```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli';

const db = new EsDbClient({
  projectId: 'xxx',
  apiKey: 'yyy'
});
```

**After (v2.x):**

#### Option 1: Server-Side (Recommended for existing code)
```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli/server';

const db = new EsDbClient({
  projectId: 'xxx',
  apiKey: 'yyy'  // API key required for admin operations
});
```

#### Option 2: Client-Side (New!)
```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli/client';

const db = new EsDbClient({
  projectId: 'xxx'
  // No API key - uses session authentication
});

// Must login first
await db.login('user@example.com', 'password');
```

#### Option 3: Backwards Compatibility (Not recommended)
```typescript
// Default export still works for v1.x compatibility
import { EsDbClient } from '@antelligent-app/everyday-cli';

// But it's the SERVER implementation, so API key is still required
```

---

## 🔑 Key Differences: Server vs Client

| Feature | Server (`/server`) | Client (`/client`) |
|---------|-------------------|-------------------|
| **Import Path** | `@antelligent-app/everyday-cli/server` | `@antelligent-app/everyday-cli/client` |
| **Authentication** | API Key (admin access) | Session-based (user context) |
| **Permissions** | Bypass document permissions | Respects document permissions |
| **Use Cases** | Admin operations, bulk ops | User interactions, auth flows |
| **Environment** | Node.js only | Browser + SSR |
| **Additional Methods** | `registerAccount()`, `fetchAccounts()`, etc. | `login()`, `logout()`, `signup()`, etc. |

---

## 📋 Migration Checklist

### Step 1: Update Imports

Find all imports of `EsDbClient` and update them:

```bash
# In your codebase, replace:
# import { EsDbClient } from '@antelligent-app/everyday-cli';
# with:
# import { EsDbClient } from '@antelligent-app/everyday-cli/server';
```

### Step 2: Verify API Keys Are Server-Side Only

Ensure API keys are only used in server environments:

✅ **Good**:
```typescript
// server/api/route.ts or Server Component
import { EsDbClient } from '@antelligent-app/everyday-cli/server';

const db = new EsDbClient({
  projectId: process.env.APPWRITE_PROJECT_ID!,
  apiKey: process.env.APPWRITE_API_KEY!  // ✅ Safe on server
});
```

❌ **Bad**:
```typescript
// client component
'use client';
import { EsDbClient } from '@antelligent-app/everyday-cli/server';  // ❌ Wrong!

const db = new EsDbClient({
  apiKey: 'exposed-key'  // ❌ SECURITY RISK!
});
```

### Step 3: Update Helper Imports (Optional)

Helpers (EsQuery, EsPermission, EsRole, EsID) work in both environments:

```typescript
// Server
import { EsQuery, EsPermission, EsRole } from '@antelligent-app/everyday-cli/server';

// Client
import { EsQuery, EsPermission, EsRole } from '@antelligent-app/everyday-cli/client';

// Both work the same!
const queries = [
  EsQuery.equal('status', 'active'),
  EsQuery.limit(10)
];
```

---

## 🚀 New Features in v2.0.0

### 1. Client-Side Authentication

```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli/client';

const db = new EsDbClient({
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
});

// Email/password login
await db.login('user@example.com', 'password');

// OAuth login
await db.loginWithProvider('google');

// Get current user
const user = await db.getCurrentUser();

// Logout
await db.logout();

// Sign up
await db.signup('new@example.com', 'password', 'John Doe');
```

### 2. Browser-Safe Database Operations

```typescript
'use client';
import { EsDbClient, EsQuery } from '@antelligent-app/everyday-cli/client';

const db = new EsDbClient({
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
});

// Must be logged in first
await db.login('user@example.com', 'password');

// CRUD operations scoped to user's permissions
const posts = await db.fetchRecordsWithQueries('main_db', 'posts', [
  EsQuery.equal('authorId', (await db.getCurrentUser())!.uid),
  EsQuery.orderDesc('createdAt')
]);
```

### 3. Password Recovery & Email Verification

```typescript
// Send password recovery email
await db.sendPasswordRecovery('user@example.com');

// Complete password recovery
await db.completePasswordRecovery(userId, secret, newPassword);

// Send email verification
await db.sendEmailVerification();

// Complete email verification
await db.completeEmailVerification(userId, secret);
```

### 4. User Profile Management

```typescript
// Update user name
await db.updateName('New Name');

// Update email (requires password)
await db.updateEmail('newemail@example.com', 'current-password');

// Update password
await db.updatePassword('new-password', 'old-password');
```

---

## 📖 Next.js Integration Examples

### Server Component
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
    EsQuery.limit(10)
  ]);

  return <PostList posts={posts.items} />;
}
```

### Client Component
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

  return user ? <div>Welcome, {user.displayName}!</div> : <div>Loading...</div>;
}
```

### API Route
```typescript
// app/api/posts/route.ts
import { EsDbClient } from '@antelligent-app/everyday-cli/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  const body = await request.json();
  const post = await db.addRecord('main_db', 'posts', body);

  return NextResponse.json(post);
}
```

---

## ⚡ Performance Improvements

### Tree-Shaking
With conditional exports, bundlers can now tree-shake unused code:
- **Server builds** only include `node-appwrite`
- **Client builds** only include `appwrite` web SDK
- Smaller bundle sizes for both environments!

### Universal Helpers
Helpers (EsQuery, EsPermission, EsRole, EsID) are now environment-independent:
- No runtime dependencies
- Zero-cost abstractions
- Work identically in both server and client

---

## 🐛 Troubleshooting

### Error: "Module not found: Can't resolve '@antelligent-app/everyday-cli/server'"

**Solution**: Rebuild your project to pick up the new exports:
```bash
rm -rf node_modules/.cache
npm run build
```

### Error: "API key is required"

**Problem**: You're using the server implementation without an API key.

**Solution**: Either:
1. Provide an API key (server-side only)
2. Use the client implementation instead

### Error: "User is not authenticated"

**Problem**: Client-side operations require authentication.

**Solution**: Call `db.login()` before performing operations:
```typescript
await db.login('user@example.com', 'password');
// Now you can perform operations
```

---

## 📚 Further Reading

- [Next.js Dual Support Guide](./NEXTJS_DUAL_SUPPORT.md)
- [Type Safety Demo](./TYPE_SAFETY_DEMO.md)
- [Next.js Usage Examples](./examples/nextjs-usage.tsx)
- [README.md](./README.md)

---

## 💬 Getting Help

- **GitHub Issues**: [Report a bug or request a feature](https://github.com/antelligent-app/everyday-cli/issues)
- **Documentation**: See [README.md](./README.md) for complete API documentation

---

## 🎯 Summary

**For existing v1.x users:**
1. Update imports to `@antelligent-app/everyday-cli/server`
2. Verify API keys are server-side only
3. Rebuild your project
4. You're done!

**For new Next.js users:**
- Use `/server` for Server Components, API Routes, Server Actions
- Use `/client` for Client Components, browser JavaScript
- Enjoy type-safe, secure database operations in both environments!

**Version bump**: v1.1.1 → v2.0.0 (Major version due to breaking import changes)
