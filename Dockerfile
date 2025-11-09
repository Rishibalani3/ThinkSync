# --- Stage 1: Build Flask AI server ---
FROM python:3.11-slim AS flask
WORKDIR /flask
COPY thinkSyncAI/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY thinkSyncAI .

# --- Stage 2: Build Express backend ---
FROM node:20-alpine AS express
WORKDIR /app
COPY thinkSyncBE/package*.json ./
RUN npm install
COPY thinkSyncBE .
# Generate Prisma client
RUN npx prisma generate

# --- Stage 3: Combine Flask + Express ---
FROM node:20-bullseye   # ✅ Debian variant, larger but stable for builds
WORKDIR /app

COPY --from=express /app .
COPY --from=flask /flask /flask

# ✅ Install Python + Flask dependencies
RUN apt-get update && apt-get install -y python3 python3-pip && \
    pip install --no-cache-dir -r /flask/requirements.txt && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 3000 5000
CMD ["sh", "-c", "python3 /flask/app.py & node server.js"]


