# ---- Base Stage ----
FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./

# ---- Development Stage ----
FROM base AS development

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev:docker"]

# ---- Build Stage ----
FROM base AS build

RUN npm ci

COPY . .

RUN npm run build

# ---- Production Stage ----
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]


