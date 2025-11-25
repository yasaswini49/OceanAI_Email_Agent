# Frontend Dockerfile for OceanAI Email Agent
# Multi-stage build for optimized production image

# Stage 1: Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tailwind.config.js ./
COPY public/ ./public/
COPY src/ ./src/

# Install dependencies
RUN npm install

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to serve the built application
RUN npm install -g serve

# Copy built application from builder
COPY --from=builder /app/build ./build

# Create non-root user for security
RUN addgroup appuser && \
    adduser -D -G appuser appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Set environment variables
ENV REACT_APP_API_URL=http://localhost:5000/api \
    NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]
