FROM node:24.22.1-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24.22.1-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN groupadd --gid 1001 solidprint && useradd --uid 1001 --gid 1001 --create-home solidprint
COPY --from=build --chown=solidprint:solidprint /app ./
RUN mkdir -p /app/.data && chown -R solidprint:solidprint /app/.data
USER solidprint
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0"]
