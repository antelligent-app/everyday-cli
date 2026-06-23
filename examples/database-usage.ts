import { EsDbClient } from '../src/dbClient';

/**
 * Example usage of EsDbClient with completely custom API
 *
 * Security Benefits:
 * - No Appwrite terminology in public API
 * - Custom method names (addRecord, fetchRecord, etc.)
 * - Custom parameter names (storeId, tableId, payload, etc.)
 * - Custom field names (uid, emailAddress, displayName, etc.)
 * - Impossible to identify underlying technology
 */

async function main() {
  // Initialize client
  const db = new EsDbClient({
    projectId: 'your-project-id',
    apiKey: 'your-api-key',
    // endpoint: 'https://provider.everydayseries.ai' // Optional
  });

  // ==================== RECORDS EXAMPLE ====================
  console.log('--- Record Operations ---');

  // Add a new record
  const newRecord = await db.addRecord(
    'myStoreId',
    'myTableId',
    {
      title: 'Hello World',
      content: 'This is my first record',
      views: 0,
      published: true
    }
  );
  console.log('Added record:', newRecord.uid);

  // Fetch a record
  const record = await db.fetchRecord('myStoreId', 'myTableId', newRecord.uid);
  console.log('Retrieved record:', record.payload);

  // Modify a record
  const modified = await db.modifyRecord(
    'myStoreId',
    'myTableId',
    newRecord.uid,
    { views: 100 }
  );
  console.log('Modified record views:', modified.payload.views);

  // Fetch multiple records with filtering and sorting
  const records = await db.fetchRecords('myStoreId', 'myTableId', {
    maxResults: 10,
    skipCount: 0,
    sortBy: [
      { key: 'views', order: 'descending' }
    ],
    rules: [
      { key: 'views', condition: 'above', match: 50 },
      { key: 'published', condition: 'equals', match: true }
    ]
  });
  console.log(`Found ${records.count} records`);

  // Advanced search
  const searchResults = await db.searchRecords(
    'myStoreId',
    'myTableId',
    [
      { key: 'title', condition: 'contains', match: 'Hello' },
      { key: 'views', condition: 'aboveOrEquals', match: 10 }
    ],
    20,  // maxResults
    0    // skipCount
  );
  console.log('Search results:', searchResults.items.length);

  // Remove a record
  await db.removeRecord('myStoreId', 'myTableId', newRecord.uid);
  console.log('Record removed');

  // ==================== ACCOUNTS EXAMPLE ====================
  console.log('\n--- Account Operations ---');

  // Register an account
  const account = await db.registerAccount(
    'user@example.com',
    'SecurePassword123',
    'John Doe'
  );
  console.log('Registered account:', account.uid);

  // Fetch account details
  const accountDetails = await db.fetchAccount(account.uid);
  console.log('Account email:', accountDetails.emailAddress);
  console.log('Display name:', accountDetails.displayName);
  console.log('Email confirmed:', accountDetails.emailConfirmed);

  // Modify account
  const modifiedAccount = await db.modifyAccount(account.uid, {
    displayName: 'Jane Doe',
    emailAddress: 'jane@example.com'
  });
  console.log('Modified account name:', modifiedAccount.displayName);

  // Fetch all accounts
  const accounts = await db.fetchAccounts(10, 0);
  console.log(`Total accounts: ${accounts.count}`);

  // Remove account
  await db.removeAccount(account.uid);
  console.log('Account removed');

  // ==================== ASSET STORAGE EXAMPLE ====================
  console.log('\n--- Asset Storage Operations ---');

  // Note: In real usage, you'd get resource from form upload or filesystem
  // const resourceBlob = new Blob(['Hello asset content'], { type: 'text/plain' });

  // Store asset
  // const storedAsset = await db.storeAsset('myContainerId', resourceBlob);
  // console.log('Stored asset:', storedAsset.uid);

  // Fetch asset metadata
  // const asset = await db.fetchAsset('myContainerId', storedAsset.uid);
  // console.log('Asset filename:', asset.filename, 'Size:', asset.byteSize);

  // Get asset URLs
  const retrievalUrl = db.getAssetRetrievalUrl('myContainerId', 'asset-id');
  const previewUrl = db.getAssetPreviewUrl('myContainerId', 'asset-id');
  console.log('Retrieval URL:', retrievalUrl);
  console.log('Preview URL:', previewUrl);

  // Fetch all assets
  // const assets = await db.fetchAssets('myContainerId', 10, 0);
  // console.log(`Total assets: ${assets.count}`);

  // Remove asset
  // await db.removeAsset('myContainerId', storedAsset.uid);
  // console.log('Asset removed');
}

// Run example (commented out to prevent accidental execution)
// main().catch(console.error);

/**
 * COMPLETE API ABSTRACTION:
 *
 * Original Appwrite Terms → Custom Terms Used Here:
 * ================================================
 * - createDocument() → addRecord()
 * - getDocument() → fetchRecord()
 * - updateDocument() → modifyRecord()
 * - deleteDocument() → removeRecord()
 * - listDocuments() → fetchRecords()
 *
 * - databaseId → storeId
 * - collectionId → tableId
 * - documentId → recordId
 * - data → payload
 *
 * - createUser() → registerAccount()
 * - getUser() → fetchAccount()
 * - updateUser() → modifyAccount()
 * - deleteUser() → removeAccount()
 * - listUsers() → fetchAccounts()
 *
 * - userId → accountId
 * - email → emailAddress
 * - name → displayName
 * - password → credential
 *
 * - createFile() → storeAsset()
 * - getFile() → fetchAsset()
 * - deleteFile() → removeAsset()
 * - listFiles() → fetchAssets()
 *
 * - bucketId → containerId
 * - fileId → assetId
 * - file → resource
 * - size → byteSize
 * - mimeType → contentType
 *
 * - limit → maxResults
 * - offset → skipCount
 * - field → key
 * - operator → condition
 * - value → match
 * - direction → order
 * - orderBy → sortBy
 * - filters → rules
 *
 * - $id → uid
 * - $createdAt → createdAt
 * - $updatedAt → modifiedAt
 *
 * RESULT: Zero Appwrite references in public API!
 */

export { main as databaseExample };
