FROM node:lts-alpine

ENV APP_ROOT /src

RUN mkdir ${APP_ROOT}
WORKDIR ${APP_ROOT}
ADD . ${APP_ROOT}

RUN npm ci
ENV NODE_ENV=production
# this ENV var needs to be adapted at image build time => cannot be adjusted at runtime
ENV API_URL_BROWSER=https://prefix.zazuko.com/
RUN npm run build:modern

# delete everything and only install prod dependencies
RUN npm ci --only=production

ENV HOST 0.0.0.0

USER nobody:nobody

ENTRYPOINT []

CMD ["npm", "run", "start"]

EXPOSE 3000
HEALTHCHECK CMD wget -q -O- http://localhost:3000/api/health
