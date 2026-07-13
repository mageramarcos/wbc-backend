FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime
RUN addgroup -S scraper && adduser -S scraper -G scraper
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
RUN chown -R scraper:scraper /app
USER scraper
EXPOSE 3000
CMD ["node", "dist/main"]
