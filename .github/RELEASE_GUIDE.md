# Release and Publishing Guide

This guide provides comprehensive instructions for releasing and publishing the Deno MCP Tools package across all supported platforms.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Pre-Release Checklist](#pre-release-checklist)
- [Automated Release Process](#automated-release-process)
- [Manual Release Process](#manual-release-process)
- [Publishing Targets](#publishing-targets)
- [Post-Release Verification](#post-release-verification)
- [Troubleshooting](#troubleshooting)
- [Emergency Procedures](#emergency-procedures)

## Overview

The Deno MCP Tools project uses an automated CI/CD pipeline for releases, triggered by version tags. The release process publishes to multiple targets:

- **NPM Registry**: `@sudsarkar13/deno-mcp`
- **Docker Hub**: `sudsarkar13/deno-mcp`
- **GitHub Container Registry**: `ghcr.io/sudsarkar13/deno-mcp`
- **GitHub Releases**: Source code and build artifacts

## Prerequisites

### Required Access & Permissions

- **GitHub Repository**: Write access to create tags and releases
- **NPM Registry**: Publish access with `NPM_TOKEN` secret
- **Docker Hub**: Push access with `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets
- **GitHub Container Registry**: Automatic access via `GITHUB_TOKEN`

### Required Tools (for manual releases)

```bash
# Node.js and NPM
node --version  # >= 18.0.0
npm --version

# Git
git --version

# Docker (for testing)
docker --version

# GitHub CLI (optional)
gh --version
```

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/sudsarkar13/deno-mcp.git
cd deno-mcp

# Install dependencies
npm ci

# Verify build works
npm run build
npm test
```

## Pre-Release Checklist

### 1. Code Quality & Testing

```bash
# Ensure all tests pass
npm test

# Verify linting and formatting
npm run lint

# Run security audit
npm audit --audit-level=moderate
npx audit-ci --moderate

# Build the project
npm run build
```

### 2. Version Management

**Update version in `package.json`:**

```json
{
  "version": "X.Y.Z"
}
```

**Follow Semantic Versioning:**

- **MAJOR (X)**: Breaking changes
- **MINOR (Y)**: New features (backward compatible)
- **PATCH (Z)**: Bug fixes (backward compatible)

### 3. Documentation Updates

**Update `CHANGELOG.md`:**

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Modified features

### Fixed
- Bug fixes

### Removed
- Deprecated features
```

**Verify documentation:**

- [ ] README.md is up to date
- [ ] API documentation reflects changes
- [ ] Examples are working
- [ ] Docker configurations are current

### 4. Dependencies & Security

```bash
# Update dependencies if needed
npm update

# Check for vulnerabilities
npm audit

# Verify no high/critical vulnerabilities
npx audit-ci --high
```

## Automated Release Process

The automated release process is triggered by creating and pushing a version tag.

### Step 1: Create and Push Tag

```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Create version tag (must match package.json version)
git tag v1.2.3

# Push tag to trigger release
git push origin v1.2.3
```

### Step 2: Monitor CI/CD Pipeline

The GitHub Actions workflow will automatically:

1. **Lint & Build**: Code quality checks and compilation
2. **Test**: Cross-platform testing (Ubuntu, Windows, macOS)
3. **Security Audit**: Dependency vulnerability scanning
4. **Docker Build**: Multi-platform container builds
5. **Publish NPM**: Package publication to NPM registry
6. **Publish Docker**: Images to Docker Hub and GHCR
7. **Create Release**: GitHub release with artifacts
8. **Cleanup**: Artifact cleanup and notifications

### Step 3: Verify Release Success

Check the [Actions tab](https://github.com/sudsarkar13/deno-mcp/actions) for pipeline status.

## Manual Release Process

Use manual release for testing or when automated process fails.

### Step 1: Prepare Release

```bash
# Clean build
npm run clean
npm run build

# Test the build
npm test
```

### Step 2: NPM Publishing

```bash
# Login to NPM (if not already logged in)
npm login

# Verify authentication
npm whoami

# Dry run to check what will be published
npm publish --dry-run

# Publish to NPM
npm publish
```

### Step 3: Docker Publishing

```bash
# Build Docker image
docker build -f examples/docker-examples/Dockerfile -t sudsarkar13/deno-mcp:1.2.3 .

# Test Docker image
docker run --rm sudsarkar13/deno-mcp:1.2.3 deno --version

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push sudsarkar13/deno-mcp:1.2.3
docker tag sudsarkar13/deno-mcp:1.2.3 sudsarkar13/deno-mcp:latest
docker push sudsarkar13/deno-mcp:latest

# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Push to GHCR
docker tag sudsarkar13/deno-mcp:1.2.3 ghcr.io/sudsarkar13/deno-mcp:1.2.3
docker push ghcr.io/sudsarkar13/deno-mcp:1.2.3
```

### Step 4: GitHub Release

```bash
# Create release archive
tar -czf deno-mcp-1.2.3.tar.gz build/ README.md LICENSE CHANGELOG.md docs/ examples/

# Create GitHub release (using gh CLI)
gh release create v1.2.3 \
  --title "Release v1.2.3" \
  --notes-file CHANGELOG.md \
  --target main \
  deno-mcp-1.2.3.tar.gz
```

## Publishing Targets

### NPM Package

- **Package Name**: `@sudsarkar13/deno-mcp`
- **Registry**: `https://registry.npmjs.org`
- **Access**: Public
- **Installation**: `npm install -g @sudsarkar13/deno-mcp`

**Published Files:**

- `build/` - Compiled JavaScript
- `README.md` - Documentation
- `LICENSE` - MIT license
- `docs/` - API documentation
- `examples/` - Usage examples

### Docker Images

**Docker Hub:**

- **Repository**: `sudsarkar13/deno-mcp`
- **Tags**: `latest`, `1.2.3`, `1.2`, `1`
- **Platforms**: `linux/amd64`, `linux/arm64`

**GitHub Container Registry:**

- **Repository**: `ghcr.io/sudsarkar13/deno-mcp`
- **Tags**: `latest`, `1.2.3`, `1.2`, `1`
- **Platforms**: `linux/amd64`, `linux/arm64`

**Usage:**

```bash
# Docker Hub
docker pull sudsarkar13/deno-mcp:latest

# GitHub Container Registry
docker pull ghcr.io/sudsarkar13/deno-mcp:latest
```

### GitHub Releases

- **Repository**: `https://github.com/sudsarkar13/deno-mcp`
- **Release Notes**: Extracted from `CHANGELOG.md`
- **Artifacts**: Source code archive (`deno-mcp-X.Y.Z.tar.gz`)

## Post-Release Verification

### 1. NPM Package Verification

```bash
# Install from NPM
npm install -g @sudsarkar13/deno-mcp

# Verify installation
deno-mcp --help

# Test basic functionality
npx @modelcontextprotocol/inspector deno-mcp
```

### 2. Docker Image Verification

```bash
# Test Docker Hub image
docker run --rm sudsarkar13/deno-mcp:latest deno --version

# Test GHCR image
docker run --rm ghcr.io/sudsarkar13/deno-mcp:latest deno --version

# Test with MCP inspector
docker run -p 3000:3000 sudsarkar13/deno-mcp:latest
```

### 3. GitHub Release Verification

- [ ] Release appears on [GitHub Releases](https://github.com/sudsarkar13/deno-mcp/releases)
- [ ] Release notes are properly formatted
- [ ] Source code archive is attached
- [ ] Tag matches package.json version

### 4. Integration Testing

```bash
# Test with Claude Desktop (if configured)
# Verify MCP server starts correctly

# Test with VS Code Continue (if configured)
# Verify tools are accessible

# Test basic Deno operations
deno-mcp # Should start MCP server
```

## Troubleshooting

### Common Issues

#### 1. Version Mismatch Error

**Error**: "Tag version (X.Y.Z) does not match package.json version (A.B.C)"

**Solution**:

```bash
# Update package.json version to match tag
npm version X.Y.Z --no-git-tag-version
git add package.json
git commit -m "fix: update version to X.Y.Z"
git push origin main
```

#### 2. NPM Authentication Failed

**Error**: "npm ERR! 403 Forbidden - PUT <https://registry.npmjs.org/@sudsarkar13%2fdeno-mcp>"

**Solution**:

```bash
# Re-authenticate with NPM
npm logout
npm login

# Verify authentication
npm whoami

# Check package access
npm access list packages
```

#### 3. Docker Build Failed

**Error**: "Docker build context issues" or "Platform not supported"

**Solution**:

```bash
# Use buildx for multi-platform builds
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t image:tag .

# Or build for single platform
docker build --platform linux/amd64 -t image:tag .
```

#### 4. CI/CD Pipeline Failures

**Check these common causes**:

- Secrets are properly configured
- Build artifacts are available
- Dependencies are up to date
- Tests are passing locally

**Debug steps**:

```bash
# Run CI commands locally
npm ci
npm run lint
npm run build
npm test

# Check workflow file syntax
gh workflow view ci.yml
```

#### 5. GitHub Release Creation Failed

**Error**: "Release already exists" or "Tag already exists"

**Solution**:

```bash
# Delete existing tag and release
git tag -d v1.2.3
git push origin --delete v1.2.3
gh release delete v1.2.3

# Recreate tag and push
git tag v1.2.3
git push origin v1.2.3
```

### Getting Help

1. **Check GitHub Actions logs**: Detailed error messages and stack traces
2. **Review NPM publish logs**: Authentication and permission issues
3. **Docker build logs**: Container build and platform issues
4. **Contact maintainer**: Email <sudsarkar13@gmail.com> for complex issues

## Emergency Procedures

### Emergency Hotfix Release

For critical security fixes or major bugs:

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/v1.2.4

# 2. Apply fix and test
# ... make changes ...
npm test
npm run build

# 3. Update version (patch increment)
npm version patch --no-git-tag-version

# 4. Update CHANGELOG.md with hotfix details

# 5. Commit and push
git add .
git commit -m "hotfix: critical security fix"
git push origin hotfix/v1.2.4

# 6. Create PR and merge immediately after review
gh pr create --title "Hotfix v1.2.4" --body "Critical security fix"

# 7. Tag and release from main
git checkout main
git pull origin main
git tag v1.2.4
git push origin v1.2.4
```

### Rolling Back a Release

If a release has critical issues:

```bash
# 1. Unpublish from NPM (within 72 hours)
npm unpublish @sudsarkar13/deno-mcp@1.2.3

# 2. Delete Docker images (if possible)
# Contact Docker Hub support for image removal

# 3. Mark GitHub release as draft/pre-release
gh release edit v1.2.3 --draft

# 4. Communicate issue to users
# Create GitHub issue explaining the problem

# 5. Prepare fixed version
# Follow hotfix procedure above
```

### Package Recovery

If package is accidentally deleted or corrupted:

```bash
# 1. Restore from backup (if available)
# 2. Rebuild from source
git checkout v1.2.3
npm ci
npm run build
npm publish

# 3. Verify all platforms are restored
# 4. Update documentation about the incident
```

## Release Schedule

### Regular Releases

- **Major releases**: Quarterly (breaking changes)
- **Minor releases**: Monthly (new features)
- **Patch releases**: As needed (bug fixes)

### Security Releases

- **Critical vulnerabilities**: Within 24 hours
- **High severity**: Within 1 week
- **Medium/Low severity**: Next regular release

## Changelog Maintenance

Keep `CHANGELOG.md` updated with every release:

```markdown
## [Unreleased]

### Added
- New features in development

### Changed
- Modified features in development

### Fixed
- Bug fixes in development

## [1.2.3] - 2024-12-11

### Added
- Feature A
- Feature B

### Fixed
- Bug fix A
- Bug fix B
```

---

## Quick Reference

### Release Commands

```bash
# Automated release
git tag v1.2.3 && git push origin v1.2.3

# Manual NPM publish
npm publish

# Manual Docker build
docker build -f examples/docker-examples/Dockerfile -t sudsarkar13/deno-mcp:1.2.3 .

# Create GitHub release
gh release create v1.2.3 --generate-notes
```

### Verification Commands

```bash
# Test NPM package
npm install -g @sudsarkar13/deno-mcp && deno-mcp --help

# Test Docker image
docker run --rm sudsarkar13/deno-mcp:latest deno --version

# Check release status
gh release view v1.2.3
```

### Support Contacts

- **Maintainer**: Sudeepta Sarkar (<sudsarkar13@gmail.com>)
- **Repository**: <https://github.com/sudsarkar13/deno-mcp>
- **Issues**: <https://github.com/sudsarkar13/deno-mcp/issues>
- **NPM Package**: <https://www.npmjs.com/package/@sudsarkar13/deno-mcp>

---

*This guide is maintained alongside the project. Please keep it updated with any changes to the release process.*
