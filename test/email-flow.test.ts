import { EsClient } from '../src/client';

describe('EsClient - Email Flow Test', () => {
  let client: EsClient;

  beforeEach(() => {
    client = new EsClient({
      apiKey: 'es-u1tGfg6vXXrnwot8S2Jr1dPMrgvG',
      slug: 'test-51795678'
    });
  });

  it('should run email flow successfully', async () => {
    const result = await client.run('gJspTLbOwsYBsgg2WnkQa', {
      email: 'kroy665@gmail.com',
      content: 'This is a test email content',
      subject: 'Test Email Subject'
    });

    expect(result.success).toBe(true);
    expect(result.nodes).toBeDefined();
    expect(Array.isArray(result.nodes)).toBe(true);
  }, 30000); // 30 second timeout for API call

  it('should return nodes from email flow', async () => {
    const result = await client.run('gJspTLbOwsYBsgg2WnkQa', {
      email: 'kroy665@gmail.com',
      content: 'Test content',
      subject: 'Test subject'
    });

    if (result.success) {
      expect(result.nodes.length).toBeGreaterThan(0);

      // Check if nodes have expected structure
      result.nodes.forEach(node => {
        expect(node).toHaveProperty('type');
        expect(node).toHaveProperty('data');
        expect(node.data).toHaveProperty('label');
      });
    }
  }, 30000);

  it('should find text_output node in email flow', async () => {
    const result = await client.run('gJspTLbOwsYBsgg2WnkQa', {
      email: 'developer@example.com',
      content: 'Email body content here',
      subject: 'Important: Test Email'
    });

    if (result.success) {
      const textOutputNodes = client.getNodesByType(result.nodes, 'text_output');
      console.log('Text output nodes found:', textOutputNodes.length);

      if (textOutputNodes.length > 0) {
        const firstNode = textOutputNodes[0];
        console.log('First text_output node data:', firstNode.data);
      }
    }
  }, 30000);

  it('should extract and parse node value', async () => {
    const result = await client.run('gJspTLbOwsYBsgg2WnkQa', {
      email: 'user@test.com',
      content: 'Testing value extraction',
      subject: 'Value Test'
    });

    if (result.success) {
      const textOutputNode = client.getNodeByType(result.nodes, 'text_output');

      if (textOutputNode) {
        const value = client.getNodeValue(textOutputNode);
        console.log('Extracted value:', value);
        expect(value).toBeDefined();
      }
    }
  }, 30000);

  it('should handle all required parameters', async () => {
    const testCases = [
      {
        email: 'admin@company.com',
        content: 'Administrative email content',
        subject: 'Admin Notice'
      },
      {
        email: 'support@service.com',
        content: 'Customer support message',
        subject: 'Support Ticket #12345'
      }
    ];

    for (const testCase of testCases) {
      const result = await client.run('gJspTLbOwsYBsgg2WnkQa', testCase);
      expect(result.success).toBe(true);
      console.log(`Test case for ${testCase.email}:`, result.success ? 'PASS' : 'FAIL');
    }
  }, 60000);

  it('should handle error responses gracefully', async () => {
    // Test with minimal data to see how it handles edge cases
    const result = await client.run('gJspTLbOwsYBsgg2WnkQa', {
      email: '',
      content: '',
      subject: ''
    });

    // Should still return a result (success or failure)
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('nodes');

    if (!result.success) {
      expect(result.error).toBeDefined();
      console.log('Expected error:', result.error);
    }
  }, 30000);
});

describe('EsClient - Helper Methods', () => {
  let client: EsClient;

  beforeEach(() => {
    client = new EsClient({
      apiKey: 'es-u1tGfg6vXXrnwot8S2Jr1dPMrgvG',
      slug: 'test-51795678'
    });
  });

  it('should filter nodes by type correctly', async () => {
    const result = await client.run('gJspTLbOwsYBsgg2WnkQa', {
      email: 'kroy665@gmail.com',
      content: 'Filter test',
      subject: 'Node Filter Test'
    });

    if (result.success && result.nodes.length > 0) {
      const nodeTypes = new Set(result.nodes.map(n => n.type));
      console.log('Available node types:', Array.from(nodeTypes));

      nodeTypes.forEach(type => {
        const filtered = client.getNodesByType(result.nodes, type);
        expect(filtered.length).toBeGreaterThan(0);
        filtered.forEach(node => {
          expect(node.type).toBe(type);
        });
      });
    }
  }, 30000);

  it('should get first node of specific type', async () => {
    const result = await client.run('gJspTLbOwsYBsgg2WnkQa', {
      email: 'kroy665@gmail.com',
      content: 'First node test',
      subject: 'Get First Node'
    });

    if (result.success && result.nodes.length > 0) {
      const firstNode = result.nodes[0];
      const foundNode = client.getNodeByType(result.nodes, firstNode.type);

      expect(foundNode).toBeDefined();
      expect(foundNode?.type).toBe(firstNode.type);
    }
  }, 30000);
});
