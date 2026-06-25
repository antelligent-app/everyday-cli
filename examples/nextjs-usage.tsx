/**
 * Next.js Usage Examples
 *
 * Demonstrates how to use @antelligent-app/everyday-cli in both
 * server and client components in a Next.js application
 */

// ==================== SERVER-SIDE EXAMPLES ====================

// Example 1: Server Component
// File: app/posts/page.tsx
import { EsDbClient, EsQuery, EsPermission, EsRole } from '@antelligent-app/everyday-cli/server';

export default async function PostsPage() {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!  // ✅ Safe on server
  });

  // Fetch posts with admin privileges
  const posts = await db.fetchRecordsWithQueries('main_db', 'posts', [
    EsQuery.equal('status', 'published'),
    EsQuery.orderDesc('createdAt'),
    EsQuery.limit(10)
  ]);

  return (
    <div>
      <h1>Latest Posts</h1>
      {posts.items.map(post => (
        <article key={post.uid}>
          <h2>{post.payload.title}</h2>
          <p>{post.payload.content}</p>
        </article>
      ))}
    </div>
  );
}

// Example 2: API Route (Admin Operation)
// File: app/api/posts/route.ts
import { EsDbClient, EsPermission, EsRole, EsID } from '@antelligent-app/everyday-cli/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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
      authorId: body.authorId,
      status: 'draft',
      createdAt: new Date().toISOString()
    },
    EsID.unique(),
    [
      EsPermission.read(EsRole.any()),           // Public can read
      EsPermission.write(EsRole.user(body.authorId)),  // Author can write
      EsPermission.delete(EsRole.user(body.authorId))  // Author can delete
    ]
  );

  return NextResponse.json(post);
}

// Example 3: Server Action
// File: app/actions.ts
'use server';

import { EsDbClient } from '@antelligent-app/everyday-cli/server';

export async function createPost(formData: FormData) {
  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  const post = await db.addRecord(
    'main_db',
    'posts',
    {
      title: formData.get('title'),
      content: formData.get('content')
    }
  );

  return { success: true, postId: post.uid };
}

// ==================== CLIENT-SIDE EXAMPLES ====================

// Example 4: Client Component with Authentication
// File: app/login/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { EsDbClient } from '@antelligent-app/everyday-cli/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [error, setError] = useState('');
  const router = useRouter();

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
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  }

  async function handleOAuthLogin(provider: 'google' | 'github') {
    try {
      await db.loginWithProvider(provider);
      // Will redirect to OAuth provider
    } catch (err) {
      setError(`${provider} login failed`);
    }
  }

  return (
    <div>
      <h1>Login</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleLogin}>
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>

      <div>
        <button onClick={() => handleOAuthLogin('google')}>
          Login with Google
        </button>
        <button onClick={() => handleOAuthLogin('github')}>
          Login with GitHub
        </button>
      </div>
    </div>
  );
}

// Example 5: Client Component - User Profile
// File: app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { EsDbClient, EsQuery } from '@antelligent-app/everyday-cli/client';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const db = new EsDbClient({
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  });

  useEffect(() => {
    async function loadUserData() {
      try {
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
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  async function handleLogout() {
    await db.logout();
    window.location.href = '/login';
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>My Profile</h1>
      {user && (
        <div>
          <p>Email: {user.emailAddress}</p>
          <p>Name: {user.displayName}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}

      <h2>My Posts</h2>
      {posts.map(post => (
        <article key={post.uid}>
          <h3>{post.payload.title}</h3>
          <p>{post.payload.content}</p>
        </article>
      ))}
    </div>
  );
}

// Example 6: Client Component - Create Post
// File: app/create-post/page.tsx
'use client';

import { useState } from 'react';
import { EsDbClient, EsPermission, EsRole, EsID } from '@antelligent-app/everyday-cli/client';

export default function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const db = new EsDbClient({
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Get current user
      const user = await db.getCurrentUser();
      if (!user) {
        alert('Please login first');
        return;
      }

      // Create post with user-scoped permissions
      const post = await db.addRecord(
        'main_db',
        'posts',
        {
          title,
          content,
          authorId: user.uid,
          status: 'published',
          createdAt: new Date().toISOString()
        },
        EsID.unique(),
        [
          EsPermission.read(EsRole.any()),              // Anyone can read
          EsPermission.write(EsRole.user(user.uid)),    // Only author can edit
          EsPermission.delete(EsRole.user(user.uid))    // Only author can delete
        ]
      );

      alert('Post created successfully!');
      window.location.href = `/posts/${post.uid}`;
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1>Create New Post</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}

// ==================== HYBRID PATTERN ====================

// Example 7: Client Component calling Server API for admin ops
// File: app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { EsDbClient } from '@antelligent-app/everyday-cli/client';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  const db = new EsDbClient({
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  });

  useEffect(() => {
    // Verify admin user is logged in
    async function checkAdmin() {
      const currentUser = await db.getCurrentUser();
      if (!currentUser) {
        window.location.href = '/login';
      }
    }
    checkAdmin();
  }, []);

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

  return (
    <div>
      <h1>User Management (Admin)</h1>
      {/* Admin UI here */}
    </div>
  );
}

// Corresponding Server API Route
// File: app/api/admin/users/route.ts
import { EsDbClient } from '@antelligent-app/everyday-cli/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // TODO: Validate admin session here

  const db = new EsDbClient({
    projectId: process.env.APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY!
  });

  const { email, password } = await request.json();

  // Admin operation - create user account
  const user = await db.registerAccount(email, password);

  return NextResponse.json(user);
}
