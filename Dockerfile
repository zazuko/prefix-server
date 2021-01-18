# First step: build the assets
FROM node:14-alpine AS builder

ARG VERSION
ARG COMMIT
ARG API_URL_BROWSER=https://prefix.zazuko.com/

RUN apk add --no-cache bash python make g++ git
RUN npm set unsafe-perm true
RUN npm install -g npm@6.14.11

WORKDIR /src

ADD package.json package-lock.json ./
# Skip Cypress binary installation
ENV CYPRESS_INSTALL_BINARY=0

ADD . .

RUN npm ci

ENV NODE_ENV=production
# this ENV var needs to be adapted at image build time => cannot be adjusted at runtime
ENV API_URL_BROWSER=${API_URL_BROWSER}
ENV APP_VERSION=${VERSION}
ENV APP_COMMIT=${COMMIT}

RUN npm run build-data
RUN npm run build:modern

# Second step: only install runtime dependencies
FROM node:14-alpine

RUN npm install -g npm@6.14.11

WORKDIR /src

ADD . .
RUN npm set unsafe-perm true
RUN npm ci --production --no-optional

# Copy the built assets from the first step
COPY --from=builder /src/.nuxt/ ./.nuxt
COPY --from=builder /src/api/datafiles ./api/datafiles

ENV HOST 0.0.0.0

USER node

ENTRYPOINT []

CMD ["npm", "run", "start"]

EXPOSE 3000
HEALTHCHECK CMD wget -q -O- http://localhost:3000/api/v1/health
