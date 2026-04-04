# ═══════════════════════════════════════════════
# AeroSysMail Backend — Production Dockerfile
# ═══════════════════════════════════════════════
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

# Create public dir for frontend static files
RUN mkdir -p public

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

EXPOSE 3000
CMD ["node", "api/server.js"]
