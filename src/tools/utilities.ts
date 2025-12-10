/**
 * Deno utility tools: upgrade, version check, permissions
 */

import {
  DenoUpgradeOptions,
  DenoCommandResult,
  TOOL_SCHEMAS,
} from "../types/index.js";
import {
  executeCommand,
  checkDenoInstallation,
  getDenoVersion,
  formatCommandOutput,
} from "../utils/command.js";

/**
 * Upgrade Deno to latest or specified version
 */
export async function denoUpgrade(
  options: DenoUpgradeOptions,
): Promise<DenoCommandResult> {
  const {
    version,
    output,
    dryRun = false,
    force = false,
    canary = false,
    workingDirectory,
    envVars,
    timeout,
  } = options;

  const commandArgs = ["upgrade"];

  // Add upgrade options
  if (version) commandArgs.push("--version", version);
  if (output) commandArgs.push("--output", output);
  if (dryRun) commandArgs.push("--dry-run");
  if (force) commandArgs.push("--force");
  if (canary) commandArgs.push("--canary");

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout,
  });
}

/**
 * Check Deno installation and version
 */
export async function checkDenoStatus(): Promise<{
  installed: boolean;
  version?: string;
  error?: string;
}> {
  try {
    const installed = await checkDenoInstallation();
    if (!installed) {
      return {
        installed: false,
        error: "Deno is not installed or not accessible",
      };
    }

    const version = await getDenoVersion();
    return { installed: true, version };
  } catch (error: any) {
    return { installed: false, error: error.message };
  }
}

/**
 * Get Deno completions for shell
 */
export async function denoCompletions(
  options: {
    shell?: "bash" | "zsh" | "fish" | "powershell" | "elvish";
    workingDirectory?: string;
    envVars?: Record<string, string>;
    timeout?: number;
  } = {},
): Promise<DenoCommandResult> {
  const { shell, workingDirectory, envVars, timeout } = options;

  const commandArgs = ["completions"];

  // Add shell option
  if (shell) commandArgs.push(shell);

  return executeCommand(commandArgs, {
    workingDirectory,
    envVars,
    timeout,
  });
}

/**
 * Tool handlers for MCP
 */
export const utilityTools = {
  deno_upgrade: {
    name: "deno_upgrade",
    description: "Upgrade Deno to latest or specified version",
    inputSchema: TOOL_SCHEMAS.deno_upgrade,
    handler: async (args: any) => {
      try {
        const result = await denoUpgrade(args);
        return {
          content: [
            {
              type: "text" as const,
              text: formatCommandOutput(result),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error upgrading Deno: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  deno_version: {
    name: "deno_version",
    description: "Check Deno installation status and version",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    handler: async (args: any) => {
      try {
        const status = await checkDenoStatus();

        if (!status.installed) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Deno is not installed or not accessible.\nError: ${status.error || "Unknown error"}\n\nTo install Deno, visit: https://deno.land/manual/getting_started/installation`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: `Deno is installed and accessible.\n\n${status.version}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error checking Deno status: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  deno_completions: {
    name: "deno_completions",
    description: "Generate shell completions for Deno",
    inputSchema: {
      type: "object",
      properties: {
        shell: {
          type: "string",
          enum: ["bash", "zsh", "fish", "powershell", "elvish"],
          description: "Shell type for completions",
        },
        workingDirectory: { type: "string", description: "Working directory" },
      },
    },
    handler: async (args: any) => {
      try {
        const result = await denoCompletions(args);
        return {
          content: [
            {
              type: "text" as const,
              text: formatCommandOutput(result),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error generating completions: ${error.message}\n\nStdout: ${error.stdout || "N/A"}\nStderr: ${error.stderr || "N/A"}`,
            },
          ],
          isError: true,
        };
      }
    },
  },
};
