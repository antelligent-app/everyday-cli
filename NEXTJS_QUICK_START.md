# Next.js Quick Start Guide

Fast setup guide for using @antelligent-app/everyday-cli in Next.js App Router projects.

## 📦 Installation

```bash
npm install @antelligent-app/everyday-cli
```

## ⚙️ Environment Variables

Create `.env.local`:

```bash
# Server-side (API Routes, Server Components, Server Actions)
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key

# Client-side (Client Components)
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
```

## 🚀 Usage Patterns

### Server Components

```typescript
// app/page.tsx
import { EsDbClient } from '@antelligent-app/everyday-cli/server';

export default async function HomePage() {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  const users = await db.fetchRecords('main_db', 'users');

  return (
    <div>
      <h1>Users: {users.count}</h1>
    </div>
  );
}
```

### Client Components

```typescript
// app/components/LoginForm.tsx
'use client';

import { EsDbClient } from '@antelligent-app/everyday-cli/client';
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const db = new EsDbClient({
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      await db.login(email, password);
      alert('Logged in!');
    } catch (error) {
      alert('Login failed');
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### API Routes

```typescript
// app/api/users/route.ts
import { EsDbClient } from '@antelligent-app/everyday-cli/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  const users = await db.fetchRecords('main_db', 'users');
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  const body = await request.json();
  const user = await db.addRecord('main_db', 'users', body);
  return NextResponse.json(user);
}
```

### Server Actions

```typescript
// app/actions.ts
'use server';

import { EsDbClient } from '@antelligent-app/everyday-cli/server';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  const user = await db.addRecord('main_db', 'users', {
    name: formData.get('name') as string,
    email: formData.get('email') as string
  });

  revalidatePath('/users');
  return user;
}
```

```typescript
// app/components/CreateUserForm.tsx
'use client';

import { createUser } from '@/app/actions';

export function CreateUserForm() {
  async function handleSubmit(formData: FormData) {
    await createUser(formData);
  }

  return (
    <form action={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit">Create User</button>
    </form>
  );
}
```

## 🔑 Common Patterns

### Authentication Flow

```typescript
// app/components/AuthProvider.tsx
'use client';

import { EsDbClient } from '@antelligent-app/everyday-cli/client';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const db = new EsDbClient({
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const currentUser = await db.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    const account = await db.login(email, password);
    setUser(account);
    return account;
  };

  const logout = async () => {
    await db.logout();
    setUser(null);
  };

  const signup = async (email: string, password: string, name: string) => {
    const account = await db.signup(email, password, name);
    setUser(account);
    return account;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Protected Route

```typescript
// app/dashboard/page.tsx
import { EsDbClient } from '@antelligent-app/everyday-cli/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  // Check authentication
  try {
    const user = await db.getCurrentUser();
  } catch (error) {
    redirect('/login');
  }

  return <div>Dashboard</div>;
}
```

### Real-time Data with Client Component

```typescript
// app/components/UsersList.tsx
'use client';

import { EsDbClient } from '@antelligent-app/everyday-cli/client';
import { useState, useEffect } from 'react';

export function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const db = new EsDbClient({
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const result = await db.fetchRecords('main_db', 'users');
      setUsers(result.items);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {users.map((user: any) => (
        <li key={user.uid}>
          {user.payload.name} - {user.payload.email}
        </li>
      ))}
    </ul>
  );
}
```

### Teams Management

```typescript
// app/teams/page.tsx
'use client';

import { EsDbClient } from '@antelligent-app/everyday-cli/client';
import { useState, useEffect } from 'react';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);

  const db = new EsDbClient({
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  });

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    const result = await db.listTeams();
    setTeams(result.items);
  }

  async function createTeam(name: string) {
    await db.createTeam(name);
    loadTeams();
  }

  return (
    <div>
      <h1>My Teams</h1>
      {teams.map((team: any) => (
        <div key={team.uid}>
          <h3>{team.name}</h3>
          <p>{team.totalMembers} members</p>
        </div>
      ))}
    </div>
  );
}
```

## 📝 Import Rules

| Location | Import From |
|----------|-------------|
| Server Components | `@antelligent-app/everyday-cli/server` |
| API Routes | `@antelligent-app/everyday-cli/server` |
| Server Actions | `@antelligent-app/everyday-cli/server` |
| Middleware | `@antelligent-app/everyday-cli/server` |
| Client Components | `@antelligent-app/everyday-cli/client` |

## ⚠️ Common Mistakes

### ❌ Wrong: Using client in server context

```typescript
// app/page.tsx (Server Component)
import { EsDbClient } from '@antelligent-app/everyday-cli/client'; // ❌ Wrong!
```

### ✅ Correct: Use server import

```typescript
// app/page.tsx (Server Component)
import { EsDbClient } from '@antelligent-app/everyday-cli/server'; // ✅ Correct
```

### ❌ Wrong: Using API key in client

```typescript
'use client';
import { EsDbClient } from '@antelligent-app/everyday-cli/client';

const db = new EsDbClient({
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  apiKey: process.env.APPWRITE_API_KEY! // ❌ Wrong! Never expose API key
});
```

### ✅ Correct: No API key in client

```typescript
'use client';
import { EsDbClient } from '@antelligent-app/everyday-cli/client';

const db = new EsDbClient({
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID! // ✅ Correct
  // No API key - uses session authentication
});
```

## 🎯 Quick Reference

```typescript
// Helpers (work in both server and client)
import { EsQuery, EsPermission, EsRole, EsID } from '@antelligent-app/everyday-cli/client';
// or
import { EsQuery, EsPermission, EsRole, EsID } from '@antelligent-app/everyday-cli/server';

// Types (work in both server and client)
import type {
  EsRecord,
  EsRecordSet,
  EsAccount,
  EsTeam,
  EsTeamMember
} from '@antelligent-app/everyday-cli/client';
```

## 📚 Full Documentation

- [Complete API Reference](./README.md)
- [Migration from v1.x](./MIGRATION_V2.md)
- [Migration from v2.0.0 to v2.0.1](./MIGRATION_V2.0.0_TO_V2.0.1.md)
- [Teams Usage Examples](./examples/teams-usage.tsx)
- [Next.js Dual Support Strategy](./NEXTJS_DUAL_SUPPORT.md)

## 🆘 Troubleshooting

### Build Error: "Module not found"

```bash
rm -rf .next node_modules/.cache
npm install
npm run dev
```

### TypeScript Errors

```bash
# Restart TypeScript server in VS Code
# CMD/CTRL + Shift + P → "TypeScript: Restart TS Server"
```

### Webpack Error: "node:assert"

Make sure you're on v2.0.1 or later:
```bash
npm list @antelligent-app/everyday-cli
# Should show 2.0.1 or higher
```

---

**That's it!** You're ready to build with @antelligent-app/everyday-cli in Next.js! 🚀

For more examples, see the [examples directory](./examples/) and full [README](./README.md).
