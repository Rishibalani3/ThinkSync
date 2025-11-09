# ---------- Express Backend ----------
FROM node:20-bullseye

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose app port
EXPOSE 3000

# Start command
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
