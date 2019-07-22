# prefix-server
[![Build Status](https://travis-ci.org/zazuko/prefix-server.svg?branch=master)](https://travis-ci.org/zazuko/prefix-server) 

> RDF prefix / namespaces resolution

## Build Setup

```bash
# install dependencies
$ npm run install

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

## Building the resources used by the API

The resources are automatically built by `npm run build`.

They are not built by the hot-reload dev server because building the resources
takes time. For this reason, you can build them manually using `npm prepare`.
