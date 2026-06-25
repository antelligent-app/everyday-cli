# Next.js Dual Environment Support Strategy

## 🎯 Goal
Enable `@antelligent-app/everyday-cli` to work seamlessly in **both** Next.js environments:
- **Server-side**: Server Components, API Routes, Server Actions (using `node-appwrite`)
- **Client-side**: Client Components, Browser (using `appwrite` web SDK)

---

## 📊 Key Differences: Server vs Client SDKs

| Feature | **node-appwrite** (Server) | **appwrite** (Browser) |
|---------|---------------------------|------------------------|
| **Package** | `node-appwrite` | `appwrite` |
| **Environment** | Node.js only | Browser (+ SSR with cookies) |
| **Authentication** | API Key (admin access) | Session-based (user context) |
| **Operations** | Full admin CRUD, bypass permissions | User-scoped CRUD within permissions |
| **Security** | API key MUST stay server-side | No secrets exposed |
| **Use Cases** | Admin ops, bulk operations, user management | User interactions, file uploads, real-time |
| **Rate Limiting** | Bypasses with API key | Subject to limits |
| **Additional Features** | Users service, admin operations | Account service, OAuth, real-time subscriptions |

---

## ✅ Recommended Pattern: Explicit Dual-Export

### Why This Approach?
1. ✅ **Clear intent** - Developer explicitly states environment
2. ✅ **Bundle optimization** - Only one SDK bundled per environment
3. ✅ **Type safety** - Different types for server vs client configs
4. ✅ **Better DX** - Autocomplete shows environment-specific methods
5. ✅ **Prevents errors** - Can't accidentally use wrong SDK
6. ✅ **Follows Next.js patterns** - Aligns with server/client component model

### Usage Example

```typescript
// ✅ Server Component or API Route
import { EsDbClient } from '@antelligent-app/everyday-cli/server';

const db = new EsDbClient({
  projectId: process.env.APPWRITE_PROJECT_ID,
  apiKey: process.env.APPWRITE_API_KEY  // Admin key - server only!
});

// ✅ Client Component
'use client';
import { EsDbClient } from '@antelligent-app/everyday-cli/client';

const db = new EsDbClient({
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
  // No API key - uses user session
});

await db.login('user@example.com', 'password');
```

---

## 🏗️ Implementation Architecture

### Directory Structure

```
src/
├── index.ts              # Main export (for backwards compatibility)
├── types.ts              # Shared type definitions
├── helpers/              # Work in BOTH environments
│   ├── index.ts
│   ├── query.ts         # EsQuery (universal)
│   ├── permission.ts    # EsPermission (universal)
│   ├── role.ts         # EsRole (universal)
│   └── id.ts           # EsID (universal)
├── shared/
│   └── base.ts         # Abstract base classes
├── server/              # Node.js environment
│   ├── index.ts        # Export EsDbClient + helpers
│   ├── dbClient.ts     # Implementation using node-appwrite
│   └── types.ts        # Server-specific types
└── client/              # Browser environment
    ├── index.ts        # Export EsDbClient + helpers
    ├── dbClient.ts     # Implementation using appwrite web SDK
    ├── auth.ts         # Authentication helpers
    └── types.ts        # Client-specific types
```

### Package.json Exports

```json
{
  "name": "@antelligent-app/everyday-cli",
  "version": "2.0.0",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./server": {
      "types": "./dist/server/index.d.ts",
      "node": {
        "import": "./dist/server/index.mjs",
        "require": "./dist/server/index.js"
      }
    },
    "./client": {
      "types": "./dist/client/index.d.ts",
      "browser": {
        "import": "./dist/client/index.mjs",
        "require": "./dist/client/index.js"
      }
    }
  },
  "dependencies": {
    "node-appwrite": "^26.2.0",
    "appwrite": "^16.0.0"
  }
}
```

---

## 🔒 Security Considerations

### Server-Side Rules
```typescript
// ✅ GOOD - API key stays server-side
// app/api/admin/route.ts
import { EsDbClient } from '@antelligent-app/everyday-cli/server';

export async function POST() {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!  // ✅ Server-side only
  });
  return Response.json(await db.addRecord(...));
}
```

```typescript
// ❌ BAD - Never use API key in client components!
'use client';
import { EsDbClient } from '@antelligent-app/everyday-cli/server';  // ❌ Wrong import!

const db = new EsDbClient({
  apiKey: 'exposed-key'  // ❌ SECURITY RISK!
});
```

### Client-Side Rules
```typescript
// ✅ GOOD - Session-based auth
'use client';
import { EsDbClient } from '@antelligent-app/everyday-cli/client';

const db = new EsDbClient({
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!  // ✅ Public var
});

await db.login(email, password);  // ✅ Session authentication
const record = await db.addRecord(...);  // ✅ Scoped to user permissions
```

---

## 💻 Implementation Details

### Abstract Base Class

```typescript
// src/shared/base.ts
export abstract class EsDbClientBase {
  protected endpoint: string;
  protected projectId: string;

  constructor(config: EsDbClientConfigBase) {
    this.endpoint = config.endpoint || DEFAULT_PROVIDER_URL;
    this.projectId = config.projectId;
  }

  // Abstract methods - must be implemented by server/client
  abstract addRecord(
    storeId: string,
    tableId: string,
    payload: Record<string, any>,
    recordId?: string,
    permissions?: EsPermissionString[]
  ): Promise<EsRecord>;

  abstract fetchRecord(
    storeId: string,
    tableId: string,
    recordId: string
  ): Promise<EsRecord>;

  // ... other CRUD methods
}
```

### Server Implementation

```typescript
// src/server/dbClient.ts
import { Client, Databases, Users, Storage } from 'node-appwrite';
import { EsDbClientBase } from '../shared/base';

export class EsDbClient extends EsDbClientBase {
  private client: Client;
  private databases: Databases;
  private users: Users;  // ✅ Admin-only Users service
  private storage: Storage;

  constructor(config: EsDbClientConfigServer) {
    super(config);

    this.client = new Client()
      .setEndpoint(this.endpoint)
      .setProject(this.projectId)
      .setKey(config.apiKey);  // ✅ API key for admin access

    this.databases = new Databases(this.client);
    this.users = new Users(this.client);
    this.storage = new Storage(this.client);
  }

  async addRecord(
    storeId: string,
    tableId: string,
    payload: Record<string, any>,
    recordId?: string,
    permissions?: EsPermissionString[]
  ): Promise<EsRecord> {
    const doc = await this.databases.createDocument(
      storeId,
      tableId,
      recordId || EsID.unique(),
      payload,
      permissions
    );
    return this.mapRecord(doc);
  }

  // ✅ Admin operations (not available in client SDK)
  async registerAccount(emailAddress: string, credential: string, displayName?: string): Promise<EsAccount> {
    const user = await this.users.create(EsID.unique(), emailAddress, undefined, credential, displayName);
    return this.mapAccount(user);
  }

  async fetchAccounts(maxResults?: number, skipCount?: number): Promise<EsAccountSet> {
    const queries = [];
    if (maxResults) queries.push(Query.limit(maxResults));
    if (skipCount) queries.push(Query.offset(skipCount));
    const response = await this.users.list(queries);
    return {
      count: response.total,
      items: response.users.map(user => this.mapAccount(user))
    };
  }
}
```

### Client Implementation

```typescript
// src/client/dbClient.ts
import { Client, Databases, Account, Storage } from 'appwrite';
import { EsDbClientBase } from '../shared/base';

export class EsDbClient extends EsDbClientBase {
  private client: Client;
  private databases: Databases;
  private account: Account;  // ✅ Account service for authentication
  private storage: Storage;

  constructor(config: EsDbClientConfigBrowser) {
    super(config);

    this.client = new Client()
      .setEndpoint(this.endpoint)
      .setProject(this.projectId);
    // ✅ No API key - uses session authentication

    this.databases = new Databases(this.client);
    this.account = new Account(this.client);
    this.storage = new Storage(this.client);
  }

  async addRecord(
    storeId: string,
    tableId: string,
    payload: Record<string, any>,
    recordId?: string,
    permissions?: EsPermissionString[]
  ): Promise<EsRecord> {
    const doc = await this.databases.createDocument(
      storeId,
      tableId,
      recordId || EsID.unique(),
      payload,
      permissions
    );
    return this.mapRecord(doc);
  }

  // ✅ Authentication methods (only in client SDK)
  async login(email: string, password: string): Promise<EsAccount> {
    await this.account.createEmailSession(email, password);
    const user = await this.account.get();
    return this.mapAccount(user);
  }

  async loginWithProvider(
    provider: 'google' | 'github' | 'apple' | 'microsoft'
  ): Promise<void> {
    await this.account.createOAuth2Session(
      provider,
      window.location.origin + '/auth/callback',
      window.location.origin + '/auth/error'
    );
  }

  async logout(): Promise<boolean> {
    await this.account.deleteSession('current');
    return true;
  }

  async getCurrentUser(): Promise<EsAccount | null> {
    try {
      const user = await this.account.get();
      return this.mapAccount(user);
    } catch {
      return null;
    }
  }

  async signup(email: string, password: string, name: string): Promise<EsAccount> {
    await this.account.create(EsID.unique(), email, password, name);
    return await this.login(email, password);
  }

  // ❌ Admin operations NOT available (require API key)
  // - registerAccount() - use signup() instead
  // - fetchAccounts() - not available
  // - modifyAccount() - use account.updateName(), etc.
  // - removeAccount() - not available
}
```

### Configuration Types

```typescript
// src/server/types.ts
export interface EsDbClientConfigServer {
  projectId: string;
  apiKey: string;        // ✅ Required for admin operations
  endpoint?: string;
}

// src/client/types.ts
export interface EsDbClientConfigBrowser {
  projectId: string;
  endpoint?: string;
  // ❌ No apiKey - uses session authentication
}
```

---

## 📦 Build Configuration

### package.json Scripts

```json
{
  "scripts": {
    "clean": "rm -rf dist",
    "build:shared": "tsc -p tsconfig.shared.json",
    "build:server": "tsc -p tsconfig.server.json",
    "build:client": "tsc -p tsconfig.client.json",
    "build": "npm run clean && npm run build:shared && npm run build:server && npm run build:client",
    "dev:server": "tsc -p tsconfig.server.json --watch",
    "dev:client": "tsc -p tsconfig.client.json --watch"
  }
}
```

### TypeScript Configurations

```json
// tsconfig.shared.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist/shared"
  },
  "include": ["src/shared/**/*", "src/helpers/**/*", "src/types.ts"]
}

// tsconfig.server.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist/server",
    "types": ["node"]
  },
  "include": ["src/server/**/*", "src/shared/**/*"]
}

// tsconfig.client.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist/client",
    "lib": ["ES2020", "DOM"],
    "types": ["node"]
  },
  "include": ["src/client/**/*", "src/shared/**/*"]
}
```

---

## 🧪 Testing Strategy

```typescript
// test/server.test.ts
import { EsDbClient } from '../src/server';

describe('Server Client', () => {
  it('should require API key', () => {
    expect(() => new EsDbClient({ projectId: 'test' })).toThrow();
  });

  it('should have admin operations', () => {
    const db = new EsDbClient({ projectId: 'test', apiKey: 'key' });
    expect(db.registerAccount).toBeDefined();
    expect(db.fetchAccounts).toBeDefined();
  });
});

// test/client.test.ts
import { EsDbClient } from '../src/client';

describe('Client', () => {
  it('should not require API key', () => {
    expect(() => new EsDbClient({ projectId: 'test' })).not.toThrow();
  });

  it('should have authentication methods', () => {
    const db = new EsDbClient({ projectId: 'test' });
    expect(db.login).toBeDefined();
    expect(db.logout).toBeDefined();
    expect(db.signup).toBeDefined();
    expect(db.getCurrentUser).toBeDefined();
  });

  it('should NOT have admin operations', () => {
    const db = new EsDbClient({ projectId: 'test' });
    expect((db as any).registerAccount).toBeUndefined();
    expect((db as any).fetchAccounts).toBeUndefined();
  });
});
```

---

## 📚 Usage Examples

### Example 1: Next.js Server Component

```typescript
// app/dashboard/page.tsx
import { EsDbClient, EsQuery } from '@antelligent-app/everyday-cli/server';

export default async function DashboardPage() {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  // Fetch data server-side with admin privileges
  const posts = await db.fetchRecordsWithQueries('main_db', 'posts', [
    EsQuery.equal('status', 'published'),
    EsQuery.orderDesc('createdAt'),
    EsQuery.limit(10)
  ]);

  return (
    <div>
      <h1>Latest Posts</h1>
      {posts.items.map(post => (
        <article key={post.uid}>{post.payload.title}</article>
      ))}
    </div>
  );
}
```

### Example 2: Next.js API Route

```typescript
// app/api/posts/route.ts
import { EsDbClient, EsPermission, EsRole } from '@antelligent-app/everyday-cli/server';

export async function POST(request: Request) {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  const body = await request.json();

  // Admin operation - bypass permissions
  const post = await db.addRecord(
    'main_db',
    'posts',
    {
      title: body.title,
      content: body.content,
      status: 'draft'
    },
    undefined,
    [
      EsPermission.read(EsRole.any()),
      EsPermission.write(EsRole.user(body.authorId))
    ]
  );

  return Response.json(post);
}
```

### Example 3: Next.js Client Component

```typescript
// app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { EsDbClient, EsQuery } from '@antelligent-app/everyday-cli/client';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const db = new EsDbClient({
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  });

  useEffect(() => {
    async function loadUserData() {
      // Check if user is logged in
      const currentUser = await db.getCurrentUser();
      if (!currentUser) {
        window.location.href = '/login';
        return;
      }
      setUser(currentUser);

      // Fetch user's posts (scoped to their permissions)
      const userPosts = await db.fetchRecordsWithQueries('main_db', 'posts', [
        EsQuery.equal('authorId', currentUser.uid),
        EsQuery.orderDesc('createdAt')
      ]);
      setPosts(userPosts.items);
    }

    loadUserData();
  }, []);

  return (
    <div>
      <h1>My Profile</h1>
      {user && <p>Email: {user.emailAddress}</p>}
      <h2>My Posts</h2>
      {posts.map(post => (
        <article key={post.uid}>{post.payload.title}</article>
      ))}
    </div>
  );
}
```

### Example 4: Authentication Flow

```typescript
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { EsDbClient } from '@antelligent-app/everyday-cli/client';

export default function LoginPage() {
  const [error, setError] = useState('');

  const db = new EsDbClient({
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  });

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await db.login(
        formData.get('email') as string,
        formData.get('password') as string
      );
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Invalid credentials');
    }
  }

  async function handleOAuthLogin(provider: 'google' | 'github') {
    try {
      await db.loginWithProvider(provider);
      // Will redirect to OAuth provider
    } catch (err) {
      setError('OAuth login failed');
    }
  }

  return (
    <div>
      <h1>Login</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleLogin}>
        <input type="email" name="email" required />
        <input type="password" name="password" required />
        <button type="submit">Login</button>
      </form>

      <button onClick={() => handleOAuthLogin('google')}>
        Login with Google
      </button>
      <button onClick={() => handleOAuthLogin('github')}>
        Login with GitHub
      </button>
    </div>
  );
}
```

### Example 5: Hybrid Pattern

```typescript
// app/admin/users/page.tsx
'use client';

import { useState } from 'react';
import { EsDbClient } from '@antelligent-app/everyday-cli/client';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  const db = new EsDbClient({
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  });

  async function createUser(email: string, password: string) {
    // Call server API for admin operation
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const newUser = await response.json();
      setUsers([...users, newUser]);
    }
  }

  return <div>Admin User Management</div>;
}

// app/api/admin/users/route.ts
import { EsDbClient } from '@antelligent-app/everyday-cli/server';

export async function POST(request: Request) {
  // Validate admin session here...

  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  const { email, password } = await request.json();

  // Admin operation - create user account
  const user = await db.registerAccount(email, password);

  return Response.json(user);
}
```

---

## 🔄 Migration Guide (v1.x → v2.x)

### Breaking Changes

**Before (v1.x):**
```typescript
import { EsDbClient } from '@antelligent-app/everyday-cli';

const db = new EsDbClient({
  projectId: 'xxx',
  apiKey: 'yyy'
});
```

**After (v2.x):**
```typescript
// Server-side
import { EsDbClient } from '@antelligent-app/everyday-cli/server';

// Client-side
import { EsDbClient } from '@antelligent-app/everyday-cli/client';
```

### Migration Steps

1. **Update imports** - Add `/server` for all server-side code
2. **Add web SDK** - Install if using client-side features
3. **Update configs** - Client config doesn't need `apiKey`
4. **Add authentication** - Client-side requires login flow

---

## 📈 Implementation Phases

### Phase 1: Core Dual-Export (MVP)
- [x] Research dual-environment patterns
- [ ] Install `appwrite` web SDK
- [ ] Create `/server` and `/client` directory structure
- [ ] Implement abstract base class
- [ ] Create server implementation (existing code)
- [ ] Create client implementation with auth methods
- [ ] Set up conditional exports in package.json
- [ ] Update build scripts
- [ ] Basic testing

### Phase 2: Enhanced Features
- [ ] Add real-time subscriptions for client SDK
- [ ] Create React hooks (`useEsQuery`, `useEsAuth`)
- [ ] Enhanced error handling
- [ ] Comprehensive documentation
- [ ] Migration guide for v1.x users
- [ ] Example projects

### Phase 3: Advanced
- [ ] SSR session management utilities
- [ ] Next.js middleware helpers
- [ ] Advanced caching strategies
- [ ] Developer tools and debugging
- [ ] Performance monitoring

---

## 🎯 Summary

**Recommended Pattern:** Explicit Dual-Export (`/server` and `/client` subpaths)

**Key Benefits:**
1. ✅ Works seamlessly in Next.js server and client components
2. ✅ Type-safe with environment-specific configurations
3. ✅ Optimal bundle sizes (only one SDK per environment)
4. ✅ Clear security boundaries (API key vs session auth)
5. ✅ Maintainable abstraction layer
6. ✅ Future-proof architecture

**Security:**
- Server SDK = API key auth (admin operations)
- Client SDK = Session auth (user-scoped operations)
- Never expose API keys to browser

**Next Steps:**
1. Install `appwrite` package
2. Create client implementation
3. Update build process
4. Update documentation
5. Publish v2.0.0

---

**References:**
- [Appwrite Web SDK Docs](https://appwrite.io/docs/sdks#client)
- [node-appwrite Docs](https://appwrite.io/docs/sdks#server)
- [Next.js Package Exports](https://nextjs.org/docs/app/building-your-application/optimizing/package-bundling)
- [TypeScript Conditional Exports](https://www.typescriptlang.org/docs/handbook/modules/reference.html#conditional-exports)
