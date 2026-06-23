/**
 * Test Schema Push - Non-interactive test
 */

import { SchemaManager } from './src/schema/manager';
import { readSchema } from './src/schema/parser';
import { validateSchema } from './src/schema/validator';
import chalk from 'chalk';

async function testSchemaPush() {
  console.log(chalk.cyan('🧪 Testing Schema Push\n'));

  const projectId = '6a2f8de9002d21030065';
  const apiKey = 'standard_45ac7bf937d6f8cb5f544d0336bb77c0cec732d87dafb9d93c0d778faf7d782ad7b97c7853d318b10c9ff6461a435a7236c514c4fac3a3848df833e24531d9e2872f8aab6967f2bdd11df21140dc7f168d5abe7e2432c47c53ac0516e5bb02bfbf0f276d3662403702324c16887dcb22709df555782b13c555eaae6a3ae676e2';
  const endpoint = 'https://provider.everydayseries.ai/v1';

  try {
    // Step 1: Read schema
    console.log(chalk.gray('📖 Reading schema...'));
    const schema = readSchema('./test-schema.json');
    console.log(chalk.green(`✓ Schema loaded: ${schema.database.name}`));
    console.log(chalk.gray(`  Collections: ${schema.collections.length}`));
    console.log(chalk.gray(`  Buckets: ${schema.buckets?.length || 0}\n`));

    // Step 2: Validate schema
    console.log(chalk.gray('✓ Validating schema...'));
    const validation = validateSchema(schema);
    if (!validation.valid) {
      console.error(chalk.red('✗ Validation failed:'));
      validation.errors.forEach(err => console.error(chalk.red(`  ${err.path}: ${err.message}`)));
      process.exit(1);
    }
    console.log(chalk.green('✓ Schema valid\n'));

    // Step 3: Push schema
    console.log(chalk.cyan('📤 Pushing schema to Appwrite...\n'));
    const manager = new SchemaManager({ endpoint, projectId, apiKey });

    const result = await manager.push(schema, false);

    // Step 4: Display results
    console.log('');
    if (result.success) {
      console.log(chalk.green.bold('✓ Schema push completed successfully!\n'));
    } else {
      console.log(chalk.red.bold('✗ Schema push completed with errors\n'));
    }

    // Group operations by status
    const success = result.operations.filter(op => op.status === 'success');
    const failed = result.operations.filter(op => op.status === 'failed');
    const skipped = result.operations.filter(op => op.status === 'skipped');

    if (success.length > 0) {
      console.log(chalk.green(`✓ Successful operations: ${success.length}`));
      success.forEach(op => {
        console.log(chalk.gray(`  • ${op.resource}: ${op.resourceId} - ${op.message || 'OK'}`));
      });
      console.log('');
    }

    if (skipped.length > 0) {
      console.log(chalk.yellow(`○ Skipped operations: ${skipped.length}`));
      skipped.forEach(op => {
        console.log(chalk.gray(`  • ${op.resource}: ${op.resourceId} - ${op.message || 'Skipped'}`));
      });
      console.log('');
    }

    if (failed.length > 0) {
      console.log(chalk.red(`✗ Failed operations: ${failed.length}`));
      failed.forEach(op => {
        console.log(chalk.red(`  • ${op.resource}: ${op.resourceId}`));
        console.log(chalk.gray(`    Error: ${op.error}`));
      });
      console.log('');
    }

    if (result.errors.length > 0) {
      console.log(chalk.red('Errors:'));
      result.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
    }

    console.log('');
    console.log(chalk.cyan('📊 Summary:'));
    console.log(chalk.gray(`  Total operations: ${result.operations.length}`));
    console.log(chalk.gray(`  Success: ${success.length}`));
    console.log(chalk.gray(`  Failed: ${failed.length}`));
    console.log(chalk.gray(`  Skipped: ${skipped.length}`));

    process.exit(result.success ? 0 : 1);

  } catch (error) {
    console.error(chalk.red('\n✗ Push failed'));
    console.error(chalk.gray(`  ${error instanceof Error ? error.message : error}`));
    console.error(error);
    process.exit(1);
  }
}

testSchemaPush();
