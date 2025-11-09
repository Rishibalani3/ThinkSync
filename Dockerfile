# --- Stage 1: Build Flask AI server ---
FROM python:3.11-slim AS flask
WORKDIR /flask
COPY thinkSyncAI/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY thinkSyncAI .

# --- Stage 2: Build Express backend ---
FROM node:20-bullseye AS express
WORKDIR /app
COPY thinkSyncBE/package*.json ./
RUN npm install
COPY thinkSyncBE .

# ✅ Generate Prisma client and run migrations during build
RUN npx prisma generate
RUN npx prisma migrate deploy

# --- Stage 3: Combine Flask + Express ---
FROM node:20-bullseye
WORKDIR /app

# Copy Express & Flask builds
COPY --from=express /app .
COPY --from=flask /flask /flask

# ✅ Install Python + Flask dependencies
RUN apt-get update && apt-get install -y python3 python3-pip && \
    pip install --no-cache-dir -r /flask/requirements.txt && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ✅ Expose ports
EXPOSE 3000 5001

# ✅ Start both Flask & Express servers
CMD ["sh", "-c", "python3 /flask/app.py & node server.js"]
