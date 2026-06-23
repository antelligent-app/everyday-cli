# Schema Fix Guide

## Issue: Invalid Integer Min/Max Values

### Error Message
```
Invalid `min` param: Value must be a valid integer
```

### Root Cause
This issue occurs when using `schema pull` to retrieve a schema from Appwrite. Appwrite stores 64-bit integers internally, but JavaScript can only safely represent integers up to `Number.MAX_SAFE_INTEGER` (9,007,199,254,740,991).

When Appwrite returns integer attributes with default bounds (±2^63), these values get corrupted during JSON serialization, resulting in unsafe integers like `-9223372036854776000`.

**As of version 1.1.0**, the CLI automatically handles this by omitting unsafe min/max values during `schema pull`.

### Problem
The `fileSize` attribute in the `document_metadata` collection has invalid min/max values:

```json
{
  "key": "fileSize",
  "type": "integer",
  "required": true,
  "array": false,
  "min": -9223372036854776000,  // ❌ Invalid - exceeds JavaScript safe integer
  "max": 9223372036854776000,   // ❌ Invalid - exceeds JavaScript safe integer
  "default": null
}
```

These values (`-9223372036854776000`) are beyond JavaScript's `Number.MAX_SAFE_INTEGER` (9,007,199,254,740,991) and result in floating-point imprecision.

### Solution

Replace the `fileSize` attribute with one of these valid options:

#### Option 1: Remove min/max (Recommended for File Sizes)

```json
{
  "key": "fileSize",
  "type": "integer",
  "required": true,
  "array": false,
  "default": null
}
```

Appwrite will use safe defaults. File sizes are typically positive, so no need for min/max.

#### Option 2: Use Reasonable Bounds

```json
{
  "key": "fileSize",
  "type": "integer",
  "required": true,
  "array": false,
  "min": 0,                    // ✅ Files can't have negative size
  "max": 2147483647,           // ✅ ~2GB (safe 32-bit integer)
  "default": null
}
```

or for larger files:

```json
{
  "key": "fileSize",
  "type": "integer",
  "required": true,
  "array": false,
  "min": 0,
  "max": 9007199254740991,     // ✅ JavaScript's MAX_SAFE_INTEGER
  "default": null
}
```

### Appwrite Integer Limits

Appwrite uses signed 64-bit integers internally, but when passing values through JavaScript/JSON:
- **Safe range**: -9,007,199,254,740,991 to 9,007,199,254,740,991
- **Recommended for file sizes**: 0 to 2,147,483,647 (2GB max, 32-bit)
- **For larger files**: 0 to 9,007,199,254,740,991 (~8 petabytes)

### How to Fix Your Schema

#### If you're using CLI version 1.1.0 or later (Automatic Fix)

Simply re-pull your schema:

```bash
everyday-cli schema pull --database-id your_db_id --api-key xxx --project-id yyy
```

The CLI will automatically:
- ✅ Detect unsafe integer min/max values
- ✅ Show warnings for problematic attributes
- ✅ Omit the unsafe values from the pulled schema
- ✅ Generate a clean schema file

You'll see warnings like:
```
Warning: Attribute "fileSize" has min value -9223372036854776000 outside safe integer range. Omitting min from schema.
Warning: Attribute "fileSize" has max value 9223372036854776000 outside safe integer range. Omitting max from schema.
```

#### If you have an existing corrupted schema file (Manual Fix)

1. Open your schema file (e.g., `schema.json`)

2. Find the `fileSize` attribute in the `document_metadata` collection

3. Replace it with:

```json
{
  "key": "fileSize",
  "type": "integer",
  "required": true,
  "array": false,
  "default": null
}
```

4. Validate your schema:
```bash
everyday-cli schema validate
```

5. Push the updated schema:
```bash
everyday-cli schema push --api-key xxx --project-id yyy
```

### Prevention

When creating integer attributes:
- ✅ Use `Number.MAX_SAFE_INTEGER` (9007199254740991) as absolute maximum
- ✅ For file sizes, use practical limits (0 to 2GB)
- ✅ Omit min/max if you want Appwrite defaults
- ❌ Never use values beyond JavaScript's safe integer range
- ❌ Avoid using large scientific notation (e.g., `9.22337e+18`)

### Complete Fixed Attribute

Here's the complete fixed `document_metadata` collection:

```json
{
  "id": "document_metadata",
  "name": "Document Metadata",
  "enabled": true,
  "documentSecurity": false,
  "permissions": [],
  "attributes": [
    {
      "key": "chatSessionId",
      "type": "string",
      "required": true,
      "array": false,
      "size": 255,
      "default": null
    },
    {
      "key": "title",
      "type": "string",
      "required": true,
      "array": false,
      "size": 500,
      "default": null
    },
    {
      "key": "fileName",
      "type": "string",
      "required": true,
      "array": false,
      "size": 500,
      "default": null
    },
    {
      "key": "fileSize",
      "type": "integer",
      "required": true,
      "array": false,
      "default": null
    },
    {
      "key": "storageFileId",
      "type": "string",
      "required": true,
      "array": false,
      "size": 255,
      "default": null
    },
    {
      "key": "createdAt",
      "type": "datetime",
      "required": true,
      "array": false,
      "default": null
    }
  ],
  "indexes": [
    {
      "key": "chatSessionId_idx",
      "type": "key",
      "attributes": ["chatSessionId"],
      "orders": []
    },
    {
      "key": "storageFileId_idx",
      "type": "unique",
      "attributes": ["storageFileId"],
      "orders": []
    }
  ]
}
```

### Additional Notes

- The validator in `everyday-cli` checks that min/max are numbers but doesn't validate they're within safe integer range
- Appwrite's backend will reject values outside its acceptable range
- Always test your schema with `schema validate` before pushing
- Consider the practical limits of your data when setting bounds

## Support

For more help:
- Check the [README](./README.md) for schema management documentation
- See Appwrite docs: https://appwrite.io/docs/products/databases/collections
- File an issue: https://github.com/antelligent-app/everyday-cli/issues
