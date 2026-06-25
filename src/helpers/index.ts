/**
 * EverydaySeries Database Helpers
 *
 * Universal helper classes that work in both server and client environments
 * These wrap Appwrite primitives while hiding implementation details
 */

// ==================== TYPES ====================

/**
 * Branded type for permissions to ensure type safety
 * Users can only create permissions using EsPermission methods
 */
export type EsPermissionString = string & { readonly __brand: 'EsPermission' };

/**
 * Branded type for roles to ensure type safety
 * Users can only create roles using EsRole methods
 */
export type EsRoleString = string & { readonly __brand: 'EsRole' };

/**
 * Branded type for queries to ensure type safety
 * Users can only create queries using EsQuery methods
 */
export type EsQueryString = string & { readonly __brand: 'EsQuery' };

// ==================== ID HELPER ====================

/**
 * ID generation helper - works in both server and client
 */
export class EsID {
  /**
   * Generate a hex ID based on timestamp
   */
  private static hexTimestamp(): string {
    const now = new Date();
    const sec = Math.floor(now.getTime() / 1000);
    const msec = now.getMilliseconds();
    const hexTimestamp = sec.toString(16) + msec.toString(16).padStart(5, '0');
    return hexTimestamp;
  }

  /**
   * Generate a unique ID
   */
  static unique(padding: number = 7): string {
    const baseId = EsID.hexTimestamp();
    let randomPadding = '';
    for (let i = 0; i < padding; i++) {
      const randomHexDigit = Math.floor(Math.random() * 16).toString(16);
      randomPadding += randomHexDigit;
    }
    return baseId + randomPadding;
  }

  /**
   * Create a custom ID
   */
  static custom(id: string): string {
    return id;
  }
}

// ==================== ROLE HELPER ====================

/**
 * Role helper for defining access control
 * Works identically in both server and client environments
 */
export class EsRole {
  /**
   * Public access (anyone, including guests)
   */
  static any(): EsRoleString {
    return 'any' as EsRoleString;
  }

  /**
   * Any authenticated user
   */
  static users(status: string = ''): EsRoleString {
    return (status ? `users/${status}` : 'users') as EsRoleString;
  }

  /**
   * Specific user by ID
   */
  static user(userId: string, status: string = ''): EsRoleString {
    return (status ? `user:${userId}/${status}` : `user:${userId}`) as EsRoleString;
  }

  /**
   * Guest users (not authenticated)
   */
  static guests(): EsRoleString {
    return 'guests' as EsRoleString;
  }

  /**
   * Team members
   */
  static team(teamId: string, role?: string): EsRoleString {
    return (role ? `team:${teamId}/${role}` : `team:${teamId}`) as EsRoleString;
  }

  /**
   * Specific team member
   */
  static member(memberId: string): EsRoleString {
    return `member:${memberId}` as EsRoleString;
  }

  /**
   * Users with a specific label
   */
  static label(label: string): EsRoleString {
    return `label:${label}` as EsRoleString;
  }
}

// ==================== PERMISSION HELPER ====================

/**
 * Permission helper for document access control
 * Works identically in both server and client environments
 */
export class EsPermission {
  /**
   * Read permission
   */
  static read(role: EsRoleString): EsPermissionString {
    return `read("${role}")` as EsPermissionString;
  }

  /**
   * Create permission
   */
  static create(role: EsRoleString): EsPermissionString {
    return `create("${role}")` as EsPermissionString;
  }

  /**
   * Write permission (alias for create + update)
   */
  static write(role: EsRoleString): EsPermissionString {
    return `write("${role}")` as EsPermissionString;
  }

  /**
   * Update permission
   */
  static update(role: EsRoleString): EsPermissionString {
    return `update("${role}")` as EsPermissionString;
  }

  /**
   * Delete permission
   */
  static delete(role: EsRoleString): EsPermissionString {
    return `delete("${role}")` as EsPermissionString;
  }
}

// ==================== QUERY HELPER ====================

/**
 * Query builder for advanced filtering
 * Works identically in both server and client environments
 */
export class EsQuery {
  /**
   * Helper to create query JSON string
   */
  private static createQuery(method: string, attribute?: string, values?: any): EsQueryString {
    const query: any = { method };
    if (attribute !== undefined) query.attribute = attribute;
    if (values !== undefined) {
      query.values = Array.isArray(values) ? values : [values];
    }
    return JSON.stringify(query) as EsQueryString;
  }

  // Comparison operators

  /**
   * Equal to
   */
  static equal(attribute: string, value: any): EsQueryString {
    return EsQuery.createQuery('equal', attribute, value);
  }

  /**
   * Not equal to
   */
  static notEqual(attribute: string, value: any): EsQueryString {
    return EsQuery.createQuery('notEqual', attribute, value);
  }

  /**
   * Less than
   */
  static lessThan(attribute: string, value: any): EsQueryString {
    return EsQuery.createQuery('lessThan', attribute, value);
  }

  /**
   * Less than or equal
   */
  static lessThanEqual(attribute: string, value: any): EsQueryString {
    return EsQuery.createQuery('lessThanEqual', attribute, value);
  }

  /**
   * Greater than
   */
  static greaterThan(attribute: string, value: any): EsQueryString {
    return EsQuery.createQuery('greaterThan', attribute, value);
  }

  /**
   * Greater than or equal
   */
  static greaterThanEqual(attribute: string, value: any): EsQueryString {
    return EsQuery.createQuery('greaterThanEqual', attribute, value);
  }

  /**
   * Between two values (inclusive)
   */
  static between(attribute: string, start: any, end: any): EsQueryString {
    return EsQuery.createQuery('between', attribute, [start, end]);
  }

  // String operators

  /**
   * Search for a string (full-text search)
   */
  static search(attribute: string, value: string): EsQueryString {
    return EsQuery.createQuery('search', attribute, value);
  }

  /**
   * Starts with
   */
  static startsWith(attribute: string, value: string): EsQueryString {
    return EsQuery.createQuery('startsWith', attribute, value);
  }

  /**
   * Ends with
   */
  static endsWith(attribute: string, value: string): EsQueryString {
    return EsQuery.createQuery('endsWith', attribute, value);
  }

  // Null checks

  /**
   * Is null
   */
  static isNull(attribute: string): EsQueryString {
    return EsQuery.createQuery('isNull', attribute);
  }

  /**
   * Is not null
   */
  static isNotNull(attribute: string): EsQueryString {
    return EsQuery.createQuery('isNotNull', attribute);
  }

  // Array operators

  /**
   * Contains value (for arrays)
   */
  static contains(attribute: string, value: any): EsQueryString {
    return EsQuery.createQuery('contains', attribute, value);
  }

  // Logical operators

  /**
   * OR condition
   */
  static or(queries: EsQueryString[]): EsQueryString {
    const parsedQueries = queries.map(q => JSON.parse(q));
    return EsQuery.createQuery('or', undefined, parsedQueries);
  }

  /**
   * AND condition
   */
  static and(queries: EsQueryString[]): EsQueryString {
    const parsedQueries = queries.map(q => JSON.parse(q));
    return EsQuery.createQuery('and', undefined, parsedQueries);
  }

  // Ordering

  /**
   * Order by ascending
   */
  static orderAsc(attribute: string): EsQueryString {
    return EsQuery.createQuery('orderAsc', attribute);
  }

  /**
   * Order by descending
   */
  static orderDesc(attribute: string): EsQueryString {
    return EsQuery.createQuery('orderDesc', attribute);
  }

  /**
   * Cursor before (for pagination)
   */
  static cursorBefore(documentId: string): EsQueryString {
    return EsQuery.createQuery('cursorBefore', undefined, documentId);
  }

  /**
   * Cursor after (for pagination)
   */
  static cursorAfter(documentId: string): EsQueryString {
    return EsQuery.createQuery('cursorAfter', undefined, documentId);
  }

  // Pagination

  /**
   * Limit number of results
   */
  static limit(value: number): EsQueryString {
    return EsQuery.createQuery('limit', undefined, value);
  }

  /**
   * Offset (skip) results
   */
  static offset(value: number): EsQueryString {
    return EsQuery.createQuery('offset', undefined, value);
  }

  // Selection

  /**
   * Select specific attributes to return
   */
  static select(attributes: string[]): EsQueryString {
    return EsQuery.createQuery('select', undefined, attributes);
  }
}
