/**
 * Test Database Creation - Direct API test
 */

import { Client, Databases } from 'node-appwrite';

async function testDatabaseCreate() {
  console.log('🧪 Testing Direct Database Creation\n');

  const projectId = '6a2f8de9002d21030065';
  const apiKey = 'standard_45ac7bf937d6f8cb5f544d0336bb77c0cec732d87dafb9d93c0d778faf7d782ad7b97c7853d318b10c9ff6461a435a7236c514c4fac3a3848df833e24531d9e2872f8aab6967f2bdd11df21140dc7f168d5abe7e2432c47c53ac0516e5bb02bfbf0f276d3662403702324c16887dcb22709df555782b13c555eaae6a3ae676e2';

  // Test different endpoint variations
  const endpoints = [
    'https://provider.everydayseries.ai',
    'https://provider.everydayseries.ai/v1',
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📍 Testing endpoint: ${endpoint}`);

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const databases = new Databases(client);

    try {
      // First, try to list databases
      console.log('  Listing databases...');
      const list = await databases.list();
      console.log(`  ✓ Success! Found ${list.total} databases`);

      // If no database exists with our ID, try to create it
      const dbExists = list.databases.find((db: any) => db.$id === 'test_db');

      if (dbExists) {
        console.log('  ✓ Database "test_db" already exists');
      } else {
        console.log('  Creating database "test_db"...');
        const newDb = await databases.create('test_db', 'Test Database');
        console.log(`  ✓ Database created! ID: ${newDb.$id}`);
      }

    } catch (error: any) {
      console.log(`  ✗ Failed: ${error.message || error}`);
      if (error.response) {
        console.log(`  Response: ${JSON.stringify(error.response).substring(0, 200)}`);
      }
    }
  }
}

testDatabaseCreate().catch(console.error);
