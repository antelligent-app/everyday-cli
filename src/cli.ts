#!/usr/bin/env node

import { EsClient } from './client';
import type { NodeType } from './types';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
EverydaySeries CLI

Usage:
  everyday-cli <flow-id> [options]

Options:
  --api-key, -k <key>     API key for authentication (required)
  --value, -v <json>      JSON value to pass to the flow (default: {})
  --slug, -s <slug>       Slug for the flow execution
  --node-type, -n <type>  Filter nodes by type (e.g., text_output)
  --help, -h              Show this help message

Examples:
  everyday-cli _0wgVv2QELuPy3R17-ctn -k es-xxx -v '{"q":"software"}'
  everyday-cli flowId -k es-xxx -n text_output
    `);
    process.exit(0);
  }

  const flowId = args[0];
  let apiKey = '';
  let value: Record<string, string> = {};
  let slug = 'cli-request';
  let nodeType = '';

  // Parse arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if ((arg === '--api-key' || arg === '-k') && i + 1 < args.length) {
      apiKey = args[++i];
    } else if ((arg === '--value' || arg === '-v') && i + 1 < args.length) {
      try {
        const parsed = JSON.parse(args[++i]);
        // Convert all values to strings
        value = Object.entries(parsed).reduce((acc, [key, val]) => {
          acc[key] = String(val);
          return acc;
        }, {} as Record<string, string>);
      } catch (error) {
        console.error('Error: Invalid JSON for --value');
        process.exit(1);
      }
    } else if ((arg === '--slug' || arg === '-s') && i + 1 < args.length) {
      slug = args[++i];
    } else if ((arg === '--node-type' || arg === '-n') && i + 1 < args.length) {
      nodeType = args[++i];
    }
  }

  // Check for API key in environment if not provided
  if (!apiKey) {
    apiKey = process.env.EVERYDAY_API_KEY || '';
  }

  if (!apiKey) {
    console.error('Error: API key is required. Use --api-key or set EVERYDAY_API_KEY environment variable');
    process.exit(1);
  }

  // Initialize client
  const client = new EsClient({ apiKey, slug });

  // Run the flow
  const result = await client.run(flowId, value);

  if (!result.success) {
    console.error('Error:', result.error);
    process.exit(1);
  }

  // Filter nodes if nodeType is specified
  let output = result.nodes;
  if (nodeType) {
    output = client.getNodesByType(result.nodes, nodeType as NodeType);

    // If filtering for a single output type, extract the value
    if (output.length === 1) {
      const nodeValue = client.getNodeValue(output[0]);
      console.log(JSON.stringify(nodeValue, null, 2));
      process.exit(0);
    }
  }

  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
