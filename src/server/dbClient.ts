/**
 * EsDbClient - Server Implementation
 *
 * Uses node-appwrite SDK for server-side database operations with API key authentication
 */

import { Client, Databases, Users, Query, Storage } from 'node-appwrite';
import { EsDbClientBase, DEFAULT_PROVIDER_URL } from '../shared/base';
import { EsID, type EsPermissionString, type EsQueryString } from '../helpers';
import type {
  EsRecord,
  EsRecordSet,
  EsAccount,
  EsAccountSet,
  EsAsset,
  EsAssetSet,
  EsQueryConfig
} from '../types';

/**
 * Server-side configuration (requires API key)
 */
export interface EsDbClientConfigServer {
  endpoint?: string;
  projectId: string;
  apiKey: string;  // Required for admin operations
}

/**
 * Server-side EsDbClient implementation
 * Provides full admin access using API key authentication
 */
export class EsDbClient extends EsDbClientBase {
  private client: Client;
  private databases: Databases;
  private users: Users;
  private storage: Storage;

  constructor(config: EsDbClientConfigServer) {
    super(config);

    const endpoint = config.endpoint || DEFAULT_PROVIDER_URL;

    this.client = new Client()
      .setEndpoint(endpoint)
      .setProject(config.projectId)
      .setKey(config.apiKey);

    this.databases = new Databases(this.client);
    this.users = new Users(this.client);
    this.storage = new Storage(this.client);
  }

  // ==================== RECORD OPERATIONS ====================

  async addRecord(
    storeId: string,
    tableId: string,
    payload: Record<string, any>,
    recordId?: string,
    permissions?: EsPermissionString[]
  ): Promise<EsRecord> {
    try {
      const doc = await this.databases.createDocument(
        storeId,
        tableId,
        recordId || EsID.unique(),
        payload,
        permissions
      );
      return this.mapRecord(doc);
    } catch (error) {
      throw new Error(`Failed to add record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchRecord(
    storeId: string,
    tableId: string,
    recordId: string
  ): Promise<EsRecord> {
    try {
      const doc = await this.databases.getDocument(storeId, tableId, recordId);
      return this.mapRecord(doc);
    } catch (error) {
      throw new Error(`Failed to fetch record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async modifyRecord(
    storeId: string,
    tableId: string,
    recordId: string,
    payload: Record<string, any>,
    permissions?: EsPermissionString[]
  ): Promise<EsRecord> {
    try {
      const doc = await this.databases.updateDocument(
        storeId,
        tableId,
        recordId,
        payload,
        permissions
      );
      return this.mapRecord(doc);
    } catch (error) {
      throw new Error(`Failed to modify record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeRecord(
    storeId: string,
    tableId: string,
    recordId: string
  ): Promise<boolean> {
    try {
      await this.databases.deleteDocument(storeId, tableId, recordId);
      return true;
    } catch (error) {
      throw new Error(`Failed to remove record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchRecords(
    storeId: string,
    tableId: string,
    config?: EsQueryConfig
  ): Promise<EsRecordSet> {
    try {
      const queries = this.buildQuerySet(config);
      const response = await this.databases.listDocuments(
        storeId,
        tableId,
        queries
      );

      return {
        count: response.total,
        items: response.documents.map(doc => this.mapRecord(doc))
      };
    } catch (error) {
      throw new Error(`Failed to fetch records: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchRecordsWithQueries(
    storeId: string,
    tableId: string,
    queries: EsQueryString[]
  ): Promise<EsRecordSet> {
    try {
      const response = await this.databases.listDocuments(
        storeId,
        tableId,
        queries
      );

      return {
        count: response.total,
        items: response.documents.map(doc => this.mapRecord(doc))
      };
    } catch (error) {
      throw new Error(`Failed to fetch records with queries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchRecords(
    storeId: string,
    tableId: string,
    rules: { key: string; condition: string; match: any }[],
    maxResults?: number,
    skipCount?: number
  ): Promise<EsRecordSet> {
    try {
      const queries = rules.map(r => this.buildFilterRule(r));

      if (maxResults) queries.push(Query.limit(maxResults));
      if (skipCount) queries.push(Query.offset(skipCount));

      const response = await this.databases.listDocuments(
        storeId,
        tableId,
        queries
      );

      return {
        count: response.total,
        items: response.documents.map(doc => this.mapRecord(doc))
      };
    } catch (error) {
      throw new Error(`Failed to search records: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== ACCOUNT OPERATIONS (Admin Only) ====================

  /**
   * Register a new account (Admin operation)
   * @param emailAddress - Account email
   * @param credential - Account credential
   * @param displayName - Account display name
   */
  async registerAccount(emailAddress: string, credential: string, displayName?: string): Promise<EsAccount> {
    try {
      const user = await this.users.create(EsID.unique(), emailAddress, undefined, credential, displayName);
      return this.mapAccount(user);
    } catch (error) {
      throw new Error(`Failed to register account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve an account by identifier (Admin operation)
   * @param accountId - Account identifier
   */
  async fetchAccount(accountId: string): Promise<EsAccount> {
    try {
      const user = await this.users.get(accountId);
      return this.mapAccount(user);
    } catch (error) {
      throw new Error(`Failed to fetch account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Modify an account (Admin operation)
   * @param accountId - Account identifier
   * @param changes - Account changes (emailAddress, displayName, credential)
   */
  async modifyAccount(
    accountId: string,
    changes: { emailAddress?: string; displayName?: string; credential?: string }
  ): Promise<EsAccount> {
    try {
      let user;
      if (changes.emailAddress) {
        user = await this.users.updateEmail(accountId, changes.emailAddress);
      }
      if (changes.displayName) {
        user = await this.users.updateName(accountId, changes.displayName);
      }
      if (changes.credential) {
        user = await this.users.updatePassword(accountId, changes.credential);
      }

      // Get fresh account data
      user = await this.users.get(accountId);
      return this.mapAccount(user);
    } catch (error) {
      throw new Error(`Failed to modify account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove an account (Admin operation)
   * @param accountId - Account identifier
   */
  async removeAccount(accountId: string): Promise<boolean> {
    try {
      await this.users.delete(accountId);
      return true;
    } catch (error) {
      throw new Error(`Failed to remove account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve all accounts (Admin operation)
   * @param maxResults - Maximum number of results
   * @param skipCount - Number of results to skip
   */
  async fetchAccounts(maxResults?: number, skipCount?: number): Promise<EsAccountSet> {
    try {
      const queries = [];
      if (maxResults) queries.push(Query.limit(maxResults));
      if (skipCount) queries.push(Query.offset(skipCount));

      const response = await this.users.list(queries);
      return {
        count: response.total,
        items: response.users.map(user => this.mapAccount(user))
      };
    } catch (error) {
      throw new Error(`Failed to fetch accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== ASSET STORAGE OPERATIONS ====================

  async storeAsset(
    containerId: string,
    resource: File | Blob,
    assetId?: string
  ): Promise<EsAsset> {
    try {
      const uploadedFile = await this.storage.createFile(
        containerId,
        assetId || EsID.unique(),
        resource as any
      );
      return this.mapAsset(uploadedFile);
    } catch (error) {
      throw new Error(`Failed to store asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchAsset(containerId: string, assetId: string): Promise<EsAsset> {
    try {
      const file = await this.storage.getFile(containerId, assetId);
      return this.mapAsset(file);
    } catch (error) {
      throw new Error(`Failed to fetch asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getAssetRetrievalUrl(containerId: string, assetId: string): string {
    return `${this.endpoint}/storage/buckets/${containerId}/files/${assetId}/download?project=${this.projectId}`;
  }

  getAssetPreviewUrl(containerId: string, assetId: string): string {
    return `${this.endpoint}/storage/buckets/${containerId}/files/${assetId}/view?project=${this.projectId}`;
  }

  async removeAsset(containerId: string, assetId: string): Promise<boolean> {
    try {
      await this.storage.deleteFile(containerId, assetId);
      return true;
    } catch (error) {
      throw new Error(`Failed to remove asset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchAssets(containerId: string, maxResults?: number, skipCount?: number): Promise<EsAssetSet> {
    try {
      const queries = [];
      if (maxResults) queries.push(Query.limit(maxResults));
      if (skipCount) queries.push(Query.offset(skipCount));

      const response = await this.storage.listFiles(containerId, queries);
      return {
        count: response.total,
        items: response.files.map(file => this.mapAsset(file))
      };
    } catch (error) {
      throw new Error(`Failed to fetch assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private buildQuerySet(config?: EsQueryConfig): string[] {
    const queries: string[] = [];

    if (!config) return queries;

    if (config.maxResults) queries.push(Query.limit(config.maxResults));
    if (config.skipCount) queries.push(Query.offset(config.skipCount));

    if (config.sortBy) {
      config.sortBy.forEach(sort => {
        if (sort.order === 'descending') {
          queries.push(Query.orderDesc(sort.key));
        } else {
          queries.push(Query.orderAsc(sort.key));
        }
      });
    }

    if (config.rules) {
      config.rules.forEach(rule => {
        queries.push(this.buildFilterRule(rule));
      });
    }

    return queries;
  }

  private buildFilterRule(rule: { key: string; condition: string; match: any }): string {
    const { key, condition, match } = rule;

    switch (condition) {
      case 'equals':
        return Query.equal(key, match);
      case 'notEquals':
        return Query.notEqual(key, match);
      case 'below':
        return Query.lessThan(key, match);
      case 'belowOrEquals':
        return Query.lessThanEqual(key, match);
      case 'above':
        return Query.greaterThan(key, match);
      case 'aboveOrEquals':
        return Query.greaterThanEqual(key, match);
      case 'contains':
        return Query.search(key, match);
      case 'isEmpty':
        return Query.isNull(key);
      case 'isNotEmpty':
        return Query.isNotNull(key);
      case 'inRange':
        return Query.between(key, match[0], match[1]);
      case 'beginsWith':
        return Query.startsWith(key, match);
      case 'endsWith':
        return Query.endsWith(key, match);
      default:
        return Query.equal(key, match);
    }
  }
}
