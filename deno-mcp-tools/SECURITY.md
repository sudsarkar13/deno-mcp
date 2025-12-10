# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depend on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The Deno MCP Server team and community take security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to [sudsarkar13@gmail.com](mailto:sudsarkar13@gmail.com).

Please include the following information in your report:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours.
- **Initial Assessment**: We will provide an initial assessment of the vulnerability within 5 business days.
- **Regular Updates**: We will keep you informed of our progress towards fixing the vulnerability.
- **Resolution**: We aim to resolve critical vulnerabilities within 30 days of initial report.

### Disclosure Policy

- **Coordinated Disclosure**: We follow a coordinated disclosure policy. We ask that you do not publicly disclose the vulnerability until we have had a chance to address it.
- **Public Disclosure**: Once a fix is available, we will work with you to publicly disclose the vulnerability in a responsible manner.
- **Credit**: We will credit you for the discovery when we publicly disclose the vulnerability, unless you prefer to remain anonymous.

## Security Considerations

### MCP Server Security

The Deno MCP Server provides access to system commands through the Deno CLI. This inherently involves security considerations:

#### Permission Model

- **Deno's Security**: The server leverages Deno's built-in permission system
- **Explicit Permissions**: All operations require explicit permission grants
- **Principle of Least Privilege**: Only grant necessary permissions for each operation

#### Input Validation

- **Parameter Sanitization**: All user inputs are validated before being passed to Deno commands
- **Path Traversal Prevention**: File paths are validated to prevent directory traversal attacks
- **Command Injection Prevention**: Arguments are properly escaped and validated

#### Network Security

- **Local Operation**: The MCP server is designed for local development environments
- **No Network Exposure**: By default, the server only listens on localhost
- **Authentication**: When exposed, ensure proper authentication mechanisms are in place

### Deployment Security

#### Production Considerations

- **Container Security**: Use minimal container images and non-root users
- **Resource Limits**: Implement appropriate resource limits to prevent DoS
- **Network Isolation**: Deploy in isolated network environments when possible
- **Regular Updates**: Keep all dependencies and the Deno runtime updated

#### Environment Security

- **Secrets Management**: Never include sensitive information in configuration files
- **Environment Variables**: Use secure methods for managing environment variables
- **File Permissions**: Ensure proper file permissions on configuration and executable files

### Client Security

#### MCP Client Integration

- **Trusted Sources**: Only connect to trusted MCP servers
- **Permission Review**: Review and understand what permissions are being granted
- **Network Security**: Use secure connections when communicating over networks

## Security Features

### Built-in Security Measures

1. **Permission Validation**: All operations validate required permissions before execution
2. **Input Sanitization**: User inputs are sanitized to prevent injection attacks
3. **Error Handling**: Security-sensitive information is not exposed in error messages
4. **Resource Limits**: Commands have appropriate timeout and resource limits

### Security Monitoring

1. **Audit Logging**: Security-relevant operations are logged for audit purposes
2. **Error Tracking**: Security errors are tracked and monitored
3. **Dependency Scanning**: Regular scanning for vulnerable dependencies

## Vulnerability Categories

### High Priority

- **Command Injection**: Ability to execute arbitrary commands
- **Path Traversal**: Unauthorized file system access
- **Permission Bypass**: Circumventing Deno's permission system
- **Code Injection**: Ability to execute arbitrary code

### Medium Priority

- **Information Disclosure**: Exposure of sensitive information
- **Denial of Service**: Resource exhaustion attacks
- **Authentication Bypass**: Circumventing authentication mechanisms

### Low Priority

- **Information Leakage**: Minor information disclosure
- **Configuration Issues**: Insecure default configurations

## Security Resources

### Documentation

- [Deno Security](https://docs.deno.com/runtime/fundamentals/security/)
- [Model Context Protocol Security](https://modelcontextprotocol.io/docs/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### Tools

- **Dependency Scanning**: `npm audit`
- **Static Analysis**: ESLint security rules
- **Container Scanning**: Docker security scanning tools

### Updates

- **Security Advisories**: Monitor GitHub security advisories
- **Dependency Updates**: Regular dependency updates
- **Deno Updates**: Keep Deno runtime updated

## Contact Information

- **Security Email**: [sudsarkar13@gmail.com](mailto:sudsarkar13@gmail.com)
- **General Contact**: [GitHub Issues](https://github.com/sudsarkar13/deno-mcp/issues)
- **Project Maintainer**: Sudeepta Sarkar

## Acknowledgments

We would like to thank the following individuals for responsibly disclosing security vulnerabilities:

<!-- List of security researchers who have reported vulnerabilities -->
<!-- This section will be updated as vulnerabilities are reported and resolved -->

*No security vulnerabilities have been reported yet.*

---

**Note**: This security policy is subject to change. Please check back regularly for updates.

Last updated: December 10, 2024
