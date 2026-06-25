# Migration Guide: v2.0.0 → v2.0.1

## TL;DR - Quick Migration

**Good News:** If you're using the package correctly, **no code changes are required!**

Just update the package version:

```bash
# If using npm link (development)
cd /path/to/everyday-cli
npm run build
cd /path/to/your-nextjs-app
# No need to re-link, just refresh

# If using npm install
npm install @antelligent-app/everyday-cli@latest
# or
npm update @antelligent-app/everyday-cli
```

---

## What Changed in v2.0.1?

v2.0.1 is a **critical bug fix release** that fixes build system issues. The **API remains 100% unchanged**.

### Bug Fixes (No Action Needed)

- ✅ Fixed client bundle including Node.js dependencies
- ✅ Fixed webpack/Vite build errors (`UnhandledSchemeError: Reading from "node:assert"`)
- ✅ Fixed Turbopack compatibility issues
- ✅ Improved package.json export conditions

**Your existing code will work without any modifications.**

---

## Step-by-Step Migration

### Step 1: Update the Package

#### If Using npm link (Local Development):

```bash
# In the everyday-cli directory
cd /Users/koushikroy/work/everyday-npm/everyday-cli
npm run build

# That's it! Your Next.js app will automatically use the new build
```

#### If Installed from npm:

```bash
# In your Next.js app directory
npm update @antelligent-app/everyday-cli

# Or explicitly install v2.0.1
npm install @antelligent-app/everyday-cli@2.0.1
```

### Step 2: Verify Your Imports (Should Be Unchanged)

Your imports should already look like this - **don't change them:**

#### ✅ Server Components (app/page.tsx)

```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli/server';

const db = new EsDbClient({
  projectId: process.env.APPWRITE_PROJECT_ID!,
  apiKey: process.env.APPWRITE_API_KEY!
});
```

#### ✅ Client Components (app/components/MyComponent.tsx)

```typescript
'use client';

import { EsDbClient } from '@antelligent-app/everyday-cli/client';

const db = new EsDbClient({
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
});
```

#### ✅ API Routes (app/api/users/route.ts)

```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli/server';

export async function GET() {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  // ...
}
```

### Step 3: Test Your Application

```bash
# Clean Next.js cache (recommended)
rm -rf .next

# Rebuild and test
npm run dev

# Or with webpack if you were using it as workaround
npm run dev -- --webpack
```

**Note:** You can now remove the `--webpack` flag if you were using it as a workaround for Turbopack issues!

---

## Common Scenarios

### Scenario 1: You Were Getting Webpack Errors

**Before v2.0.1:**
```
Error: Module build failed: UnhandledSchemeError:
Reading from "node:assert" is not handled by plugins
```

**After v2.0.1:**
✅ This error is completely fixed. Your builds will succeed without any code changes.

### Scenario 2: You Were Using `--webpack` Flag

**Before v2.0.1:**
```bash
npm run dev -- --webpack  # Workaround for Turbopack
```

**After v2.0.1:**
```bash
npm run dev  # Works with both Webpack and Turbopack now!
```

You can continue using `--webpack` if you prefer, but it's no longer required.

### Scenario 3: You Have Custom Webpack Config

If you added custom webpack configuration to handle the package, you can now remove it:

**Before v2.0.1 (can be removed):**
```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    // Custom config to handle everyday-cli
    config.resolve.fallback = {
      ...config.resolve.fallback,
      assert: false,
    };
    return config;
  }
}
```

**After v2.0.1 (clean config):**
```javascript
// next.config.js
module.exports = {
  // No special configuration needed!
}
```

---

## Verification Checklist

After upgrading, verify these work correctly:

### ✅ Server Components
```typescript
// app/page.tsx
import { EsDbClient } from '@antelligent-app/everyday-cli/server';

export default async function Page() {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  const users = await db.fetchRecords('main_db', 'users');
  return <div>Users: {users.count}</div>;
}
```

### ✅ Client Components
```typescript
// app/components/LoginForm.tsx
'use client';
import { EsDbClient } from '@antelligent-app/everyday-cli/client';
import { useState } from 'react';

export function LoginForm() {
  const db = new EsDbClient({
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  });

  async function handleLogin(email: string, password: string) {
    await db.login(email, password);
  }

  return <form>{/* ... */}</form>;
}
```

### ✅ API Routes
```typescript
// app/api/teams/route.ts
import { EsDbClient } from '@antelligent-app/everyday-cli/server';

export async function POST(request: Request) {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  const { name } = await request.json();
  const team = await db.createTeam(name);
  return Response.json(team);
}
```

### ✅ Server Actions
```typescript
// app/actions.ts
'use server';
import { EsDbClient } from '@antelligent-app/everyday-cli/server';

export async function createUser(formData: FormData) {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  const user = await db.addRecord('main_db', 'users', {
    name: formData.get('name')
  });

  return user;
}
```

---

## Troubleshooting

### Issue: "Module not found" after upgrade

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# If using npm link, rebuild the package
cd /path/to/everyday-cli
npm run build

# Restart dev server
npm run dev
```

### Issue: Types not updating in IDE

**Solution:**
```bash
# Restart TypeScript server in VS Code
# CMD/CTRL + Shift + P → "TypeScript: Restart TS Server"

# Or close and reopen your editor
```

### Issue: Still getting webpack errors

**Solution:**
1. Verify you're on v2.0.1:
   ```bash
   npm list @antelligent-app/everyday-cli
   ```

2. Check your imports are correct:
   - Server: `@antelligent-app/everyday-cli/server`
   - Client: `@antelligent-app/everyday-cli/client`

3. Clear all caches:
   ```bash
   rm -rf .next node_modules/.cache
   ```

### Issue: Build works but types are wrong

**Solution:**
Make sure you're importing from the correct path:

```typescript
// ❌ Wrong - don't use base import in Next.js
import { EsDbClient } from '@antelligent-app/everyday-cli';

// ✅ Correct - use environment-specific imports
import { EsDbClient } from '@antelligent-app/everyday-cli/server';  // Server
import { EsDbClient } from '@antelligent-app/everyday-cli/client';  // Client
```

---

## What You DON'T Need to Do

❌ **Change any import statements** - They remain exactly the same
❌ **Modify environment variables** - No changes to .env files
❌ **Update Next.js configuration** - No next.config.js changes needed
❌ **Change your code logic** - API is 100% compatible
❌ **Update TypeScript config** - Your tsconfig.json stays the same
❌ **Re-link the package** - If using npm link, just rebuild

---

## Expected Improvements After Upgrade

After upgrading to v2.0.1, you should notice:

✅ **Faster Builds** - No unnecessary Node.js code in browser bundles
✅ **Smaller Bundle Size** - Client bundle is pure browser code now
✅ **No Webpack Errors** - `node:assert` errors completely gone
✅ **Turbopack Works** - No need for `--webpack` flag workaround
✅ **Better Tree-Shaking** - Improved dead code elimination
✅ **Cleaner Dev Experience** - No build warnings or errors

---

## Breaking Changes

**None!** v2.0.1 is a drop-in replacement for v2.0.0.

All changes are internal to the build system. Your application code, imports, and API usage remain completely unchanged.

---

## Summary

### Migration Steps:
1. ✅ Update package: `npm update @antelligent-app/everyday-cli`
2. ✅ Clear cache: `rm -rf .next`
3. ✅ Test: `npm run dev`
4. ✅ Done! No code changes needed.

### What Changed:
- Internal build system improvements
- Client bundle no longer includes Node.js dependencies
- Better webpack/Vite/Turbopack compatibility

### What Stayed the Same:
- All import paths
- All API methods
- All types and interfaces
- All configuration
- All examples still work exactly as documented

---

## Need Help?

If you encounter any issues during migration:

1. Check the [BUILD_SYSTEM_FIXES.md](./BUILD_SYSTEM_FIXES.md) for technical details
2. Verify your imports match the examples above
3. Clear all caches (`rm -rf .next node_modules/.cache`)
4. Ensure you're on v2.0.1: `npm list @antelligent-app/everyday-cli`

The v2.0.1 update is purely a bug fix release with zero breaking changes. Your existing Next.js application should work immediately after updating! 🚀
