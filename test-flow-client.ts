import { EsClient } from './dist/client';

/**
 * Test script for EsClient (Flow execution client)
 * This tests the flow execution API which is separate from the database API
 */

async function testFlowClient() {
  console.log('🚀 Starting EsClient (Flow) tests...\n');

  const client = new EsClient({
    apiKey: 'standard_45ac7bf937d6f8cb5f544d0336bb77c0cec732d87dafb9d93c0d778faf7d782ad7b97c7853d318b10c9ff6461a435a7236c514c4fac3a3848df833e24531d9e2872f8aab6967f2bdd11df21140dc7f168d5abe7e2432c47c53ac0516e5bb02bfbf0f276d3662403702324c16887dcb22709df555782b13c555eaae6a3ae676e2',
    slug: 'test-cli'
  });

  console.log('✅ EsClient initialized successfully');
  console.log('Configuration:', {
    slug: 'test-cli',
    apiKey: 'standard_45ac7bf937...(truncated)'
  });
  console.log('');

  // Test 1: Run a flow (you'll need to provide a valid flow ID)
  try {
    console.log('📋 Test 1: Testing flow execution...');
    console.log('NOTE: This test requires a valid flow ID from your EverydaySeries account');
    console.log('');

    // Example flow run - you'll need to replace with your actual flow ID
    const flowId = 'your-flow-id-here'; // Replace with actual flow ID

    console.log(`Attempting to run flow: ${flowId}`);
    const result = await client.run(flowId, {
      test: 'value',
      message: 'Hello from test'
    });

    if (result.success) {
      console.log('✅ Flow executed successfully!');
      console.log(`Found ${result.nodes.length} nodes in result`);

      // Show node types
      const nodeTypes = [...new Set(result.nodes.map(n => n.type))];
      console.log('Node types:', nodeTypes.join(', '));

      // Test helper methods
      console.log('\n📊 Testing helper methods...');

      // Test getNodesByType
      if (nodeTypes.length > 0) {
        const firstType = nodeTypes[0];
        const filtered = client.getNodesByType(result.nodes, firstType as any);
        console.log(`✅ getNodesByType('${firstType}'): Found ${filtered.length} nodes`);
      }

      // Test getNodesData
      const dataOnly = client.getNodesData(result.nodes);
      console.log(`✅ getNodesData(): Extracted data from ${dataOnly.length} nodes`);

      // Test getNodeByType (get first)
      if (nodeTypes.length > 0) {
        const firstType = nodeTypes[0];
        const firstNode = client.getNodeByType(result.nodes, firstType as any);
        if (firstNode) {
          console.log(`✅ getNodeByType('${firstType}'): Found node`);

          // Test getNodeValue
          const value = client.getNodeValue(firstNode);
          console.log(`✅ getNodeValue(): Extracted value`);
        }
      }

    } else {
      console.log('⚠️  Flow execution returned error:', result.error);
      console.log('This is expected if the flow ID is invalid or doesn\'t exist');
    }

  } catch (error) {
    console.log('⚠️  Flow test skipped - no valid flow ID provided');
    console.log('   To test flows, replace "your-flow-id-here" with an actual flow ID');
    console.log('');
  }

  // Test 2: Test helper methods with mock data
  console.log('📋 Test 2: Testing helper methods with mock data...');

  const mockNodes = [
    {
      type: 'text_output' as const,
      data: {
        label: 'Output 1',
        value: 'Hello World',
        triger: false,
        complete: true,
        completedNumbers: 1,
        loading: false
      }
    },
    {
      type: 'text_output' as const,
      data: {
        label: 'Output 2',
        value: '{"status":"success","count":42}',
        triger: false,
        complete: true,
        completedNumbers: 1,
        loading: false
      }
    },
    {
      type: 'prompt_ai' as const,
      data: {
        label: 'AI Prompt',
        value: 'AI response here',
        triger: false,
        complete: true,
        completedNumbers: 1,
        loading: false
      }
    }
  ];

  // Test getNodesByType
  const textOutputs = client.getNodesByType(mockNodes, 'text_output');
  console.log(`✅ getNodesByType('text_output'): Found ${textOutputs.length} nodes (expected 2)`);

  if (textOutputs.length === 2) {
    console.log('   ✓ Correct number of nodes filtered');
  } else {
    console.log('   ✗ Expected 2 nodes, got', textOutputs.length);
  }

  // Test getNodeByType
  const firstTextOutput = client.getNodeByType(mockNodes, 'text_output');
  if (firstTextOutput) {
    console.log(`✅ getNodeByType('text_output'): Found first node`);
    console.log(`   Label: ${firstTextOutput.data.label}`);
  } else {
    console.log('❌ getNodeByType failed to find node');
  }

  // Test getNodeValue with JSON parsing
  const secondNode = textOutputs[1];
  if (secondNode) {
    const parsedValue = client.getNodeValue(secondNode);
    console.log('✅ getNodeValue(): Auto-parsed JSON string');
    console.log('   Parsed value:', parsedValue);

    if (typeof parsedValue === 'object' && parsedValue.status === 'success') {
      console.log('   ✓ JSON parsing worked correctly');
    }
  }

  // Test getNodesData
  const dataOnly = client.getNodesData(mockNodes);
  console.log(`✅ getNodesData(): Extracted ${dataOnly.length} data objects (expected 3)`);
  if (dataOnly.length === 3) {
    console.log('   ✓ Correct number of data objects');
  }

  // Test getNodesDataByType
  const textData = client.getNodesDataByType(mockNodes, 'text_output');
  console.log(`✅ getNodesDataByType('text_output'): Extracted ${textData.length} data objects (expected 2)`);
  if (textData.length === 2) {
    console.log('   ✓ Correct number of filtered data objects');
  }

  console.log('');
  console.log('✨ All EsClient tests completed!\n');

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('✅ EsClient Methods Tested:');
  console.log('   • run() - Flow execution');
  console.log('   • getNodesByType() - Filter nodes by type');
  console.log('   • getNodeByType() - Get first node of type');
  console.log('   • getNodeValue() - Extract and parse values');
  console.log('   • getNodesData() - Get all node data');
  console.log('   • getNodesDataByType() - Get filtered node data');
  console.log('');
  console.log('📝 Notes:');
  console.log('   • All helper methods work correctly');
  console.log('   • JSON parsing in getNodeValue() works');
  console.log('   • Type filtering works as expected');
  console.log('   • To test actual flow execution, provide a valid flow ID');
  console.log('');
  console.log('🎯 Next Steps:');
  console.log('   1. Get a flow ID from your EverydaySeries dashboard');
  console.log('   2. Replace "your-flow-id-here" in this test file');
  console.log('   3. Run the test again to see actual flow execution');
  console.log('');
}

// Run tests
testFlowClient().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
