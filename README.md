# chubbyts-http-uwebsockets-bridge

[![CI](https://github.com/chubbyts/chubbyts-http-uwebsockets-bridge/workflows/CI/badge.svg?branch=master)](https://github.com/chubbyts/chubbyts-http-uwebsockets-bridge/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/chubbyts/chubbyts-http-uwebsockets-bridge/badge.svg?branch=master)](https://coveralls.io/github/chubbyts/chubbyts-http-uwebsockets-bridge?branch=master)
[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fchubbyts%2Fchubbyts-http-uwebsockets-bridge%2Fmaster)](https://dashboard.stryker-mutator.io/reports/github.com/chubbyts/chubbyts-http-uwebsockets-bridge/master)
[![npm-version](https://img.shields.io/npm/v/@chubbyts/chubbyts-http-uwebsockets-bridge.svg)](https://www.npmjs.com/package/@chubbyts/chubbyts-http-uwebsockets-bridge)

[![bugs](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-uwebsockets-bridge&metric=bugs)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-uwebsockets-bridge)
[![code_smells](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-uwebsockets-bridge&metric=code_smells)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-uwebsockets-bridge)
[![coverage](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-uwebsockets-bridge&metric=coverage)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-uwebsockets-bridge)
[![duplicated_lines_density](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-uwebsockets-bridge&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-uwebsockets-bridge)
[![ncloc](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-uwebsockets-bridge&metric=ncloc)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-uwebsockets-bridge)
[![sqale_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-uwebsockets-bridge&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-uwebsockets-bridge)
[![alert_status](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-uwebsockets-bridge&metric=alert_status)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-uwebsockets-bridge)
[![reliability_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-uwebsockets-bridge&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-uwebsockets-bridge)
[![security_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-uwebsockets-bridge&metric=security_rating)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-uwebsockets-bridge)
[![sqale_index](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-uwebsockets-bridge&metric=sqale_index)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-uwebsockets-bridge)
[![vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-http-uwebsockets-bridge&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-http-uwebsockets-bridge)

## Description

A uwebsockets req/res http bridge.

## Requirements

 * node: 18
 * [@chubbyts/chubbyts-http-types][2]: ^1.3.1
 * [uWebSockets.js][3]: github:uNetworking/uWebSockets.js#v20.51.0

## Installation

Through [NPM](https://www.npmjs.com) as [@chubbyts/chubbyts-http-uwebsockets-bridge][1].

```ts
npm i @chubbyts/chubbyts-http-uwebsockets-bridge@^1.3.1
```

## Usage

```ts
import {
  createServerRequestFactory,
  createStreamFromResourceFactory,
  createUriFactory,
} from '@chubbyts/chubbyts-http/dist/message-factory';
import { createResponseToUwebsocketsEmitter, createUwebsocketsToServerRequestFactory } from '@chubbyts/chubbyts-http-uwebsockets-bridge/dist/uwebsocket-http';
import { App, HttpRequest, HttpResponse } from 'uWebSockets.js';

const app = ...;

const uwebsocketsToServerRequestFactory = createUwebsocketsToServerRequestFactory(
  createUriFactory(),
  createServerRequestFactory(),
  createStreamFromResourceFactory(),
);

const responseToUwebsocketsEmitter = createResponseToUwebsocketsEmitter();

const host = '0.0.0.0';
const port = 8080;

App()
  .any('/*', async (res: HttpResponse, req: HttpRequest) => {
    // function gets excuted on abort
    // empty function means the request/response gets executed to its end
    res.onAborted(() => {});
    responseToUwebsocketsEmitter(await app(uwebsocketsToServerRequestFactory(req, res)), res);
  })
  .listen(host, port, (listenSocket: unknown) => {
    if (listenSocket) {
      console.log(`Listening to ${host}:${port}`);
    }
  });
```

## Copyright

2025 Dominik Zogg

[1]: https://www.npmjs.com/package/@chubbyts/chubbyts-http-uwebsockets-bridge
[2]: https://www.npmjs.com/package/@chubbyts/chubbyts-http-types
[3]: https://github.com/uNetworking/uWebSockets.js
