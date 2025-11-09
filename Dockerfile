FROM python:3.11-slim AS flask
WORKDIR /flask
COPY thinkSyncAI/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY thinkSyncAI .

FROM node:20-bullseye AS express
WORKDIR /app
COPY thinkSyncBE/package*.json ./
RUN npm install
COPY thinkSyncBE .
RUN npx prisma generate 

FROM node:20-bullseye
WORKDIR /app

COPY --from=express /app .
COPY --from=flask /flask /flask

RUN apt-get update && apt-get install -y python3 python3-pip && \
    pip install --no-cache-dir -r /flask/requirements.txt && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 3000 5001

CMD ["sh", "-c", "npx prisma migrate deploy && python3 /flask/app.py & node server.js"]
