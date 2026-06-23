/**
 * Schema Type Definitions
 *
 * These types define the structure of the schema.json file that users will create
 * to define their database schema. This is similar to Prisma's schema.prisma file.
 */

/**
 * Root schema definition - the entire schema.json file structure
 */
export interface SchemaDefinition {
  $schema: string;
  version: string;
  database: DatabaseConfig;
  collections: CollectionDefinition[];
  buckets?: BucketDefinition[];
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  id: string;
  name: string;
  enabled?: boolean;
}

/**
 * Collection (table) definition
 */
export interface CollectionDefinition {
  id: string;
  name: string;
  enabled?: boolean;
  documentSecurity?: boolean;
  permissions?: string[];
  attributes: AttributeDefinition[];
  indexes?: IndexDefinition[];
}

/**
 * Attribute (field/column) definition
 */
export interface AttributeDefinition {
  key: string;
  type: AttributeType;
  required: boolean;
  array?: boolean;
  size?: number;
  min?: number;
  max?: number;
  default?: any;
  elements?: string[];
  relatedCollection?: string;
  relationType?: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany';
  twoWay?: boolean;
  twoWayKey?: string;
  onDelete?: 'cascade' | 'restrict' | 'setNull';
}

/**
 * Supported attribute types
 */
export type AttributeType =
  | 'string'
  | 'email'
  | 'url'
  | 'ip'
  | 'integer'
  | 'float'
  | 'boolean'
  | 'datetime'
  | 'enum'
  | 'relationship';

/**
 * Index definition for optimizing queries
 */
export interface IndexDefinition {
  key: string;
  type: 'key' | 'unique' | 'fulltext';
  attributes: string[];
  orders?: ('ASC' | 'DESC')[];
}

/**
 * Bucket (storage container) definition
 */
export interface BucketDefinition {
  id: string;
  name: string;
  enabled?: boolean;
  maximumFileSize?: number;
  allowedFileExtensions?: string[];
  compression?: 'none' | 'gzip' | 'zstd';
  encryption?: boolean;
  antivirus?: boolean;
  permissions?: string[];
}

/**
 * Schema validation result
 */
export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
  warnings: SchemaValidationWarning[];
}

/**
 * Schema validation error
 */
export interface SchemaValidationError {
  path: string;
  message: string;
  code: string;
}

/**
 * Schema validation warning
 */
export interface SchemaValidationWarning {
  path: string;
  message: string;
  code: string;
}

/**
 * Schema diff result - shows changes between two schemas
 */
export interface SchemaDiff {
  hasChanges: boolean;
  database?: DatabaseDiff;
  collections: CollectionDiff[];
  buckets: BucketDiff[];
}

/**
 * Database-level changes
 */
export interface DatabaseDiff {
  type: 'created' | 'modified' | 'deleted' | 'unchanged';
  changes?: {
    name?: { old: string; new: string };
    enabled?: { old: boolean; new: boolean };
  };
}

/**
 * Collection-level changes
 */
export interface CollectionDiff {
  id: string;
  name: string;
  type: 'created' | 'modified' | 'deleted' | 'unchanged';
  attributeChanges?: AttributeDiff[];
  indexChanges?: IndexDiff[];
  permissionChanges?: PermissionDiff[];
}

/**
 * Attribute-level changes
 */
export interface AttributeDiff {
  key: string;
  type: 'created' | 'modified' | 'deleted' | 'unchanged';
  changes?: Partial<AttributeDefinition>;
}

/**
 * Index-level changes
 */
export interface IndexDiff {
  key: string;
  type: 'created' | 'deleted' | 'unchanged';
  definition?: IndexDefinition;
}

/**
 * Permission-level changes
 */
export interface PermissionDiff {
  type: 'added' | 'removed';
  permission: string;
}

/**
 * Bucket-level changes
 */
export interface BucketDiff {
  id: string;
  name: string;
  type: 'created' | 'modified' | 'deleted' | 'unchanged';
  changes?: Partial<BucketDefinition>;
}

/**
 * Schema push result - what happened when applying schema
 */
export interface SchemaPushResult {
  success: boolean;
  operations: SchemaOperation[];
  errors: string[];
}

/**
 * Individual schema operation performed
 */
export interface SchemaOperation {
  type: 'create' | 'update' | 'delete';
  resource: 'database' | 'collection' | 'attribute' | 'index' | 'bucket';
  resourceId: string;
  status: 'success' | 'failed' | 'skipped';
  message?: string;
  error?: string;
}

/**
 * Schema pull result - what was fetched from remote
 */
export interface SchemaPullResult {
  success: boolean;
  schema: SchemaDefinition;
  conflicts?: SchemaConflict[];
}

/**
 * Schema conflict when pulling
 */
export interface SchemaConflict {
  path: string;
  local: any;
  remote: any;
  resolution?: 'keep-local' | 'use-remote' | 'manual';
}

/**
 * Generated TypeScript types configuration
 */
export interface TypeGenerationConfig {
  outputPath: string;
  includeJSDocs?: boolean;
  includeHelpers?: boolean;
  exportMode?: 'named' | 'default' | 'both';
}

/**
 * Schema file metadata
 */
export interface SchemaMetadata {
  version: string;
  lastModified: string;
  lastPushed?: string;
  lastPulled?: string;
  remoteHash?: string;
}
