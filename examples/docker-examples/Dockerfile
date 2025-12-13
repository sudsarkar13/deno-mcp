# Deno MCP Server Docker Configuration
FROM node:20-slim

# Install system dependencies and Deno with cross-platform support
RUN apt-get update && apt-get install -y curl unzip ca-certificates --no-install-recommends \
    && case "$(uname -m)" in \
        x86_64) DENO_ARCH="x86_64" ;; \
        aarch64) DENO_ARCH="aarch64" ;; \
        *) echo "Unsupported architecture: $(uname -m)" && exit 1 ;; \
    esac \
    && DENO_VERSION="v2.6.0" \
    && curl -fsSL "https://github.com/denoland/deno/releases/download/${DENO_VERSION}/deno-${DENO_ARCH}-unknown-linux-gnu.zip" -o deno.zip \
    && unzip deno.zip \
    && chmod +x deno \
    && mv deno /usr/local/bin/deno \
    && rm deno.zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

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
RUN groupadd -g 1001 denouser \
    && useradd -r -u 1001 -g denouser denouser \
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
