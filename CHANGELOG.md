# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2026-06-23

### Added
- Appwrite database integration via `EsDbClient`
- Complete CRUD operations for records, accounts, and assets
- Schema management system with CLI commands
- Schema validation and synchronization
- Environment variable support via `.env` files
- Comprehensive TypeScript type definitions
- Production-ready configuration

### Changed
- Updated README with comprehensive API documentation
- Reorganized project structure for better maintainability
- Enhanced error handling across all clients

### Security
- Removed all hardcoded API keys from codebase
- Added `.env.example` for secure credential management
- Updated `.gitignore` to prevent accidental credential commits
- Removed test files containing sensitive data

### Removed
- Development documentation files (moved to internal docs)
- Test files with hardcoded credentials
- Temporary schema and metadata files

## [1.0.1] - 2026-06-19

### Added
- GitHub installation support via prepare script
- Package publishing configuration

### Changed
- Updated package metadata
- Improved build process

## [1.0.0] - 2026-06-18

### Added
- Initial release
- EsClient for flow execution
- CLI interface for running flows
- TypeScript support with 48 node types
- Helper methods for node filtering and data extraction
- Comprehensive documentation

### Features
- Flow execution with type-safe parameters
- Node type filtering
- JSON auto-parsing in node values
- Environment variable support for API keys
- Command-line interface

[1.0.2]: https://github.com/antelligent-app/everyday-cli/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/antelligent-app/everyday-cli/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/antelligent-app/everyday-cli/releases/tag/v1.0.0
