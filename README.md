# everyday-cli

TypeScript client and CLI for EverydaySeries API - Execute flows, filter nodes, and extract data with full type safety.

## Features

- 🚀 **Simple API** - Run flows with just a flow ID and key-value parameters
- 📦 **Flexible Data Access** - Get full nodes or extract data only
- 🔍 **Type-Safe** - 48 node types with full TypeScript support
- 🛠️ **CLI & Library** - Use as command-line tool or import in your code
- ⚡ **Lightweight** - ~52KB package size
- 🎯 **Helper Methods** - Filter by node type, extract values, parse JSON

## Installation

### From GitHub

```bash
npm install antelligent-app/everyday-cli
# or
npm install github:antelligent-app/everyday-cli
```

### From npm (once published)

```bash
npm install @antelligent-app/everyday-cli
```

## Quick Start

### As a Library

```typescript
import { EsClient } from 'everyday-cli';

// Initialize the client with your API key and slug
const client = new EsClient({
  apiKey: 'es-your-api-key-here',
  slug: 'my-project-slug'
});

// Run a flow (all values must be strings)
const result = await client.run('your-flow-id', {
  email: 'user@example.com',
  content: 'Hello from EverydaySeries!',
  subject: 'Test Email'
});

// Option 1: Access full nodes (with metadata, source, target)
console.log(result.nodes);

// Option 2: Access just the data (cleaner, lighter)
console.log(result.data);

// Filter nodes by type (type-safe with autocomplete)
const textOutputs = client.getNodesByType(result.nodes, 'text_output');

// Get data from specific node types
const textData = client.getNodesDataByType(result.nodes, 'text_output');

// Extract and parse values (auto-parses JSON strings)
const firstOutput = client.getNodeByType(result.nodes, 'text_output');
const value = client.getNodeValue(firstOutput);

console.log(value);
```

### As a CLI

```bash
# Basic usage
everyday-cli <flow-id> -k <api-key> -s <slug> -v '{"key":"value"}'

# Using environment variable
export EVERYDAY_API_KEY=es-your-key
everyday-cli flow-id -s my-slug -v '{"email":"test@example.com"}'

# Filter by node type
everyday-cli flow-id -k es-xxx -s slug -v '{"q":"search"}' -n text_output

# Get help
everyday-cli --help
```

**CLI Options:**
- `-k, --api-key` - API key (or use `EVERYDAY_API_KEY` env var)
- `-s, --slug` - Flow execution slug
- `-v, --value` - JSON key-value pairs (all values converted to strings)
- `-n, --node-type` - Filter output by node type
- `-h, --help` - Show help

## Examples

### Email Flow Example

```typescript
const client = new EsClient({
  apiKey: 'es-your-key',
  slug: 'email-automation'
});

const result = await client.run('email-flow-id', {
  email: 'recipient@example.com',
  subject: 'Automated Email',
  content: 'This email was sent via EverydaySeries!'
});

if (result.success) {
  const outputs = client.getNodesDataByType(result.nodes, 'text_output');
  console.log('Email sent:', outputs);
}
```

### Working with Different Node Types

```typescript
// Get all available node types from result
const nodeTypes = [...new Set(result.nodes.map(n => n.type))];
console.log('Available types:', nodeTypes);

// Filter by multiple types
const aiNodes = [
  ...client.getNodesByType(result.nodes, 'prompt_ai'),
  ...client.getNodesByType(result.nodes, 'tool_ai')
];

// Extract specific data fields
const labels = result.data?.map(d => d.label);
const values = result.data?.map(d => d.value);
```

## API Reference

### EsClient

#### Constructor

```typescript
new EsClient(config: EsClientConfig)
```

**Parameters:**
- `config.apiKey` (required) - Your EverydaySeries API key
- `config.slug` (required) - Slug for flow execution
- `config.baseUrl` (optional) - API base URL (default: `https://app.everydayseries.ai`)

#### Methods

##### `run(id, value)`

Run a flow by ID with a key-value object where all values must be strings.

```typescript
await client.run('flow-id', {
  key1: 'value1',
  key2: 'value2'
});
```

Returns: `Promise<RunFlowResult>`

##### `getNodesByType(nodes, nodeType)`

Filter nodes by type.

```typescript
const textNodes = client.getNodesByType(result.nodes, 'text_output');
```

##### `getNodeByType(nodes, nodeType)`

Get the first node of a specific type.

```typescript
const firstTextNode = client.getNodeByType(result.nodes, 'text_output');
```

##### `getNodeValue(node)`

Extract and parse the value from a node. Automatically parses JSON strings.

```typescript
const value = client.getNodeValue(node);
```

##### `getNodesData(nodes)`

Get only the data from nodes (excludes metadata, source, target, etc.).

```typescript
const allData = client.getNodesData(result.nodes);
```

##### `getNodesDataByType(nodes, nodeType)`

Get data from nodes of a specific type.

```typescript
const textData = client.getNodesDataByType(result.nodes, 'text_output');
```

## Supported Node Types

The package includes TypeScript definitions for 48 node types with full autocomplete support:

**Output Nodes:** `text_output`, `md_output`, `img_output`, `video_output`, `audio_output`, `html_output`

**Input Nodes:** `multi_text_input`, `selection`

**AI Nodes:** `prompt_ai`, `tool_ai`, `replicate_ai`, `image_to_text`, `text_to_image`

**Integration Nodes:** `github`, `gmail`, `notion`, `slack`, `jira`, `airtable`, `ghost_post`

**Data Processing:** `concat`, `json_splitter`, `pass_on`, `csv`, `sql`, `sql_output`

**Analysis:** `language_detection`, `entity_recognition`, `key_phrase_extraction`, `sentiment_analysis`, `pii_entity_recognition`

**Utilities:** `webhook_output`, `email_output`, `timer`, `delay`, `cron`, `api_call`, `python_run`, `read_pdf`, `validation`, `note`, `markdown`

**Advanced:** `super_node`, `integration_output`, `writer_output`, `writer_create`, `okr_output`, `series_symbol`

## TypeScript Types

```typescript
interface EsClientConfig {
  apiKey: string;
  slug: string;
  baseUrl?: string;
}

interface FlowValue {
  [key: string]: string;
}

type NodeType =
  | 'text_output'
  | 'md_output'
  | 'multi_text_input'
  | 'img_output'
  | 'prompt_ai'
  | 'image_to_text'
  | 'text_to_image'
  | 'ghost_post'
  | 'tool_ai'
  | 'webhook_output'
  | 'timer'
  | 'cron'
  | 'delay'
  | 'concat'
  | 'api_call'
  | 'super_node'
  | 'airtable'
  | 'email_output'
  | 'okr_output'
  | 'note'
  | 'read_pdf'
  | 'python_run'
  | 'integration_output'
  | 'validation'
  | 'sql'
  | 'sql_output'
  | 'writer_output'
  | 'writer_create'
  | 'csv'
  | 'selection'
  | 'replicate_ai'
  | 'video_output'
  | 'audio_output'
  | 'html_output'
  | 'markdown'
  | 'pass_on'
  | 'language_detection'
  | 'entity_recognition'
  | 'key_phrase_extraction'
  | 'sentiment_analysis'
  | 'pii_entity_recognition'
  | 'json_splitter'
  | 'series_symbol'
  | 'github'
  | 'gmail'
  | 'notion'
  | 'slack'
  | 'jira';

interface FlowNode {
  type: NodeType;
  data: any;
  [key: string]: any;
}

interface RunFlowResult {
  success: boolean;
  nodes: FlowNode[];        // Full node objects
  data?: FlowNode['data'][]; // Just the data from each node
  error?: string;
}
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run CLI in development mode
npm run dev:cli -- --help

# Run tests
npm test

# Lint the code
npm run lint

# Format the code
npm run format
```

## Publishing to GitHub

1. Build the project:
   ```bash
   npm run build
   ```

2. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Release v1.0.0"
   git push origin main
   ```

3. Create a release tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. Users can now install from GitHub:
   ```bash
   npm install antelligent-app/everyday-cli
   ```

## License

Copyright (c) 2026 Antelligent. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use is strictly prohibited.
