FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma/
COPY . .
RUN npx prisma generate
RUN npm run build

# --- STAGE RUN ---
FROM node:20-bookworm-slim
WORKDIR /app
RUN npx playwright install-deps
COPY --from=build /app/package*.json ./
RUN npx playwright install chromium
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]