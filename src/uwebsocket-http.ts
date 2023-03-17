import { HttpRequest, HttpResponse } from 'uWebSockets.js';
import { Method, Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import {
  ServerRequestFactory,
  StreamFromResourceFactory,
  UriFactory,
} from '@chubbyts/chubbyts-http-types/dist/message-factory';
import { Duplex, PassThrough } from 'stream';

type UriOptions =
  | {
      schema?: 'http' | 'https';
      host?: string;
    }
  | 'forwarded';

const getUri = (req: HttpRequest, uriOptions: UriOptions): string => {
  const query = req.getQuery();
  const pathAndQuery = req.getUrl() + (query ? `?${query}` : '');

  if (uriOptions === 'forwarded') {
    const headers = Object.fromEntries(
      ['x-forwarded-proto', 'x-forwarded-host', 'x-forwarded-port'].map((name) => [name, req.getHeader(name)]),
    );

    const missingHeaders = Object.keys(headers).filter((name) => !headers[name]);

    if (missingHeaders.length) {
      throw new Error(`Missing "${missingHeaders.join('", "')}" header(s).`);
    }

    const { 'x-forwarded-proto': schema, 'x-forwarded-host': host, 'x-forwarded-port': port } = headers;

    return `${schema}://${host}:${port}${pathAndQuery}`;
  }

  const hostHeader = req.getHeader('host');
  const schema = uriOptions.schema ?? 'http';
  const host = uriOptions.host ?? (hostHeader || 'localhost');

  return `${schema}://${host}${pathAndQuery}`;
};

const normalizeHeader = (header: string): string[] => {
  return header
    .split(',')
    .map((headerPart) => headerPart.trim())
    .filter((headerPart) => headerPart);
};

const getBody = (res: HttpResponse): Duplex => {
  const stream = new PassThrough();

  res.onData((chunk: ArrayBuffer, isLast: boolean) => {
    stream.write(Buffer.from(chunk));

    if (isLast) {
      stream.end();
    }
  });

  return stream;
};

type UwebsocketsToServerRequestFactory = (req: HttpRequest, res: HttpResponse) => ServerRequest;

export const createUwebsocketsToServerRequestFactory = (
  uriFactory: UriFactory,
  serverRequestFactory: ServerRequestFactory,
  streamFromResourceFactory: StreamFromResourceFactory,
  uriOptions: UriOptions = {},
): UwebsocketsToServerRequestFactory => {
  return (req: HttpRequest, res: HttpResponse): ServerRequest => {
    const headers: Record<string, Array<string>> = {};

    req.forEach((name, value) => {
      const normalizedHeaders = normalizeHeader(value);
      if (normalizedHeaders.length) {
        headers[name] = normalizedHeaders;
      }
    });

    return {
      ...serverRequestFactory(req.getMethod().toUpperCase() as Method, uriFactory(getUri(req, uriOptions))),
      protocolVersion: '1.1',
      body: streamFromResourceFactory(getBody(res)),
      headers,
    };
  };
};

type ResponseToUwebsocketsEmitter = (response: Response, res: HttpResponse) => void;

export const createResponseToUwebsocketsEmitter = (): ResponseToUwebsocketsEmitter => {
  return (response: Response, res: HttpResponse): void => {
    res.writeStatus(`${response.status} ${response.reasonPhrase}`);

    Object.entries(response.headers).forEach(([name, value]) => {
      res.writeHeader(name, value.join(', '));
    });

    response.body.on('data', (data: Buffer) => res.write(data));
    response.body.on('end', () => res.end());
  };
};
