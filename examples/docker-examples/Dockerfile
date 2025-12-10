# Deno MCP Server Docker Configuration
FROM node:20-alpine

# Install Deno
RUN apk add --no-cache curl unzip \
    && curl -fsSL https://deno.land/install.sh | sh \
    && mv /root/.deno/bin/deno /usr/local/bin/deno \
    && chmod +x /usr/local/bin/deno

# Set working directory
WORKDIR /app

# Install the MCP server globally
RUN npm install -g @sudsarkar13/deno-mcp

# Create a non-root user for security
RUN addgroup -g 1001 -S denouser \
    && adduser -S denouser -u 1001

# Create workspace directory
RUN mkdir -p /workspace && chown denouser:denouser /workspace

# Switch to non-root user
USER denouser

# Set environment variables
ENV DENO_DIR=/home/denouser/.deno
ENV PATH=/usr/local/bin:/usr/bin:/bin

# Expose default MCP port (if applicable)
EXPOSE 3000

# Set default working directory for development
WORKDIR /workspace

# Default command to run the MCP server
CMD ["deno-mcp"]
