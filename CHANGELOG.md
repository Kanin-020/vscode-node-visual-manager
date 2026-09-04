# Changelog

All notable changes to **NVM - Node Visual Manager** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.4.0] - 2026-09-04

### Changed

- initial commit open source

## [1.4.0] - 2026-09-04

### Changed

- Compatible with NVM for Windows v2.0.0 (new commands and output formats)
- `nvm current` replaced with `nvm default`
- `nvm list available` replaced with `nvm list releases --no-limit`
- `nvm list` replaced with `nvm list installed`
- Removed stderr checks that broke on v2.0.0 spinner output
- Improved version search with prefix matching and relevance sorting
- Clean script now works on Windows (`rimraf --glob`)
- All dependencies moved to devDependencies (webpack bundles everything)
- Removed unused `node-fetch` dependency
- Forced LF line endings via `.gitattributes` to prevent Prettier CRLF errors on Windows

### Added

- NVM on/off state detection via `nvm env` parsing
- Separate NVM status message for webview toggle
- `.gitattributes` for cross-platform line ending consistency
- Changelog for v1.4.0

### Removed

- `node-fetch` dependency (unused)
- Category-based version sorting (Categorized/LTS/Old Stable/Old Unstable) — NVM v2.0.0 no longer provides this data

## [1.3.0] - 2026-09-01

### Changed

- Architecture refactored with SOLID, DRY, and Clean Code principles
- Separated concerns into core, infrastructure, vscode, and web layers
- Added NvmCore/NvmToggleable interfaces for platform-specific capabilities
- Shared version utilities extracted to core module
- SearchBar component now accepts filter function instead of type prop

### Added

- Command injection protection via version validation
- JSDoc documentation for all source files
- Unit tests for version validation and sorting utilities
- Specific imports replacing wildcard `import * as vscode` patterns
- GitHub Actions workflows for CI and release

### Fixed

- Duplicate case in availableVersionProvider
- Malformed HTML tags in webview providers
- Inconsistent error handling across adapters
- Async constructor issue in NVM singleton

## [1.2.0] - 2024-06-25

### Changed

- Bug fixes
- Added support for automatic reading of .nvmrc files
- Removed automatic installation of NVM tool versions
- Updated Linux-specific Node version handling

## [1.0.0] - 2024-02-19

### Added

- Initial release of Node Visual Manager
- Install, uninstall, and switch Node.js versions from VS Code sidebar
- Support for Windows (nvm-windows) and Linux (nvm-sh)
- Enable/disable NVM toggle (Windows only)
- Available versions browser with category filtering
