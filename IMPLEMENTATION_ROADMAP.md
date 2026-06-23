# Implementation Roadmap: Prisma-Like Schema System

## Project Timeline: 4-6 Weeks

---

## Phase 1: Foundation (Week 1)

### 1.1 Schema Type Definitions
**Files to Create:**
- `src/schema/types.ts` - Core schema interfaces
- `src/schema/validator.ts` - Schema validation logic
- `src/schema/parser.ts` - Parse schema.json files

**What to Build:**
```typescript
// src/schema/types.ts
export interface SchemaDefinition {
  $schema: string;
  version: string;
  database: DatabaseConfig;
  collections: CollectionDefinition[];
  buckets?: BucketDefinition[];
}

export interface CollectionDefinition {
  id: string;
  name: string;
  permissions: string[];
  attributes: AttributeDefinition[];
  indexes?: IndexDefinition[];
}

export interface AttributeDefinition {
  key: string;
  type: 'string' | 'integer' | 'float' | 'boolean' | 'datetime' | 'email' | 'ip' | 'url' | 'enum';
  size?: number;
  required: boolean;
  default?: any;
  array?: boolean;
  elements?: string[];
}
```

**Deliverable:** Type-safe schema definition system

---

### 1.2 Schema Validator
**Files to Create:**
- `src/schema/validator.ts`

**What to Build:**
```typescript
export class SchemaValidator {
  validate(schema: unknown): ValidationResult {
    // Validate schema structure
    // Check required fields
    // Validate attribute types
    // Check for duplicate IDs
    // Validate permission strings
    // Return detailed errors
  }
}
```

**Test Cases:**
- ✓ Valid schema passes
- ✓ Missing required fields fail
- ✓ Invalid attribute types fail
- ✓ Duplicate collection IDs fail
- ✓ Invalid permissions fail

**Deliverable:** Robust schema validation

---

### 1.3 Schema Parser
**Files to Create:**
- `src/schema/parser.ts`

**What to Build:**
```typescript
export class SchemaParser {
  async loadSchema(path: string): Promise<SchemaDefinition> {
    // Read schema.json file
    // Parse JSON
    // Validate structure
    // Return parsed schema
  }

  async saveSchema(path: string, schema: SchemaDefinition): Promise<void> {
    // Validate schema
    // Format JSON nicely
    // Write to file
  }
}
```

**Deliverable:** Schema file I/O operations

---

## Phase 2: CLI Commands (Week 2)

### 2.1 CLI Infrastructure
**Files to Create:**
- `src/cli/index.ts` - CLI entry point
- `src/cli/utils.ts` - Shared utilities
- `bin/cli.js` - Executable

**What to Build:**
```typescript
#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('everyday-cli')
  .description('Database schema management for Appwrite')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize schema file')
  .action(initCommand);

program
  .command('schema push')
  .description('Push schema to Appwrite')
  .action(pushCommand);

program
  .command('schema pull')
  .description('Pull schema from Appwrite')
  .action(pullCommand);

program
  .command('generate')
  .description('Generate TypeScript types')
  .action(generateCommand);

program.parse();
```

**Dependencies to Add:**
- `commander` - CLI framework
- `inquirer` - Interactive prompts
- `chalk` - Colored output
- `ora` - Loading spinners

**Deliverable:** CLI framework with commands

---

### 2.2 Init Command
**Files to Create:**
- `src/cli/commands/init.ts`
- `templates/schema.template.json`

**What to Build:**
```typescript
export async function initCommand() {
  console.log('🚀 Initializing schema...');

  // Check if schema.json already exists
  if (fs.existsSync('appwrite.schema.json')) {
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: 'schema.json already exists. Overwrite?',
      default: false
    }]);

    if (!overwrite) {
      console.log('❌ Aborted');
      return;
    }
  }

  // Copy template
  const template = await fs.readFile(
    path.join(__dirname, '../../../templates/schema.template.json'),
    'utf-8'
  );

  // Write to current directory
  await fs.writeFile('appwrite.schema.json', template);

  console.log('✅ Created appwrite.schema.json');
  console.log('\nNext steps:');
  console.log('  1. Edit appwrite.schema.json');
  console.log('  2. Run: npx everyday-cli schema push');
}
```

**Template Structure:**
```json
{
  "$schema": "@antelligent-app/everyday-cli/schema",
  "version": "1.0.0",
  "database": {
    "id": "main",
    "name": "Main Database"
  },
  "collections": [
    {
      "id": "example",
      "name": "Example Collection",
      "permissions": [
        "create(users)",
        "read(users)",
        "update(users)",
        "delete(users)"
      ],
      "attributes": [
        {
          "key": "title",
          "type": "string",
          "size": 255,
          "required": true
        },
        {
          "key": "description",
          "type": "string",
          "size": 1000,
          "required": false
        }
      ]
    }
  ]
}
```

**Deliverable:** `npx everyday-cli init` creates starter schema

---

### 2.3 Schema Push Command
**Files to Create:**
- `src/cli/commands/push.ts`
- `src/schema/syncer.ts`

**What to Build:**
```typescript
// src/cli/commands/push.ts
export async function pushCommand() {
  const spinner = ora('Loading schema...').start();

  // 1. Load schema
  const parser = new SchemaParser();
  const schema = await parser.loadSchema('appwrite.schema.json');
  spinner.succeed('Schema loaded');

  // 2. Validate schema
  spinner.start('Validating schema...');
  const validator = new SchemaValidator();
  const result = validator.validate(schema);

  if (!result.valid) {
    spinner.fail('Schema validation failed');
    console.error('\nErrors:');
    result.errors.forEach(err => console.error(`  • ${err}`));
    process.exit(1);
  }
  spinner.succeed('Schema validated');

  // 3. Connect to Appwrite
  spinner.start('Connecting to Appwrite...');
  const dbClient = new EsDbClient({
    projectId: process.env.PROJECT_ID!,
    apiKey: process.env.API_KEY!
  });
  spinner.succeed('Connected to Appwrite');

  // 4. Sync schema
  const syncer = new SchemaSyncer(dbClient);
  await syncer.sync(schema, {
    onProgress: (message) => {
      spinner.text = message;
    }
  });

  spinner.succeed('Schema pushed successfully!');
}

// src/schema/syncer.ts
export class SchemaSyncer {
  constructor(private client: any) {}

  async sync(schema: SchemaDefinition, options: SyncOptions) {
    // For each collection
    for (const collection of schema.collections) {
      options.onProgress(`Creating collection: ${collection.name}`);

      // Check if collection exists
      const exists = await this.collectionExists(collection.id);

      if (!exists) {
        // Create collection
        await this.createCollection(collection);
      } else {
        options.onProgress(`Collection ${collection.name} already exists`);
      }

      // Create/update attributes
      for (const attr of collection.attributes) {
        await this.ensureAttribute(collection.id, attr);
      }

      // Create indexes
      if (collection.indexes) {
        for (const index of collection.indexes) {
          await this.ensureIndex(collection.id, index);
        }
      }
    }

    // Handle buckets
    if (schema.buckets) {
      for (const bucket of schema.buckets) {
        await this.ensureBucket(bucket);
      }
    }
  }

  private async createCollection(collection: CollectionDefinition) {
    // Use Appwrite SDK to create collection
    // Map permissions from schema format to Appwrite format
  }

  private async ensureAttribute(collectionId: string, attr: AttributeDefinition) {
    // Check if attribute exists
    // If not, create it
    // Handle different attribute types
  }
}
```

**Deliverable:** `npx everyday-cli schema push` creates entire database

---

## Phase 3: TypeScript Generation (Week 3)

### 3.1 Type Generator
**Files to Create:**
- `src/schema/generator.ts`
- `src/cli/commands/generate.ts`
- `templates/types.template.ts`

**What to Build:**
```typescript
// src/schema/generator.ts
export class TypeScriptGenerator {
  generate(schema: SchemaDefinition): string {
    let output = '';

    // Generate header
    output += this.generateHeader();

    // Generate collection interfaces
    for (const collection of schema.collections) {
      output += this.generateCollectionInterface(collection);
    }

    // Generate schema interface
    output += this.generateSchemaInterface(schema);

    // Generate helper types
    output += this.generateHelperTypes(schema);

    // Generate type-safe client
    output += this.generateTypedClient(schema);

    return output;
  }

  private generateCollectionInterface(collection: CollectionDefinition): string {
    return `
export interface ${this.toPascalCase(collection.id)}Attributes {
  ${collection.attributes.map(attr => {
    const type = this.mapAttributeType(attr);
    const optional = attr.required ? '' : '?';
    return `${attr.key}${optional}: ${type};`;
  }).join('\n  ')}
}
`;
  }

  private generateSchemaInterface(schema: SchemaDefinition): string {
    return `
export interface AppwriteSchema {
  database: {
    id: '${schema.database.id}';
    name: '${schema.database.name}';
  };

  collections: {
    ${schema.collections.map(c => `
    ${c.id}: {
      id: '${c.id}';
      attributes: ${this.toPascalCase(c.id)}Attributes;
    };`).join('')}
  };
}
`;
  }

  private generateTypedClient(schema: SchemaDefinition): string {
    return `
export class TypedEsDbClient {
  constructor(private client: EsDbClient) {}

  async addRecord<T extends CollectionId>(
    collectionId: T,
    data: AppwriteSchema['collections'][T]['attributes']
  ): Promise<EsRecord> {
    return this.client.addRecord(
      '${schema.database.id}',
      collectionId,
      data as any
    );
  }

  async fetchRecord<T extends CollectionId>(
    collectionId: T,
    recordId: string
  ): Promise<EsRecord & { payload: AppwriteSchema['collections'][T]['attributes'] }> {
    return this.client.fetchRecord(
      '${schema.database.id}',
      collectionId,
      recordId
    ) as any;
  }

  // ... more typed methods
}
`;
  }
}

// src/cli/commands/generate.ts
export async function generateCommand() {
  const spinner = ora('Generating types...').start();

  // Load schema
  const parser = new SchemaParser();
  const schema = await parser.loadSchema('appwrite.schema.json');

  // Generate TypeScript
  const generator = new TypeScriptGenerator();
  const typescript = generator.generate(schema);

  // Write to file
  await fs.writeFile('appwrite-schema.d.ts', typescript);

  spinner.succeed('Generated appwrite-schema.d.ts');

  console.log('\nUsage:');
  console.log('  import { TypedEsDbClient } from \'./appwrite-schema\';');
  console.log('  import { EsDbClient } from \'@antelligent-app/everyday-cli\';');
  console.log('');
  console.log('  const client = new EsDbClient({...});');
  console.log('  const db = new TypedEsDbClient(client);');
  console.log('');
  console.log('  // Now you have full type safety!');
}
```

**Deliverable:** Auto-generated TypeScript types with autocomplete

---

## Phase 4: Pull & Diff (Week 4)

### 4.1 Schema Pull Command
**Files to Create:**
- `src/cli/commands/pull.ts`
- `src/schema/introspector.ts`

**What to Build:**
```typescript
export class SchemaIntrospector {
  constructor(private client: any) {}

  async introspect(databaseId: string): Promise<SchemaDefinition> {
    const spinner = ora('Fetching collections...').start();

    // Get all collections
    const collections = await this.getCollections(databaseId);
    spinner.text = `Found ${collections.length} collections`;

    const schema: SchemaDefinition = {
      $schema: '@antelligent-app/everyday-cli/schema',
      version: '1.0.0',
      database: {
        id: databaseId,
        name: 'Imported Database'
      },
      collections: []
    };

    // For each collection
    for (const collection of collections) {
      spinner.text = `Reading ${collection.name}...`;

      const collectionDef: CollectionDefinition = {
        id: collection.$id,
        name: collection.name,
        permissions: this.mapPermissions(collection.$permissions),
        attributes: []
      };

      // Get attributes
      const attributes = await this.getAttributes(databaseId, collection.$id);
      collectionDef.attributes = attributes.map(attr => ({
        key: attr.key,
        type: attr.type,
        size: attr.size,
        required: attr.required,
        array: attr.array
      }));

      // Get indexes
      const indexes = await this.getIndexes(databaseId, collection.$id);
      if (indexes.length > 0) {
        collectionDef.indexes = indexes;
      }

      schema.collections.push(collectionDef);
    }

    spinner.succeed('Schema introspection complete');
    return schema;
  }
}
```

**Deliverable:** `npx everyday-cli schema pull` imports existing schema

---

### 4.2 Schema Diff Command
**Files to Create:**
- `src/cli/commands/diff.ts`
- `src/schema/differ.ts`

**What to Build:**
```typescript
export class SchemaDiffer {
  diff(local: SchemaDefinition, remote: SchemaDefinition): SchemaDiff {
    const diff: SchemaDiff = {
      collectionsAdded: [],
      collectionsRemoved: [],
      collectionsModified: []
    };

    // Compare collections
    for (const localCol of local.collections) {
      const remoteCol = remote.collections.find(c => c.id === localCol.id);

      if (!remoteCol) {
        diff.collectionsAdded.push(localCol);
      } else {
        const changes = this.compareCollections(localCol, remoteCol);
        if (changes.length > 0) {
          diff.collectionsModified.push({
            collection: localCol.id,
            changes
          });
        }
      }
    }

    // Find removed collections
    for (const remoteCol of remote.collections) {
      if (!local.collections.find(c => c.id === remoteCol.id)) {
        diff.collectionsRemoved.push(remoteCol);
      }
    }

    return diff;
  }

  private compareCollections(local: CollectionDefinition, remote: CollectionDefinition) {
    const changes = [];

    // Compare attributes
    for (const attr of local.attributes) {
      const remoteAttr = remote.attributes.find(a => a.key === attr.key);
      if (!remoteAttr) {
        changes.push({ type: 'attribute_added', key: attr.key });
      } else if (JSON.stringify(attr) !== JSON.stringify(remoteAttr)) {
        changes.push({ type: 'attribute_modified', key: attr.key });
      }
    }

    return changes;
  }
}

// Display diff nicely
export function displayDiff(diff: SchemaDiff) {
  console.log('\n📋 Schema Changes:\n');

  if (diff.collectionsAdded.length > 0) {
    console.log(chalk.green('✚ Collections to be created:'));
    diff.collectionsAdded.forEach(c => {
      console.log(chalk.green(`  + ${c.name} (${c.attributes.length} attributes)`));
    });
  }

  if (diff.collectionsRemoved.length > 0) {
    console.log(chalk.red('\n✖ Collections to be deleted:'));
    diff.collectionsRemoved.forEach(c => {
      console.log(chalk.red(`  - ${c.name}`));
    });
  }

  if (diff.collectionsModified.length > 0) {
    console.log(chalk.yellow('\n~ Collections to be modified:'));
    diff.collectionsModified.forEach(m => {
      console.log(chalk.yellow(`  ~ ${m.collection}`));
      m.changes.forEach(change => {
        if (change.type === 'attribute_added') {
          console.log(chalk.green(`      + ${change.key}`));
        } else if (change.type === 'attribute_modified') {
          console.log(chalk.yellow(`      ~ ${change.key}`));
        }
      });
    });
  }
}
```

**Deliverable:** `npx everyday-cli schema diff` shows pending changes

---

## Phase 5: Polish & Documentation (Week 5-6)

### 5.1 Testing
**Test Files to Create:**
- `test/schema/validator.test.ts`
- `test/schema/parser.test.ts`
- `test/schema/syncer.test.ts`
- `test/schema/generator.test.ts`
- `test/cli/commands.test.ts`

**Test Coverage Goals:**
- ✓ Schema validation (all edge cases)
- ✓ Schema parsing
- ✓ Collection creation
- ✓ Attribute creation
- ✓ TypeScript generation
- ✓ CLI commands

---

### 5.2 Documentation
**Docs to Create:**
- `docs/SCHEMA_GUIDE.md` - Complete schema reference
- `docs/CLI_REFERENCE.md` - All CLI commands
- `docs/TYPESCRIPT_GUIDE.md` - Using generated types
- `docs/MIGRATION_GUIDE.md` - Migrating from manual scripts
- `docs/EXAMPLES.md` - Real-world examples

---

### 5.3 Examples
**Example Projects:**
- `examples/basic/` - Simple blog schema
- `examples/saas/` - Multi-tenant SaaS
- `examples/ecommerce/` - E-commerce schema
- `examples/social/` - Social network schema

---

## Dependencies to Add

```json
{
  "dependencies": {
    "node-appwrite": "^26.2.0",
    "commander": "^11.0.0",
    "inquirer": "^9.2.0",
    "chalk": "^5.3.0",
    "ora": "^7.0.0",
    "ajv": "^8.12.0"
  },
  "devDependencies": {
    "typescript": "^6.0.3",
    "jest": "^30.4.2",
    "@types/node": "^25.9.3",
    "@types/inquirer": "^9.0.0"
  }
}
```

---

## Success Criteria

### Week 1
✅ Schema types defined
✅ Validation works
✅ Parser works

### Week 2
✅ `init` command works
✅ `schema push` creates collections
✅ Attributes are created correctly

### Week 3
✅ TypeScript types generated
✅ Autocomplete works
✅ Type-safe client works

### Week 4
✅ `schema pull` imports schema
✅ `schema diff` shows changes
✅ All CLI commands polished

### Week 5-6
✅ Tests written (80%+ coverage)
✅ Documentation complete
✅ Examples created
✅ Ready for production

---

## Final Package.json Scripts

```json
{
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "cli": "node dist/cli/index.js",
    "example:init": "npm run cli init",
    "example:push": "npm run cli schema push",
    "example:generate": "npm run cli generate"
  },
  "bin": {
    "everyday-cli": "./dist/cli/index.js"
  }
}
```

---

## Launch Checklist

Before v2.0.0 release:

- [ ] All commands work
- [ ] Tests pass
- [ ] Documentation complete
- [ ] Examples work
- [ ] README updated
- [ ] CHANGELOG written
- [ ] Video tutorial recorded
- [ ] Blog post written
- [ ] Tweet prepared

---

**Total Timeline:** 4-6 weeks
**MVP Timeline:** 2-3 weeks
**Team:** 1-2 developers

**Let's build this!** 🚀
