import { EsDbClient } from './dist/dbClient';

/**
 * Test script for EsDbClient with real credentials
 */

async function testDbClient() {
  console.log('🚀 Starting EsDbClient tests...\n');

  const db = new EsDbClient({
    projectId: '6a2f8de9002d21030065',
    apiKey: 'standard_45ac7bf937d6f8cb5f544d0336bb77c0cec732d87dafb9d93c0d778faf7d782ad7b97c7853d318b10c9ff6461a435a7236c514c4fac3a3848df833e24531d9e2872f8aab6967f2bdd11df21140dc7f168d5abe7e2432c47c53ac0516e5bb02bfbf0f276d3662403702324c16887dcb22709df555782b13c555eaae6a3ae676e2'
  });

  try {
    // Test 1: List accounts
    console.log('📋 Test 1: Fetching accounts...');
    const accounts = await db.fetchAccounts(5, 0);
    console.log(`✅ Success! Found ${accounts.count} accounts`);
    if (accounts.items.length > 0) {
      console.log('Sample account:', {
        uid: accounts.items[0].uid,
        emailAddress: accounts.items[0].emailAddress,
        displayName: accounts.items[0].displayName
      });
    }
    console.log('');

  } catch (error) {
    console.error('❌ Test 1 failed:', error instanceof Error ? error.message : error);
    console.log('');
  }

  try {
    // Test 2: Register a new account
    console.log('👤 Test 2: Registering new account...');
    const newAccount = await db.registerAccount(
      `test-${Date.now()}@example.com`,
      'TestPassword123!',
      'Test User'
    );
    console.log(`✅ Success! Created account with uid: ${newAccount.uid}`);
    console.log('Account details:', {
      emailAddress: newAccount.emailAddress,
      displayName: newAccount.displayName,
      isActive: newAccount.isActive
    });
    console.log('');

    // Test 3: Fetch the account we just created
    console.log('🔍 Test 3: Fetching the account we created...');
    const fetchedAccount = await db.fetchAccount(newAccount.uid);
    console.log('✅ Success! Fetched account:', {
      uid: fetchedAccount.uid,
      emailAddress: fetchedAccount.emailAddress,
      displayName: fetchedAccount.displayName
    });
    console.log('');

    // Test 4: Modify the account
    console.log('✏️  Test 4: Modifying account...');
    const modifiedAccount = await db.modifyAccount(newAccount.uid, {
      displayName: 'Modified Test User'
    });
    console.log('✅ Success! Modified account:', {
      uid: modifiedAccount.uid,
      displayName: modifiedAccount.displayName
    });
    console.log('');

    // Test 5: Clean up - remove the test account
    console.log('🗑️  Test 5: Removing test account...');
    await db.removeAccount(newAccount.uid);
    console.log('✅ Success! Account removed');
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : error);
    console.log('');
  }

  console.log('✨ All tests completed!\n');
}

// Run tests
testDbClient().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
