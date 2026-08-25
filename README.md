# prefix-server
[![Build Status](https://travis-ci.org/zazuko/prefix-server.svg?branch=master)](https://travis-ci.org/zazuko/prefix-server) 

> RDF prefix / namespaces resolution

## Build Setup

```bash
# install dependencies
$ npm ci
$ npm run build-data

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start
```

## Tests

```bash
# run the dev server
$ npm run dev

# run the tests in a window
$ npm run e2e:open

## OR

# run the tests headless
$ npm run e2e:test
```

## Health checks

`GET /api/v1/health` answers `"ok"` with a `200` status code. It is exposed twice:

- on the main port (`3000` by default), registered before any other server
  middleware. It still runs on the main event loop, so it can only answer once
  the main thread is free.
- on a dedicated port (`3001` by default), served by a **worker thread** with its
  own event loop. It answers immediately even when the main thread is busy
  rendering pages or running searches. Point liveness/readiness probes at this
  one; the Docker image's `HEALTHCHECK` already does.

The dedicated endpoint also watches the main thread: if it stops showing signs
of life for more than `HEALTH_MAX_STALL_MS`, the endpoint answers `503` with a
JSON body describing the problem, so a hung process still gets restarted.

| Variable              | Default                 | Description                                                   |
| --------------------- | ----------------------- | ------------------------------------------------------------- |
| `HEALTH_PORT`         | `3001`                  | Port of the dedicated health server                           |
| `HEALTH_HOST`         | same as the main server | Host the dedicated health server binds to                     |
| `HEALTH_MAX_STALL_MS` | `30000`                 | Report `503` once the main thread stalls that long (`0` = off) |

## Building the resources used by the API

The resources can be rebuilt using `npm run build-data`.

They are not built by the hot-reload dev server because building the resources
takes time.
