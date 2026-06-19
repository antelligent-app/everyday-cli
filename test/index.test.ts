import { EsClient } from '../src/index';
import type { NodeType } from '../src/types';

describe('Package exports', () => {
  it('should export EsClient class', () => {
    expect(EsClient).toBeDefined();
    expect(typeof EsClient).toBe('function');
  });

  it('should create EsClient instance with config', () => {
    const client = new EsClient({
      apiKey: 'test-key',
      slug: 'test-slug'
    });

    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(EsClient);
  });

  it('should have required methods', () => {
    const client = new EsClient({
      apiKey: 'test-key',
      slug: 'test-slug'
    });

    expect(typeof client.run).toBe('function');
    expect(typeof client.getNodesByType).toBe('function');
    expect(typeof client.getNodeByType).toBe('function');
    expect(typeof client.getNodeValue).toBe('function');
    expect(typeof client.getNodesData).toBe('function');
    expect(typeof client.getNodesDataByType).toBe('function');
  });
});
