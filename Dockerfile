# Production Dockerfile for BizFlow AtoZ Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build frontend and bundled backend
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy dist artifacts from builder
COPY --from=builder /app/dist ./dist

# Expose standard Cloud Run port
EXPOSE 8080

# Start server
CMD ["node", "dist/server.cjs"]
