FROM node:22-bookworm-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN npm ci --workspace client

COPY client ./client
ARG APP_TIMEZONE=Asia/Kolkata
ENV VITE_API_URL=/api
ENV VITE_APP_TIMEZONE=${APP_TIMEZONE}
RUN npm run build --workspace client

FROM nginx:1.30.6-alpine AS runtime
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 8080
