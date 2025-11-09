FROM node:20-bullseye
WORKDIR /app

COPY thinkSyncBE/package*.json ./
RUN npm install

COPY thinkSyncBE .
RUN npx prisma generate

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
