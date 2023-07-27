# chubbyts-uwebsockets-http-bridge

[![CI](https://github.com/chubbyts/chubbyts-uwebsockets-http-bridge/workflows/CI/badge.svg?branch=master)](https://github.com/chubbyts/chubbyts-uwebsockets-http-bridge/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/chubbyts/chubbyts-uwebsockets-http-bridge/badge.svg?branch=master)](https://coveralls.io/github/chubbyts/chubbyts-uwebsockets-http-bridge?branch=master)
[![Infection MSI](https://badge.stryker-mutator.io/github.com/chubbyts/chubbyts-uwebsockets-http-bridge/master)](https://dashboard.stryker-mutator.io/reports/github.com/chubbyts/chubbyts-uwebsockets-http-bridge/master)
[![npm-version](https://img.shields.io/npm/v/@chubbyts/chubbyts-uwebsockets-http-bridge.svg)](https://www.npmjs.com/package/@chubbyts/chubbyts-uwebsockets-http-bridge)

[![bugs](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-uwebsockets-http-bridge&metric=bugs)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-uwebsockets-http-bridge)
[![code_smells](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-uwebsockets-http-bridge&metric=code_smells)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-uwebsockets-http-bridge)
[![coverage](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-uwebsockets-http-bridge&metric=coverage)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-uwebsockets-http-bridge)
[![duplicated_lines_density](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-uwebsockets-http-bridge&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-uwebsockets-http-bridge)
[![ncloc](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-uwebsockets-http-bridge&metric=ncloc)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-uwebsockets-http-bridge)
[![sqale_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-uwebsockets-http-bridge&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-uwebsockets-http-bridge)
[![alert_status](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-uwebsockets-http-bridge&metric=alert_status)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-uwebsockets-http-bridge)
[![reliability_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-uwebsockets-http-bridge&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-uwebsockets-http-bridge)
[![security_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-uwebsockets-http-bridge&metric=security_rating)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-uwebsockets-http-bridge)
[![sqale_index](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-uwebsockets-http-bridge&metric=sqale_index)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-uwebsockets-http-bridge)
[![vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-uwebsockets-http-bridge&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-uwebsockets-http-bridge)

## Description

A uwebsockets req/res http bridge.

## Requirements

 * node: 16
 * [@chubbyts/chubbyts-http-types][2]: ^1.2.3
 * [uWebSockets.js][3]: github:uNetworking/uWebSockets.js#v20.31.0

## Installation

Through [NPM](https://www.npmjs.com) as [@chubbyts/chubbyts-uwebsockets-http-bridge][1].

```ts
npm i @chubbyts/chubbyts-uwebsockets-http-bridge@^1.2.0
```

## Usage

```ts
import {
  createServerRequestFactory,
  createStreamFromResourceFactory,
  createUriFactory,
} from '@chubbyts/chubbyts-http/dist/message-factory';
import { createResponseToUwebsocketsEmitter, createUwebsocketsToServerRequestFactory } from '@chubbyts/chubbyts-uwebsockets-http-bridge/dist/uwebsocket-http';
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

2023 Dominik Zogg

[1]: https://www.npmjs.com/package/@chubbyts/chubbyts-uwebsockets-http-bridge
[2]: https://www.npmjs.com/package/@chubbyts/chubbyts-http-types
[3]: https://github.com/uNetworking/uWebSockets.js
