# Deno MCP Server Docker Configuration
FROM node:20-alpine

# Install system dependencies and Deno with cross-platform support
RUN apk add --no-cache curl unzip ca-certificates \
    && case "$(uname -m)" in \
        x86_64) DENO_ARCH="x86_64" ;; \
        aarch64) DENO_ARCH="aarch64" ;; \
        *) echo "Unsupported architecture: $(uname -m)" && exit 1 ;; \
    esac \
    && DENO_VERSION="v1.47.2" \
    && curl -fsSL "https://github.com/denoland/deno/releases/download/${DENO_VERSION}/deno-${DENO_ARCH}-unknown-linux-gnu.zip" -o deno.zip \
    && unzip deno.zip \
    && chmod +x deno \
    && mv deno /usr/local/bin/deno \
    && rm deno.zip

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --ignore-scripts

# Copy built application
COPY build/ ./build/

# Make the main executable file executable
RUN chmod +x ./build/index.js

# Create a non-root user for security
RUN addgroup -g 1001 -S denouser \
    && adduser -S denouser -u 1001 \
    && chown -R denouser:denouser /app

# Create workspace directory
RUN mkdir -p /workspace && chown denouser:denouser /workspace

# Switch to non-root user
USER denouser

# Set environment variables
ENV DENO_DIR=/home/denouser/.deno
ENV PATH=/app/build:/usr/local/bin:/usr/bin:/bin

# Expose default MCP port (if applicable)
EXPOSE 3000

# Set default working directory for development
WORKDIR /workspace

# Default command to run the MCP server
CMD ["node", "/app/build/index.js"]
