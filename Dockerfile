# First step: build the application
FROM docker.io/library/node:24-alpine AS builder

ARG VERSION
ARG COMMIT
ARG API_URL_BROWSER="https://prefix.zazuko.com/"

WORKDIR /src

# Skip Cypress binary installation
ENV CYPRESS_INSTALL_BINARY="0"

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# these ENV vars are read at build time => cannot be adjusted at runtime
ENV API_URL_BROWSER="${API_URL_BROWSER}"
ENV APP_VERSION="${VERSION}"
ENV APP_COMMIT="${COMMIT}"

RUN npm run build-data
RUN npm run build

# Second step: the self-contained server output only
FROM docker.io/library/node:24-alpine

WORKDIR /src

COPY --from=builder /src/.output ./.output

ENV NODE_ENV="production"
ENV HOST="0.0.0.0"
ENV PORT="3000"
# `/api/v1/health` is also served on this port by a dedicated worker thread,
# so it answers even when the main thread is busy (see server/plugins/health.js).
ENV HEALTH_PORT="3001"

USER node

ENTRYPOINT []

CMD ["node", ".output/server/index.mjs"]

EXPOSE 3000 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -q -T 4 -O /dev/null "http://127.0.0.1:${HEALTH_PORT}/api/v1/health" || exit 1
