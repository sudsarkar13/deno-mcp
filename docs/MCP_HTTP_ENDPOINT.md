# MCP HTTP Endpoint Documentation

## Overview

The Deno MCP Tools Server now provides an HTTP endpoint that allows you to interact with the MCP protocol over HTTP using Server-Sent Events (SSE) for streaming responses.

## Endpoint Details

- **URL**: `POST /mcp`
- **Content-Type**: `application/json`
- **Response Type**: `text/event-stream` (Server-Sent Events)
- **Protocol**: JSON-RPC 2.0 (MCP compatible)

## Features

- ✅ **Streaming Responses**: Real-time responses using Server-Sent Events
- ✅ **Full MCP Compatibility**: Supports all MCP protocol methods
- ✅ **CORS Enabled**: Cross-origin requests supported
- ✅ **Error Handling**: Comprehensive error handling with proper JSON-RPC error codes
- ✅ **Progress Updates**: Real-time progress updates for long-running operations
- ✅ **Direct Integration**: No child process overhead, direct MCP server integration

## Supported Methods

### 1. List Tools (`tools/list`)

Lists all available Deno tools.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
```

**Response Events:**
```
event: connected
data: {"type":"connection","message":"MCP HTTP stream established","timestamp":"2024-12-20T07:56:41.000+05:30"}

event: response
data: {"jsonrpc":"2.0","result":{"tools":[...]},"id":1}

event: complete
data: {"type":"completion","message":"Request processed successfully","timestamp":"2024-12-20T07:56:41.000+05:30"}
```

### 2. Call Tool (`tools/call`)

Executes a specific Deno tool.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "deno_run",
    "arguments": {
      "script": "console.log('Hello, World!');"
    }
  },
  "id": 2
}
```

**Response Events:**
```
event: connected
data: {"type":"connection","message":"MCP HTTP stream established","timestamp":"2024-12-20T07:56:41.000+05:30"}

event: progress
data: {"type":"progress","message":"Executing tool: deno_run","timestamp":"2024-12-20T07:56:41.000+05:30"}

event: response
data: {"jsonrpc":"2.0","result":{"content":[{"type":"text","text":"Hello, World!\n"}],"isError":false},"id":2}

event: complete
data: {"type":"completion","message":"Request processed successfully","timestamp":"2024-12-20T07:56:41.000+05:30"}
```

## Event Types

The endpoint streams several types of events:

### Connection Events

- **Event**: `connected`
- **Purpose**: Confirms stream establishment
- **Data**: Connection metadata

### Progress Events

- **Event**: `progress`
- **Purpose**: Updates on operation progress
- **Data**: Progress information and current status

### Response Events

- **Event**: `response`
- **Purpose**: The actual MCP response
- **Data**: JSON-RPC 2.0 formatted response

### Completion Events

- **Event**: `complete`
- **Purpose**: Signals successful completion
- **Data**: Completion metadata

### Error Events

- **Event**: `error`
- **Purpose**: Error information
- **Data**: JSON-RPC 2.0 formatted error response

## Usage Examples

### JavaScript/TypeScript (Browser)

```javascript
async function callMcpEndpoint(method, params = {}) {
  const response = await fetch('/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: Date.now()
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        const eventType = line.substring(7);
        console.log('Event type:', eventType);
      } else if (line.startsWith('data: ')) {
        const data = JSON.parse(line.substring(6));
        console.log('Event data:', data);
        
        if (eventType === 'response') {
          return data.result;
        }
      }
    }
  }
}

// List available tools
const tools = await callMcpEndpoint('tools/list');
console.log('Available tools:', tools);

// Execute a tool
const result = await callMcpEndpoint('tools/call', {
  name: 'deno_version',
  arguments: {}
});
console.log('Tool result:', result);
```

### Node.js

```javascript
const fetch = require('node-fetch');

async function callMcpEndpoint(method, params = {}) {
  const response = await fetch('http://localhost:3000/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: Date.now()
    })
  });

  return new Promise((resolve, reject) => {
    response.body.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            if (data.jsonrpc && data.result) {
              resolve(data.result);
            } else if (data.jsonrpc && data.error) {
              reject(new Error(data.error.message));
            }
          } catch (e) {
            // Ignore parse errors for non-JSON events
          }
        }
      }
    });

    response.body.on('end', () => {
      reject(new Error('Stream ended without response'));
    });
  });
}
```

### cURL

```bash
# List tools
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'

# Execute a tool
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "deno_version",
      "arguments": {}
    },
    "id": 2
  }'
```

## Error Handling

The endpoint returns standard JSON-RPC 2.0 error responses:

### Common Error Codes

- **-32700**: Parse error (invalid JSON)
- **-32600**: Invalid Request (missing jsonrpc/method)
- **-32601**: Method not found
- **-32602**: Invalid params
- **-32603**: Internal error

### Error Response Format

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32601,
    "message": "Method not found"
  },
  "id": null
}
```

## Security Considerations

- **CORS**: The endpoint allows cross-origin requests from any domain
- **Input Validation**: All JSON-RPC requests are validated
- **Error Sanitization**: Error messages are sanitized to prevent information leakage
- **Rate Limiting**: Consider implementing rate limiting for production use

## Performance

- **Direct Integration**: No child process overhead
- **Streaming**: Real-time responses via Server-Sent Events
- **Memory Efficient**: Minimal memory footprint
- **Concurrent Connections**: Supports multiple simultaneous connections

## Troubleshooting

### Common Issues

1. **405 Method Not Allowed**: Ensure you're using POST method
2. **400 Bad Request**: Check Content-Type header and JSON format
3. **503 Service Unavailable**: MCP server not initialized
4. **Stream Connection Issues**: Check firewall/proxy settings

### Debug Mode

Enable debug logging by setting the `LOG_LEVEL` environment variable:

```bash
LOG_LEVEL=debug node build/render-server.js
```

## Integration with Other Services

The HTTP endpoint can be easily integrated with:

- **Web Applications**: Direct browser integration
- **API Gateways**: Proxy MCP requests through existing APIs
- **Monitoring Systems**: Health checks and metrics collection
- **Load Balancers**: Horizontal scaling support
- **Container Orchestration**: Kubernetes/Docker integration

## Comparison with stdio Transport

| Feature | HTTP Transport | stdio Transport |
|---------|----------------|-----------------|
| Protocol | HTTP + SSE | stdio pipes |
| Streaming | ✅ Server-Sent Events | ✅ Native streams |
| Web Integration | ✅ Direct browser support | ❌ Requires proxy |
| Scalability | ✅ Multiple connections | ❌ Single connection |
| Debugging | ✅ HTTP tools support | ❌ Limited tooling |
| Performance | 🟡 HTTP overhead | ✅ Native performance |
| Complexity | 🟡 HTTP handling | ✅ Simple pipes |

## Future Enhancements

Planned improvements include:

- **WebSocket Support**: Bidirectional streaming
- **Authentication**: API key/JWT authentication
- **Rate Limiting**: Built-in rate limiting
- **Metrics**: Detailed performance metrics
- **Caching**: Response caching for frequent requests
- **Compression**: Gzip/deflate compression support
