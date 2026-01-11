# Stage 1: Build Frontend
FROM node:18-slim AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend & Final Image
FROM node:18-slim
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --only=production

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend assets from Stage 1 to backend's public folder
COPY --from=build-frontend /app/frontend/dist ./backend/public

# Expose the port from backend server
EXPOSE 3001

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
CMD ["node", "backend/server.js"]
