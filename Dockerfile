# Multi-stage Docker build for Trace (FastAPI + React)
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend

# Copy built frontend assets to static dist directory
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8000
ENV HOST=0.0.0.0
ENV PORT=8000

WORKDIR /app/backend
CMD ["python", "main.py"]
