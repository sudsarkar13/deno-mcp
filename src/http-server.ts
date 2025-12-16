#!/usr/bin/env node

/**
 * HTTP-enabled Deno MCP Tools Server
 * 
 * This server provides HTTP access to the Deno MCP Tools through StreamableHTTP transport,
 * making it accessible via web URLs for MCP client configuration.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { randomUUID } from "node:crypto";
import { InMemoryEventStore } from "@modelcontextprotocol/sdk/examples/shared/inMemoryEventStore.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { Request, Response } from "express";

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
 * Create and configure the MCP server
 */
function createMcpServer() {
  const server = new Server(
    {
      name: "@sudsarkar13/deno-mcp",
      version: "1.0.7",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

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

  return server;
}

// Configuration
const MCP_PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = "0.0.0.0";

// Create Express app with MCP support
const app = createMcpExpressApp();

// Map to store transports by session ID
const transports: Record<string, StreamableHTTPServerTransport> = {};

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    server: '@sudsarkar13/deno-mcp',
    version: '1.0.7',
    timestamp: new Date().toISOString(),
    transport: 'HTTP',
    endpoints: {
      mcp: '/mcp',
      health: '/health',
      status: '/'
    }
  });
});

/**
 * Status page
 */
app.get('/', (req, res) => {
  const statusHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Deno MCP Tools Server - HTTP Transport</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status { padding: 20px; border-radius: 4px; margin: 20px 0; background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .info-card { background: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff; }
        .info-card h3 { margin: 0 0 10px 0; color: #495057; }
        .info-card p { margin: 5px 0; color: #6c757d; }
        h1 { color: #343a40; margin-bottom: 10px; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
        .endpoint { background: #e9ecef; padding: 10px; border-radius: 4px; margin: 10px 0; font-family: monospace; }
        .config-example { background: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 4px solid #28a745; margin: 20px 0; }
        .config-example pre { margin: 0; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🦕 Deno MCP Tools Server</h1>
        <p class="timestamp">HTTP Transport Mode - Last updated: ${new Date().toISOString()}</p>
        
        <div class="status">
            <strong>Status: Online and Ready</strong><br>
            This server provides HTTP access to Deno development tools through the Model Context Protocol.
        </div>

        <div class="info-grid">
            <div class="info-card">
                <h3>Server Info</h3>
                <p><strong>Name:</strong> @sudsarkar13/deno-mcp</p>
                <p><strong>Version:</strong> 1.0.7</p>
                <p><strong>Transport:</strong> StreamableHTTP</p>
                <p><strong>Port:</strong> ${MCP_PORT}</p>
            </div>
            
            <div class="info-card">
                <h3>Runtime</h3>
                <p><strong>Node.js:</strong> ${process.version}</p>
                <p><strong>Platform:</strong> ${process.platform}</p>
                <p><strong>Architecture:</strong> ${process.arch}</p>
                <p><strong>Environment:</strong> ${process.env.NODE_ENV || "production"}</p>
            </div>
            
            <div class="info-card">
                <h3>Active Sessions</h3>
                <p><strong>Count:</strong> ${Object.keys(transports).length}</p>
                <p><strong>Session IDs:</strong></p>
                <p style="font-family: monospace; font-size: 0.8em;">
                  ${Object.keys(transports).length > 0 ? Object.keys(transports).join('<br>') : 'None'}
                </p>
            </div>
            
            <div class="info-card">
                <h3>Available Tools</h3>
                <p><strong>Execution:</strong> run, serve, task, repl, eval</p>
                <p><strong>Development:</strong> fmt, lint, check, test, bench</p>
                <p><strong>Dependencies:</strong> add, remove, install, outdated</p>
                <p><strong>Compilation:</strong> compile, doc, info, types</p>
                <p><strong>Utilities:</strong> upgrade, version, completions</p>
            </div>
        </div>

        <div style="margin-top: 30px;">
            <h3>🔌 MCP Client Configuration</h3>
            <p>Use this URL to configure MCP clients:</p>
            <div class="endpoint">https://deno.mcp.sudeeptasarkar.in/mcp</div>
            
            <div class="config-example">
                <h4>Claude Desktop Configuration:</h4>
                <pre>{
  "mcpServers": {
    "deno-tools": {
      "command": "node",
      "args": ["-e", "
        const http = require('http');
        const options = {
          hostname: 'deno.mcp.sudeeptasarkar.in',
          port: 443,
          path: '/mcp',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        };
        process.stdin.pipe(http.request(options, res => res.pipe(process.stdout)));
      "]
    }
  }
}</pre>
            </div>
        </div>

        <div style="margin-top: 30px; padding: 15px; background: #e9ecef; border-radius: 4px;">
            <h3>📋 Available Endpoints</h3>
            <ul>
                <li><strong>POST /mcp</strong> - MCP protocol endpoint (JSON-RPC over HTTP)</li>
                <li><strong>GET /mcp</strong> - Server-Sent Events stream for real-time updates</li>
                <li><strong>DELETE /mcp</strong> - Session termination</li>
                <li><strong>GET /health</strong> - Health check (JSON)</li>
                <li><strong>GET /</strong> - This status page</li>
            </ul>
        </div>
    </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(statusHtml);
});

/**
 * MCP POST endpoint handler
 */
const mcpPostHandler = async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string;
  
  if (sessionId) {
    console.log(`Received MCP request for session: ${sessionId}`);
  } else {
    console.log('New MCP request:', req.body?.method || 'unknown method');
  }

  try {
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request
      const eventStore = new InMemoryEventStore();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        eventStore, // Enable resumability
        onsessioninitialized: (sessionId: string) => {
          console.log(`Session initialized with ID: ${sessionId}`);
          transports[sessionId] = transport;
        }
      });

      // Set up onclose handler to clean up transport when closed
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports[sid]) {
          console.log(`Transport closed for session ${sid}`);
          delete transports[sid];
        }
      };

      // Connect the transport to the MCP server
      const server = createMcpServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    } else {
      // Invalid request
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided or not an initialization request'
        },
        id: null
      });
      return;
    }

    // Handle the request with existing transport
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error'
        },
        id: null
      });
    }
  }
};

/**
 * MCP GET endpoint handler (for SSE streams)
 */
const mcpGetHandler = async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string;
  
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  console.log(`SSE stream requested for session ${sessionId}`);
  
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
};

/**
 * MCP DELETE endpoint handler (for session termination)
 */
const mcpDeleteHandler = async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string;
  
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  console.log(`Session termination requested for session ${sessionId}`);
  
  try {
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error('Error handling session termination:', error);
    if (!res.headersSent) {
      res.status(500).send('Error processing session termination');
    }
  }
};

// Set up MCP routes
app.post('/mcp', mcpPostHandler);
app.get('/mcp', mcpGetHandler);
app.delete('/mcp', mcpDeleteHandler);

/**
 * Start the HTTP server
 */
const server = app.listen(MCP_PORT, HOST, () => {
  console.log(`🚀 Deno MCP Tools Server (HTTP Transport) listening on http://${HOST}:${MCP_PORT}`);
  console.log(`📋 Status page: http://${HOST}:${MCP_PORT}/`);
  console.log(`🔌 MCP endpoint: http://${HOST}:${MCP_PORT}/mcp`);
  console.log(`❤️ Health check: http://${HOST}:${MCP_PORT}/health`);
  console.log(`🦕 Ready to serve Deno development tools via HTTP!`);
});

/**
 * Graceful shutdown
 */
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully...`);

  // Close all active transports
  for (const sessionId in transports) {
    try {
      console.log(`Closing transport for session ${sessionId}`);
      await transports[sessionId].close();
      delete transports[sessionId];
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }

  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force exit after timeout
  setTimeout(() => {
    console.log('Force exiting...');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});
