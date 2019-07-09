# First step: build the assets
FROM node:lts-alpine AS builder

ARG APP_VERSION
ARG APP_COMMIT
ARG API_URL_BROWSER=https://prefix.zazuko.com/

WORKDIR /src

ADD package.json package-lock.json ./
# Skip Cypress binary installation
ENV CYPRESS_INSTALL_BINARY=0
RUN npm ci

ADD . .
ENV NODE_ENV=production
# this ENV var needs to be adapted at image build time => cannot be adjusted at runtime
ENV API_URL_BROWSER=${API_URL_BROWSER}
ENV APP_VERSION=${APP_VERSION}
ENV APP_COMMIT=${APP_COMMIT}

RUN npm run build:modern

# Second step: only install runtime dependencies
FROM node:lts-alpine

WORKDIR /src

ADD package.json package-lock.json ./
RUN npm ci --only=production
ADD . .

# Copy the built assets from the first step
COPY --from=builder /src/.nuxt/ ./.nuxt

ENV HOST 0.0.0.0

USER nobody:nobody

ENTRYPOINT []

CMD ["npm", "run", "start"]

EXPOSE 3000
HEALTHCHECK CMD wget -q -O- http://localhost:3000/api/v1/health
