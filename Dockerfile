# ── Build stage ── SSG 產出靜態檔案
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run generate

# ── Run stage ── nginx 託管靜態檔案 + 反向代理 /api
FROM nginx:alpine
COPY --from=build /app/.output/public /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
