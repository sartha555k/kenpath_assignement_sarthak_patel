FROM node:22-bookworm-slim

WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN npm ci --omit=dev --workspace server && npm cache clean --force

COPY --chown=node:node server ./server
RUN chmod +x ./server/docker-entrypoint.sh
USER node

EXPOSE 4000
ENTRYPOINT ["./server/docker-entrypoint.sh"]
CMD ["node", "server/src/server.js"]
