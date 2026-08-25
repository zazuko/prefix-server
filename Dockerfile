# First step: build the assets
FROM docker.io/library/node:24-alpine AS builder

ARG VERSION
ARG COMMIT
ARG API_URL_BROWSER="https://prefix.zazuko.com/"

RUN apk add --no-cache bash python3 make g++ git

WORKDIR /src

# Skip Cypress binary installation
ENV CYPRESS_INSTALL_BINARY="0"

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NODE_ENV="production"
# this ENV var needs to be adapted at image build time => cannot be adjusted at runtime
ENV API_URL_BROWSER="${API_URL_BROWSER}"
ENV APP_VERSION="${VERSION}"
ENV APP_COMMIT="${COMMIT}"

RUN npm run build-data
RUN npm run build:modern

# Second step: only install runtime dependencies
FROM docker.io/library/node:24-alpine

WORKDIR /src

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --omit=optional

COPY . .

# Copy the built assets from the first step
COPY --from=builder /src/.nuxt/ ./.nuxt
COPY --from=builder /src/api/datafiles ./api/datafiles

ENV HOST="0.0.0.0"
# `/api/v1/health` is also served on this port by a dedicated worker thread,
# so it answers even when the main thread is busy (see modules/health).
ENV HEALTH_PORT="3001"

USER node

ENTRYPOINT []

CMD ["npm", "run", "start"]

EXPOSE 3000 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -q -T 4 -O /dev/null "http://127.0.0.1:${HEALTH_PORT}/api/v1/health" || exit 1
