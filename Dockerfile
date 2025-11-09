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
# --- Stage 3: Combine Flask + Express ---
FROM node:20-alpine
WORKDIR /app

COPY --from=express /app .
COPY --from=flask /flask /flask

# ✅ Install Python runtime and Flask deps (fixed for PEP 668 + build tools)
RUN apk add --no-cache \
      python3 py3-pip \
      build-base gfortran linux-headers \
      && pip install --no-cache-dir --break-system-packages -r /flask/requirements.txt \
      && apk del build-base gfortran linux-headers

EXPOSE 3000 5000

CMD ["sh", "-c", "python3 /flask/app.py & node server.js"]

