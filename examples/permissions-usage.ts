/**
 * Examples: Using Permissions and Roles with EsDbClient
 */

import { EsDbClient, EsPermission, EsRole, EsQuery, EsID } from '../src/index';

// Initialize client
const db = new EsDbClient({
  projectId: process.env.EVERYDAY_PROJECT_ID!,
  apiKey: process.env.EVERYDAY_API_KEY!
});

async function permissionsExamples() {
  console.log('📋 Permission & Role Examples\n');

  // ==================== EXAMPLE 1: Public Read, Owner Write ====================
  console.log('Example 1: Public Read, Owner Write');

  const userId = 'user123';

  const publicPost = await db.addRecord(
    'blog_db',
    'posts',
    {
      title: 'My Public Blog Post',
      content: 'This is visible to everyone!',
      authorId: userId
    },
    EsID.unique(),
    [
      EsPermission.read(EsRole.any()),           // Anyone can read
      EsPermission.write(EsRole.user(userId)),   // Only author can write
      EsPermission.delete(EsRole.user(userId))   // Only author can delete
    ]
  );

  console.log('✓ Created public post:', publicPost.uid);
  console.log('  Permissions:', publicPost.accessRules);
  console.log('');

  // ==================== EXAMPLE 2: Private Document ====================
  console.log('Example 2: Private Document (Owner Only)');

  const privateDoc = await db.addRecord(
    'docs_db',
    'documents',
    {
      title: 'Private Notes',
      content: 'Only I can see this'
    },
    EsID.unique(),
    [
      EsPermission.read(EsRole.user(userId)),    // Only owner can read
      EsPermission.write(EsRole.user(userId)),   // Only owner can write
      EsPermission.update(EsRole.user(userId)),  // Only owner can update
      EsPermission.delete(EsRole.user(userId))   // Only owner can delete
    ]
  );

  console.log('✓ Created private document:', privateDoc.uid);
  console.log('');

  // ==================== EXAMPLE 3: Team Collaboration ====================
  console.log('Example 3: Team Collaboration');

  const teamId = 'team_developers';

  const teamDoc = await db.addRecord(
    'workspace_db',
    'projects',
    {
      name: 'New Project',
      description: 'Team collaboration document'
    },
    EsID.unique(),
    [
      EsPermission.read(EsRole.team(teamId)),       // Team can read
      EsPermission.write(EsRole.team(teamId)),      // Team can write
      EsPermission.update(EsRole.team(teamId)),     // Team can update
      EsPermission.delete(EsRole.user(userId))      // Only creator can delete
    ]
  );

  console.log('✓ Created team document:', teamDoc.uid);
  console.log('');

  // ==================== EXAMPLE 4: Update Permissions ====================
  console.log('Example 4: Update Permissions on Existing Document');

  const updated = await db.modifyRecord(
    'blog_db',
    'posts',
    publicPost.uid,
    {
      title: 'Updated Title'
    },
    [
      EsPermission.read(EsRole.any()),              // Keep public read
      EsPermission.write(EsRole.user(userId)),      // Keep owner write
      EsPermission.update(EsRole.users())           // Now any authenticated user can update
    ]
  );

  console.log('✓ Updated document with new permissions');
  console.log('');

  // ==================== EXAMPLE 5: Using Queries ====================
  console.log('Example 5: Advanced Queries');

  const results = await db.fetchRecordsWithQueries(
    'blog_db',
    'posts',
    [
      EsQuery.equal('authorId', userId),
      EsQuery.greaterThan('views', 100),
      EsQuery.orderDesc('createdAt'),
      EsQuery.limit(10)
    ]
  );

  console.log(`✓ Found ${results.count} posts with >100 views`);
  console.log('');

  // ==================== EXAMPLE 6: Complex Query with Multiple Conditions ====================
  console.log('Example 6: Complex Query');

  const complexQuery = await db.fetchRecordsWithQueries(
    'blog_db',
    'posts',
    [
      EsQuery.equal('status', 'published'),
      EsQuery.or([
        EsQuery.equal('category', 'tech'),
        EsQuery.equal('category', 'programming')
      ]),
      EsQuery.between('createdAt', '2024-01-01', '2024-12-31'),
      EsQuery.orderDesc('views'),
      EsQuery.limit(20),
      EsQuery.offset(0)
    ]
  );

  console.log(`✓ Found ${complexQuery.count} matching posts`);
  console.log('');

  // ==================== EXAMPLE 7: Label-based Permissions ====================
  console.log('Example 7: Label-based Permissions');

  const labelDoc = await db.addRecord(
    'docs_db',
    'files',
    {
      name: 'Confidential Report',
      content: 'Top secret data'
    },
    EsID.unique(),
    [
      EsPermission.read(EsRole.label('admin')),        // Only users with 'admin' label
      EsPermission.write(EsRole.label('admin')),       // Only admins can write
      EsPermission.delete(EsRole.label('super_admin')) // Only super admins can delete
    ]
  );

  console.log('✓ Created label-restricted document:', labelDoc.uid);
  console.log('');

  // ==================== EXAMPLE 8: Authenticated Users Only ====================
  console.log('Example 8: Authenticated Users Only');

  const authOnlyDoc = await db.addRecord(
    'forum_db',
    'topics',
    {
      title: 'Members Discussion',
      content: 'Only for logged in users'
    },
    EsID.unique(),
    [
      EsPermission.read(EsRole.users()),    // Any authenticated user can read
      EsPermission.write(EsRole.users()),   // Any authenticated user can write
      EsPermission.delete(EsRole.user(userId)) // Only creator can delete
    ]
  );

  console.log('✓ Created auth-only document:', authOnlyDoc.uid);
  console.log('');
}

// ==================== ALL AVAILABLE ROLE TYPES ====================
function roleTypesReference() {
  console.log('📚 Available Role Types:\n');

  console.log('1. EsRole.any()');
  console.log('   - Public access (anyone, even guests)');
  console.log('');

  console.log('2. EsRole.users()');
  console.log('   - Any authenticated user');
  console.log('');

  console.log('3. EsRole.user(userId)');
  console.log('   - Specific user only');
  console.log('');

  console.log('4. EsRole.team(teamId)');
  console.log('   - Members of a specific team');
  console.log('');

  console.log('5. EsRole.team(teamId, role)');
  console.log('   - Specific role within a team (e.g., "owner", "admin")');
  console.log('');

  console.log('6. EsRole.label(label)');
  console.log('   - Users with a specific label');
  console.log('');
}

// ==================== ALL AVAILABLE PERMISSION TYPES ====================
function permissionTypesReference() {
  console.log('📚 Available Permission Types:\n');

  console.log('EsPermission.read(role)    - View document');
  console.log('EsPermission.write(role)   - Create document');
  console.log('EsPermission.update(role)  - Modify document');
  console.log('EsPermission.delete(role)  - Remove document');
  console.log('');
}

// ==================== QUERY REFERENCE ====================
function queryReference() {
  console.log('📚 Available Query Methods:\n');

  console.log('Comparison:');
  console.log('  EsQuery.equal(attr, value)');
  console.log('  EsQuery.notEqual(attr, value)');
  console.log('  EsQuery.lessThan(attr, value)');
  console.log('  EsQuery.lessThanEqual(attr, value)');
  console.log('  EsQuery.greaterThan(attr, value)');
  console.log('  EsQuery.greaterThanEqual(attr, value)');
  console.log('  EsQuery.between(attr, start, end)');
  console.log('');

  console.log('String:');
  console.log('  EsQuery.search(attr, query)');
  console.log('  EsQuery.startsWith(attr, value)');
  console.log('  EsQuery.endsWith(attr, value)');
  console.log('');

  console.log('Null checks:');
  console.log('  EsQuery.isNull(attr)');
  console.log('  EsQuery.isNotNull(attr)');
  console.log('');

  console.log('Array:');
  console.log('  EsQuery.contains(attr, value)');
  console.log('');

  console.log('Logical:');
  console.log('  EsQuery.or([query1, query2, ...])');
  console.log('  EsQuery.and([query1, query2, ...])');
  console.log('');

  console.log('Ordering:');
  console.log('  EsQuery.orderAsc(attr)');
  console.log('  EsQuery.orderDesc(attr)');
  console.log('  EsQuery.cursorBefore(docId)');
  console.log('  EsQuery.cursorAfter(docId)');
  console.log('');

  console.log('Pagination:');
  console.log('  EsQuery.limit(number)');
  console.log('  EsQuery.offset(number)');
  console.log('');

  console.log('Selection:');
  console.log('  EsQuery.select([attr1, attr2, ...])');
  console.log('');
}

// Run examples
if (require.main === module) {
  console.log('🚀 EverydaySeries Permission & Query Examples\n');
  console.log('='.repeat(50));
  console.log('');

  permissionsExamples()
    .then(() => {
      console.log('='.repeat(50));
      console.log('');
      roleTypesReference();
      console.log('='.repeat(50));
      console.log('');
      permissionTypesReference();
      console.log('='.repeat(50));
      console.log('');
      queryReference();
      console.log('='.repeat(50));
      console.log('');
      console.log('✨ Examples completed!');
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export { permissionsExamples, roleTypesReference, permissionTypesReference, queryReference };
