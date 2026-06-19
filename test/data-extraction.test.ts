import { EsClient } from '../src/client';
import type { FlowNode } from '../src/types';

describe('EsClient - Data Extraction', () => {
  let client: EsClient;

  beforeEach(() => {
    client = new EsClient({
      apiKey: 'es-u1tGfg6vXXrnwot8S2Jr1dPMrgvG',
      slug: 'test-51795678'
    });
  });

  it('should return both nodes and data in run result', async () => {
    const result = await client.run('gJspTLbOwsYBsgg2WnkQa', {
      email: 'test@example.com',
      content: 'Test content',
      subject: 'Test subject'
    });

    if (result.success) {
      // Should have nodes array
      expect(result.nodes).toBeDefined();
      expect(Array.isArray(result.nodes)).toBe(true);

      // Should have data array
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);

      // Data array should have same length as nodes
      expect(result.data?.length).toBe(result.nodes.length);

      console.log('Nodes count:', result.nodes.length);
      console.log('Data count:', result.data?.length);
    }
  }, 30000);

  it('should extract data from all nodes', async () => {
    const result = await client.run('gJspTLbOwsYBsgg2WnkQa', {
      email: 'extract@test.com',
      content: 'Data extraction test',
      subject: 'Extract Test'
    });

    if (result.success && result.nodes.length > 0) {
      const extractedData = client.getNodesData(result.nodes);

      expect(extractedData).toBeDefined();
      expect(Array.isArray(extractedData)).toBe(true);
      expect(extractedData.length).toBe(result.nodes.length);

      // Each item should have label property (from node.data)
      extractedData.forEach(data => {
        expect(data).toHaveProperty('label');
      });

      console.log('Extracted data sample:', extractedData[0]);
    }
  }, 30000);

  it('should extract data from specific node types', async () => {
    const result = await client.run('gJspTLbOwsYBsgg2WnkQa', {
      email: 'type-filter@test.com',
      content: 'Type filter test',
      subject: 'Filter by Type'
    });

    if (result.success && result.nodes.length > 0) {
      const textOutputData = client.getNodesDataByType(result.nodes, 'text_output');

      expect(Array.isArray(textOutputData)).toBe(true);

      // Should only contain data from text_output nodes
      textOutputData.forEach(data => {
        expect(data).toHaveProperty('label');
        expect(data).toHaveProperty('value');
      });

      console.log('Text output data count:', textOutputData.length);
      console.log('Text output data:', textOutputData);
    }
  }, 30000);

  it('should compare full nodes vs data only', async () => {
    const mockNodes: FlowNode[] = [
      {
        type: 'text_output',
        icon: 'test-icon',
        data: {
          label: 'Test Node',
          value: 'test value',
          triger: false,
          complete: true,
          completedNumbers: 1,
          loading: false
        },
        metadata: {
          title: 'Test Title',
          description: 'Test Description'
        }
      }
    ];

    const fullNode = mockNodes[0];
    const dataOnly = client.getNodesData(mockNodes)[0];

    // Full node has metadata
    expect(fullNode.metadata).toBeDefined();
    expect(fullNode.type).toBe('text_output');

    // Data only has just the data property
    expect(dataOnly.label).toBe('Test Node');
    expect(dataOnly.value).toBe('test value');

    console.log('Full node keys:', Object.keys(fullNode));
    console.log('Data only keys:', Object.keys(dataOnly));
  });
});
