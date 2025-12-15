# Contributing to Deno MCP Server

Thank you for your interest in contributing to the Deno MCP Server! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [sudsarkar13@gmail.com](mailto:sudsarkar13@gmail.com).

## Getting Started

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Latest stable version
- **Deno**: Latest stable version (for testing)
- **Git**: For version control
- **TypeScript**: Familiarity with TypeScript development

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/deno-mcp.git
cd deno-mcp/deno-mcp-tools
```

3. Add the upstream remote:

```bash
git remote add upstream https://github.com/sudsarkar13/deno-mcp.git
```

## Development Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Build the project:**

```bash
npm run build
```

3. **Run in development mode:**

```bash
npm run watch
```

4. **Test with MCP Inspector:**

```bash
npm run inspector
```

5. **Verify everything works:**

```bash
# In another terminal
npx @modelcontextprotocol/inspector build/index.js
```

## Contributing Process

### 1. Choose an Issue

- Look for issues labeled `good first issue` for beginners
- Check issues labeled `help wanted` for areas needing contribution
- Create a new issue if you want to propose a new feature

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements
- `chore/` - Maintenance tasks

### 3. Make Changes

Follow the coding standards and ensure your changes:

- Solve the intended problem
- Don't break existing functionality
- Include appropriate tests
- Update documentation if needed

### 4. Commit Changes

Use conventional commit messages:

```bash
git commit -m "feat: add new deno tool for X"
git commit -m "fix: resolve permission issue in deno_run"
git commit -m "docs: update API documentation for Y"
```

**Commit Types:**

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Coding Standards

### TypeScript Guidelines

1. **Strict Typing**: Use strict TypeScript settings

```typescript
// ✅ Good
interface DenoRunOptions {
  script: string;
  permissions?: PermissionOptions;
}

// ❌ Bad
function runDeno(options: any) { ... }
```

2. **Naming Conventions**:
   - Functions: `camelCase`
   - Interfaces: `PascalCase`
   - Constants: `UPPER_SNAKE_CASE`
   - Files: `kebab-case.ts`

3. **Error Handling**: Use custom error classes

```typescript
throw new DenoCommandError("Command failed", exitCode, stdout, stderr);
```

4. **Documentation**: Include JSDoc comments

```typescript
/**
 * Execute a Deno script with specified options
 * @param options - Configuration for script execution
 * @returns Promise resolving to command result
 */
async function denoRun(options: DenoRunOptions): Promise<DenoCommandResult> {
  // Implementation
}
```

### Code Organization

1. **Tool Structure**: Follow the established pattern

```typescript
// Tool implementation
export async function denoNewTool(options: Options): Promise<Result> {
  // Implementation
}

// MCP tool handler
export const newCategoryTools = {
  deno_new_tool: {
    name: "deno_new_tool",
    description: "Description of the tool",
    inputSchema: TOOL_SCHEMAS.deno_new_tool,
    handler: async (args: any) => {
      // Handler implementation
    },
  },
};
```

2. **File Organization**:
   - Tools by category in `src/tools/`
   - Types in `src/types/`
   - Utilities in `src/utils/`
   - Tests adjacent to source files

## Testing Guidelines

### Manual Testing

1. **Build and Test**:

```bash
npm run build
npm run inspector
```

2. **Test Each Tool**: Use MCP Inspector to test:
   - Valid inputs
   - Invalid inputs
   - Edge cases
   - Error conditions

3. **Cross-platform Testing**: Test on:
   - Windows
   - macOS
   - Linux

### Integration Testing

Test with real MCP clients:

- Claude Desktop
- VS Code Continue extension
- Custom MCP implementations

## Documentation

### Required Documentation Updates

1. **API Reference**: Update `docs/api-reference.md` for new tools
2. **README**: Update main README.md if needed
3. **Examples**: Add usage examples in `examples/`
4. **Changelog**: Update `CHANGELOG.md` following semver

### Documentation Standards

- Clear, concise explanations
- Include code examples
- Use proper markdown formatting
- Link to related documentation

## Issue Reporting

### Before Creating an Issue

1. Search existing issues to avoid duplicates
2. Check the documentation and examples
3. Test with the latest version

### Bug Reports

Use the bug report template and include:

- **Environment**: OS, Node.js version, Deno version
- **Steps to Reproduce**: Clear, numbered steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Error Messages**: Full error output
- **Minimal Example**: Smallest code that reproduces the issue

### Feature Requests

Use the feature request template and include:

- **Problem**: What problem does this solve?
- **Solution**: Proposed solution
- **Alternatives**: Other solutions considered
- **Use Cases**: How would this be used?

## Pull Request Process

### Before Submitting

1. **Sync with upstream**:

```bash
git fetch upstream
git rebase upstream/main
```

2. **Run quality checks**:

```bash
npm run lint
npm run build
npm run test
```

3. **Test your changes**:

```bash
npm run inspector
# Test your specific changes
```

### PR Requirements

- [ ] Code follows project standards
- [ ] Tests pass (manual testing required)
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventional format
- [ ] No merge conflicts with main branch
- [ ] PR description explains the changes

### PR Template

Use the provided PR template and fill out:

- **Description**: What does this PR do?
- **Type of Change**: Bug fix, feature, documentation, etc.
- **Testing**: How was this tested?
- **Checklist**: Complete the provided checklist

### Review Process

1. **Automated Checks**: GitHub Actions will run
2. **Code Review**: Maintainers will review your code
3. **Testing**: Reviewers may test your changes
4. **Feedback**: Address any requested changes
5. **Approval**: Once approved, your PR will be merged

## Release Process

### Version Management

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes to the API
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Release Steps

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release PR
4. Tag release after merge
5. Publish to NPM
6. Create GitHub release

## Development Tips

### Local Development

1. **Use watch mode** for development:

```bash
npm run watch
```

2. **Test frequently** with inspector:

```bash
npm run inspector
```

3. **Check types** regularly:

```bash
npm run lint
```

### Debugging

1. **Enable verbose logging** in your development environment
2. **Use MCP Inspector** to debug tool interactions
3. **Test with minimal examples** to isolate issues

### Performance

1. **Monitor command execution time**
2. **Test with large projects**
3. **Check memory usage during long operations**

## Getting Help

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: [sudsarkar13@gmail.com](mailto:sudsarkar13@gmail.com) for security issues

### Resources

- [Deno Documentation](https://docs.deno.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes for significant contributions
- GitHub contributor graphs

Thank you for contributing to the Deno MCP Server! Your contributions help make Deno development more accessible through AI assistants.
