FROM node:22-alpine AS builder

WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./backend/
COPY frontend/package.json frontend/package-lock.json* ./frontend/

RUN cd backend && npm ci
RUN cd frontend && npm ci

COPY backend/ ./backend/
COPY frontend/ ./frontend/

RUN cd backend && npx prisma generate && npm run build
RUN cd frontend && npm run build

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache ca-certificates

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/frontend/dist ./frontend/dist

RUN cd backend && npx prisma generate

EXPOSE 42001

ENV PORT=42001
ENV NODE_ENV=production

CMD ["node", "backend/dist/index.js"]
