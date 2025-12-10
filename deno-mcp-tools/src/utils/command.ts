/**
 * Utility functions for executing Deno commands
 */

import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import {
  DenoCommandOptions,
  DenoCommandResult,
  DenoCommandError,
  DenoPermissionDescriptor
} from '../types/index.js';

/**
 * Check if Deno is installed and accessible
 */
export async function checkDenoInstallation(): Promise<boolean> {
  try {
    const result = await executeCommand(['--version'], {});
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Get Deno version information
 */
export async function getDenoVersion(): Promise<string> {
  const result = await executeCommand(['--version'], {});
  if (!result.success) {
    throw new DenoCommandError('Failed to get Deno version', result.code, result.stdout, result.stderr);
  }
  return result.stdout.trim();
}

/**
 * Execute a Deno command with the given arguments and options
 */
export async function executeCommand(
  args: string[],
  options: DenoCommandOptions = {}
): Promise<DenoCommandResult> {
  const {
    workingDirectory = process.cwd(),
    permissions = [],
    envVars = {},
    timeout = 30000
  } = options;

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    // Build the complete command arguments
    const commandArgs = [...permissions, ...args];
    
    // Prepare environment variables
    const env = { ...process.env, ...envVars };
    
    // Spawn the Deno process
    const child = spawn('deno', commandArgs, {
      cwd: workingDirectory,
      env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    // Collect stdout
    child.stdout?.on('data', (data: any) => {
      stdout += data.toString();
    });

    // Collect stderr
    child.stderr?.on('data', (data: any) => {
      stderr += data.toString();
    });

    // Handle process completion
    child.on('close', (code: number | null) => {
      const duration = Date.now() - startTime;
      const result: DenoCommandResult = {
        success: code === 0,
        stdout,
        stderr,
        code: code || 0,
        duration
      };

      if (code === 0) {
        resolve(result);
      } else {
        reject(new DenoCommandError(
          `Deno command failed with code ${code}`,
          code || 1,
          stdout,
          stderr
        ));
      }
    });

    // Handle process errors
    child.on('error', (error: Error) => {
      const duration = Date.now() - startTime;
      reject(new DenoCommandError(
        `Failed to execute Deno command: ${error.message}`,
        1,
        stdout,
        stderr
      ));
    });

    // Set timeout
    if (timeout > 0) {
      setTimeout(() => {
        child.kill('SIGTERM');
        reject(new DenoCommandError(
          `Command timed out after ${timeout}ms`,
          124,
          stdout,
          stderr
        ));
      }, timeout);
    }
  });
}

/**
 * Build permission arguments for Deno commands
 */
export function buildPermissionArgs(permissions: string[] = []): string[] {
  const permissionArgs: string[] = [];
  
  for (const permission of permissions) {
    if (permission.startsWith('--')) {
      permissionArgs.push(permission);
    } else {
      // Handle shorthand permissions
      switch (permission) {
        case 'read':
          permissionArgs.push('--allow-read');
          break;
        case 'write':
          permissionArgs.push('--allow-write');
          break;
        case 'net':
          permissionArgs.push('--allow-net');
          break;
        case 'env':
          permissionArgs.push('--allow-env');
          break;
        case 'run':
          permissionArgs.push('--allow-run');
          break;
        case 'ffi':
          permissionArgs.push('--allow-ffi');
          break;
        case 'hrtime':
          permissionArgs.push('--allow-hrtime');
          break;
        case 'sys':
          permissionArgs.push('--allow-sys');
          break;
        case 'all':
          permissionArgs.push('--allow-all');
          break;
        default:
          // Assume it's already a full permission flag
          permissionArgs.push(permission);
      }
    }
  }
  
  return permissionArgs;
}

/**
 * Validate and normalize file paths
 */
export function validateAndNormalizePath(path: string, workingDirectory?: string): string {
  if (!path) {
    throw new Error('Path cannot be empty');
  }
  
  // If path is absolute, return as-is
  if (path.startsWith('/') || path.match(/^[A-Za-z]:/)) {
    return path;
  }
  
  // If relative, join with working directory
  const baseDir = workingDirectory || process.cwd();
  return join(baseDir, path);
}

/**
 * Parse Deno configuration file (deno.json or deno.jsonc)
 */
export async function parseDenoConfig(workingDirectory?: string): Promise<any> {
  const fs = await import('fs/promises');
  const baseDir = workingDirectory || process.cwd();
  
  // Try deno.json first, then deno.jsonc
  const configPaths = [
    join(baseDir, 'deno.json'),
    join(baseDir, 'deno.jsonc')
  ];
  
  for (const configPath of configPaths) {
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      // Remove comments for JSON parsing (basic JSONC support)
      const cleanContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
      return JSON.parse(cleanContent);
    } catch (error) {
      // Continue to next config file
    }
  }
  
  return null;
}

/**
 * Get available tasks from deno.json
 */
export async function getAvailableTasks(workingDirectory?: string): Promise<Record<string, string>> {
  const config = await parseDenoConfig(workingDirectory);
  return config?.tasks || {};
}

/**
 * Format command output for display
 */
export function formatCommandOutput(result: DenoCommandResult, includeStderr: boolean = true): string {
  let output = result.stdout;
  
  if (includeStderr && result.stderr) {
    output += '\n--- stderr ---\n' + result.stderr;
  }
  
  if (!result.success) {
    output += `\n--- Command failed with code ${result.code} ---`;
  }
  
  output += `\n--- Execution time: ${result.duration}ms ---`;
  
  return output.trim();
}

/**
 * Extract error information from Deno command output
 */
export function extractErrorInfo(stderr: string): { 
  type: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
} {
  const lines = stderr.split('\n');
  
  // Look for error patterns
  for (const line of lines) {
    // TypeScript error pattern
    const tsErrorMatch = line.match(/error: TS(\d+) \[ERROR\]: (.+)/);
    if (tsErrorMatch) {
      return {
        type: 'TypeScript',
        message: tsErrorMatch[2]
      };
    }
    
    // Permission error pattern
    const permErrorMatch = line.match(/error: Requires (.+) access/);
    if (permErrorMatch) {
      return {
        type: 'Permission',
        message: `Requires ${permErrorMatch[1]} access`
      };
    }
    
    // File not found error
    const fileErrorMatch = line.match(/error: Module not found "(.+)"/);
    if (fileErrorMatch) {
      return {
        type: 'Module',
        message: `Module not found: ${fileErrorMatch[1]}`
      };
    }
  }
  
  // Generic error
  return {
    type: 'Unknown',
    message: stderr.trim() || 'Unknown error occurred'
  };
}

/**
 * Check if a file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    const fs = await import('fs/promises');
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file extension
 */
export function getFileExtension(path: string): string {
  const lastDot = path.lastIndexOf('.');
  return lastDot === -1 ? '' : path.slice(lastDot);
}

/**
 * Check if path is a TypeScript file
 */
export function isTypeScriptFile(path: string): boolean {
  const ext = getFileExtension(path).toLowerCase();
  return ['.ts', '.tsx', '.mts', '.cts'].includes(ext);
}

/**
 * Check if path is a JavaScript file
 */
export function isJavaScriptFile(path: string): boolean {
  const ext = getFileExtension(path).toLowerCase();
  return ['.js', '.jsx', '.mjs', '.cjs'].includes(ext);
}

/**
 * Escape shell arguments
 */
export function escapeShellArg(arg: string): string {
  if (process.platform === 'win32') {
    // Windows shell escaping
    return `"${arg.replace(/"/g, '""')}"`;
  } else {
    // Unix shell escaping
    return `'${arg.replace(/'/g, "'\"'\"'")}'`;
  }
}

/**
 * Convert milliseconds to human-readable duration
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(1);
    return `${minutes}m ${seconds}s`;
  }
}
