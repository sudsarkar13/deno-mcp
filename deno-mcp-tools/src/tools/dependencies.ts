/**
 * Deno dependency management tools: add, remove, install, outdated
 */

import {
  DenoAddOptions,
  DenoRemoveOptions,
  DenoInstallOptions,
  DenoCommandResult,
  TOOL_SCHEMAS
} from '../types/index.js';
import {
  executeCommand,
  buildPermissionArgs,
  formatCommandOutput
} from '../utils/command.js';

/**
 * Add dependencies to deno.json
 */
export async function denoAdd(options: DenoAddOptions): Promise<DenoCommandResult> {
  const {
    packages,
    dev = false,
    workingDirectory,
    envVars,
    timeout
  } = options;

  const commandArgs = ['add'];
  
  // Add dev flag
  if (dev) commandArgs.push('--dev');
  
  // Add packages
  commandArgs.push(...packages);

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout
  });
}

/**
 * Remove dependencies from deno.json
 */
export async function denoRemove(options: DenoRemoveOptions): Promise<DenoCommandResult> {
  const {
    packages,
    workingDirectory,
    envVars,
    timeout
  } = options;

  const commandArgs = ['remove', ...packages];

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout
  });
}

/**
 * Install a script globally or locally
 */
export async function denoInstall(options: DenoInstallOptions): Promise<DenoCommandResult> {
  const {
    script,
    global = false,
    name,
    root,
    force = false,
    permissions = [],
    workingDirectory,
    envVars,
    timeout
  } = options;

  const permissionArgs = buildPermissionArgs(permissions);
  const commandArgs = ['install'];
  
  // Add install options
  if (global) commandArgs.push('--global');
  if (name) commandArgs.push('--name', name);
  if (root) commandArgs.push('--root', root);
  if (force) commandArgs.push('--force');
  
  // Add permissions
  commandArgs.push(...permissionArgs);
  
  // Add script
  commandArgs.push(script);

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout
  });
}

/**
 * Uninstall a globally installed script
 */
export async function denoUninstall(options: {
  name: string;
  global?: boolean;
  root?: string;
  workingDirectory?: string;
  envVars?: Record<string, string>;
  timeout?: number;
}): Promise<DenoCommandResult> {
  const {
    name,
    global = false,
    root,
    workingDirectory,
    envVars,
    timeout
  } = options;

  const commandArgs = ['uninstall'];
  
  // Add uninstall options
  if (global) commandArgs.push('--global');
  if (root) commandArgs.push('--root', root);
  
  // Add script name
  commandArgs.push(name);

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout
  });
}

/**
 * Check for outdated dependencies
 */
export async function denoOutdated(options: {
  update?: boolean;
  workingDirectory?: string;
  envVars?: Record<string, string>;
  timeout?: number;
} = {}): Promise<DenoCommandResult> {
  const {
    update = false,
    workingDirectory,
    envVars,
    timeout
  } = options;

  const commandArgs = ['outdated'];
  
  // Add update flag
  if (update) commandArgs.push('--update');

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout
  });
}

/**
 * Initialize a new Deno project
 */
export async function denoInit(options: {
  name?: string;
  lib?: boolean;
  serve?: boolean;
  workingDirectory?: string;
  envVars?: Record<string, string>;
  timeout?: number;
} = {}): Promise<DenoCommandResult> {
  const {
    name,
    lib = false,
    serve = false,
    workingDirectory,
    envVars,
    timeout
  } = options;

  const commandArgs = ['init'];
  
  // Add init options
  if (lib) commandArgs.push('--lib');
  if (serve) commandArgs.push('--serve');
  if (name) commandArgs.push(name);

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout
  });
}

/**
 * Tool handlers for MCP
 */
export const dependencyTools = {
  deno_add: {
    name: 'deno_add',
    description: 'Add dependencies to deno.json',
    inputSchema: TOOL_SCHEMAS.deno_add,
    handler: async (args: any) => {
      try {
        const result = await denoAdd(args);
        return {
          content: [{
            type: 'text' as const,
            text: formatCommandOutput(result)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error adding dependencies: ${error.message}\n\nStdout: ${error.stdout || 'N/A'}\nStderr: ${error.stderr || 'N/A'}`
          }],
          isError: true
        };
      }
    }
  },

  deno_remove: {
    name: 'deno_remove',
    description: 'Remove dependencies from deno.json',
    inputSchema: TOOL_SCHEMAS.deno_remove,
    handler: async (args: any) => {
      try {
        const result = await denoRemove(args);
        return {
          content: [{
            type: 'text' as const,
            text: formatCommandOutput(result)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error removing dependencies: ${error.message}\n\nStdout: ${error.stdout || 'N/A'}\nStderr: ${error.stderr || 'N/A'}`
          }],
          isError: true
        };
      }
    }
  },

  deno_install: {
    name: 'deno_install',
    description: 'Install a script globally or locally',
    inputSchema: {
      type: 'object',
      properties: {
        script: { type: 'string', description: 'Script URL or path to install' },
        global: { type: 'boolean', description: 'Install globally' },
        name: { type: 'string', description: 'Name for the installed script' },
        root: { type: 'string', description: 'Installation root directory' },
        force: { type: 'boolean', description: 'Force installation' },
        permissions: { type: 'array', items: { type: 'string' }, description: 'Permissions to grant' },
        workingDirectory: { type: 'string', description: 'Working directory' }
      },
      required: ['script']
    },
    handler: async (args: any) => {
      try {
        const result = await denoInstall(args);
        return {
          content: [{
            type: 'text' as const,
            text: formatCommandOutput(result)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error installing script: ${error.message}\n\nStdout: ${error.stdout || 'N/A'}\nStderr: ${error.stderr || 'N/A'}`
          }],
          isError: true
        };
      }
    }
  },

  deno_uninstall: {
    name: 'deno_uninstall',
    description: 'Uninstall a globally installed script',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the script to uninstall' },
        global: { type: 'boolean', description: 'Uninstall from global location' },
        root: { type: 'string', description: 'Installation root directory' },
        workingDirectory: { type: 'string', description: 'Working directory' }
      },
      required: ['name']
    },
    handler: async (args: any) => {
      try {
        const result = await denoUninstall(args);
        return {
          content: [{
            type: 'text' as const,
            text: formatCommandOutput(result)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error uninstalling script: ${error.message}\n\nStdout: ${error.stdout || 'N/A'}\nStderr: ${error.stderr || 'N/A'}`
          }],
          isError: true
        };
      }
    }
  },

  deno_outdated: {
    name: 'deno_outdated',
    description: 'Check for outdated dependencies',
    inputSchema: {
      type: 'object',
      properties: {
        update: { type: 'boolean', description: 'Update outdated dependencies' },
        workingDirectory: { type: 'string', description: 'Working directory' }
      }
    },
    handler: async (args: any) => {
      try {
        const result = await denoOutdated(args);
        return {
          content: [{
            type: 'text' as const,
            text: formatCommandOutput(result)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error checking outdated dependencies: ${error.message}\n\nStdout: ${error.stdout || 'N/A'}\nStderr: ${error.stderr || 'N/A'}`
          }],
          isError: true
        };
      }
    }
  },

  deno_init: {
    name: 'deno_init',
    description: 'Initialize a new Deno project',
    inputSchema: TOOL_SCHEMAS.deno_init,
    handler: async (args: any) => {
      try {
        const result = await denoInit(args);
        return {
          content: [{
            type: 'text' as const,
            text: formatCommandOutput(result)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error initializing project: ${error.message}\n\nStdout: ${error.stdout || 'N/A'}\nStderr: ${error.stderr || 'N/A'}`
          }],
          isError: true
        };
      }
    }
  }
};
