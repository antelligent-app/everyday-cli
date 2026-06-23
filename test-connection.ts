import { Client, Databases, Users } from 'node-appwrite';

/**
 * Test direct Appwrite connection to diagnose endpoint issues
 */

async function testConnection() {
  console.log('🔍 Testing Appwrite connection...\n');

  const endpoint = 'https://provider.everydayseries.ai/v1';
  const projectId = '6a2f8de9002d21030065';
  const apiKey = 'standard_45ac7bf937d6f8cb5f544d0336bb77c0cec732d87dafb9d93c0d778faf7d782ad7b97c7853d318b10c9ff6461a435a7236c514c4fac3a3848df833e24531d9e2872f8aab6967f2bdd11df21140dc7f168d5abe7e2432c47c53ac0516e5bb02bfbf0f276d3662403702324c16887dcb22709df555782b13c555eaae6a3ae676e2';

  console.log('Configuration:');
  console.log('- Endpoint:', endpoint);
  console.log('- Project ID:', projectId);
  console.log('- API Key:', apiKey.substring(0, 20) + '...');
  console.log('');

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const databases = new Databases(client);
  const users = new Users(client);

  // Test 1: List databases
  try {
    console.log('📊 Test 1: Listing databases...');
    const dbList = await databases.list();
    console.log(`✅ Success! Found ${dbList.total} databases`);
    if (dbList.databases && dbList.databases.length > 0) {
      dbList.databases.forEach((db: any) => {
        console.log(`   - ${db.name} (ID: ${db.$id})`);
      });
    }
    console.log('');
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    console.log('');
  }

  // Test 2: List users
  try {
    console.log('👥 Test 2: Listing users...');
    const userList = await users.list();
    console.log(`✅ Success! Found ${userList.total} users`);
    if (userList.users && userList.users.length > 0) {
      userList.users.slice(0, 3).forEach((user: any) => {
        console.log(`   - ${user.email || 'No email'} (ID: ${user.$id})`);
      });
    }
    console.log('');
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    console.log('');
  }

  console.log('✨ Connection test completed!\n');
}

testConnection().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
