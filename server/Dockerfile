# ───── Étape 1 : dépendances ─────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# ───── Étape 2 : build ─────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ───── Étape 3 : production (légère) ─────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle       
COPY --from=builder /app/drizzle.config.ts ./    
COPY package*.json ./
RUN npm pkg delete scripts.prepare && npm ci --omit=dev && npm cache clean --force
EXPOSE 3000
CMD ["node", "dist/server.js"]

# ───── Étape dev (utilisée par docker-compose.yml) ─────
FROM node:20-alpine AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
