#!/usr/bin/env node

/**
 * Deno MCP Tools Server
 *
 * A comprehensive MCP server that provides access to the complete Deno CLI toolchain
 * including execution, testing, formatting, linting, compilation, and deployment capabilities
 * through the Model Context Protocol.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

// Import all tool categories
import { executionTools } from "./tools/execution.js";
import { developmentTools } from "./tools/development.js";
import { dependencyTools } from "./tools/dependencies.js";
import { compilationTools } from "./tools/compilation.js";
import { utilityTools } from "./tools/utilities.js";
import { checkDenoInstallation } from "./utils/command.js";

/**
 * Combine all tool handlers
 */
const allTools = {
  ...executionTools,
  ...developmentTools,
  ...dependencyTools,
  ...compilationTools,
  ...utilityTools,
};

/**
 * Create and configure the MCP server
 */
const server = new Server(
  {
    name: "@sudsarkar13/deno-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

/**
 * Validate arguments against a schema
 */
function validateArguments(args: any, schema: any): boolean {
  if (!schema || !schema.properties) return true;

  // Check required properties
  if (schema.required) {
    for (const required of schema.required) {
      if (!(required in args)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Missing required parameter: ${required}`,
        );
      }
    }
  }

  // Basic type checking for known properties
  for (const [key, value] of Object.entries(args)) {
    const propSchema = schema.properties[key];
    if (!propSchema) continue;

    if (propSchema.type === "string" && typeof value !== "string") {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Parameter ${key} must be a string`,
      );
    }

    if (propSchema.type === "number" && typeof value !== "number") {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Parameter ${key} must be a number`,
      );
    }

    if (propSchema.type === "boolean" && typeof value !== "boolean") {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Parameter ${key} must be a boolean`,
      );
    }

    if (propSchema.type === "array" && !Array.isArray(value)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Parameter ${key} must be an array`,
      );
    }
  }

  return true;
}

/**
 * List all available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // Check if Deno is installed before listing tools
  const denoInstalled = await checkDenoInstallation();

  if (!denoInstalled) {
    return {
      tools: [
        {
          name: "deno_version",
          description:
            "⚠️ Deno not found! Use this tool to check installation status and get installation instructions.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
        },
      ],
    };
  }

  return {
    tools: Object.values(allTools).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

/**
 * Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Find the tool handler
  const tool = allTools[name as keyof typeof allTools];
  if (!tool) {
    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  }

  try {
    // Validate arguments
    validateArguments(args || {}, tool.inputSchema);

    // Execute the tool
    const result = await tool.handler(args || {});
    return result;
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    // Handle unexpected errors
    console.error(`Error executing tool ${name}:`, error);
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
});

/**
 * Error handling
 */
server.onerror = (error) => {
  console.error("[MCP Error]", error);
};

/**
 * Graceful shutdown
 */
process.on("SIGINT", async () => {
  console.error("Shutting down Deno MCP Tools server...");
  await server.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.error("Shutting down Deno MCP Tools server...");
  await server.close();
  process.exit(0);
});

/**
 * Start the server
 */
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Deno MCP Tools server running on stdio");
    console.error(
      "Server capabilities: Comprehensive Deno CLI toolchain access",
    );
    console.error(
      "Available tool categories: execution, development, dependencies, compilation, utilities",
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
main().catch((error) => {
  console.error("Server startup error:", error);
  process.exit(1);
});
