import { describe, expect, test } from '@jest/globals';
import { Duplex, PassThrough, Stream } from 'stream';
import { Response, ServerRequest, Uri } from '@chubbyts/chubbyts-http-types/dist/message';
import {
  ServerRequestFactory,
  StreamFromResourceFactory,
  UriFactory,
} from '@chubbyts/chubbyts-http-types/dist/message-factory';
import { createUwebsocketsToServerRequestFactory, createResponseToUwebsocketsEmitter } from '../src/uwebsocket-http';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';
import { Blob } from 'buffer';

const readStream = async (stream: Stream) => {
  return new Promise((resolve, reject) => {
    let data = '';

    stream.on('data', (chunk) => (data += chunk));
    stream.on('end', () => resolve(data));
    stream.on('error', (error) => reject(error));
  });
};

describe('uwebsocket-http', () => {
  describe('createUwebsocketsToServerRequestFactory', () => {
    test('without uriOptions and without host', async () => {
      const headers: Record<string, string> = {
        key1: '   value1',
        key2: 'value2     ',
        key3: 'value3,                                                 value4',
        key4: ',value9',
        key5: ',value12, , ',
        key6: ' ',
        key7: ' ',
      };

      const forEach = jest.fn((callback: (name: string, value: string) => void): void => {
        Object.entries(headers).forEach(([name, value]) => {
          callback(name, value);
        });
      });
      const getMethod = jest.fn(() => 'get');
      const getQuery = jest.fn(() => 'key=value');
      const getUrl = jest.fn(() => '/api');
      const getHeader = jest.fn((name: string) => headers[name] || '');

      const req = {
        forEach,
        getMethod,
        getQuery,
        getUrl,
        getHeader,
      } as unknown as HttpRequest;

      const onData = jest.fn((callback: (chunk: ArrayBuffer, isLast: boolean) => void): void => {
        setTimeout(async () => {
          callback(await new Blob(['te'], { type: 'text/plain; charset=utf-8' }).arrayBuffer(), false);
          callback(await new Blob(['st'], { type: 'text/plain; charset=utf-8' }).arrayBuffer(), true);
        }, 100);
      });

      const res = {
        onData,
      } as unknown as HttpResponse;

      const uri = {
        query: { key: 'value' },
      } as unknown as Uri;

      const stream = new Duplex();

      const serverRequest = {
        body: stream,
        uri,
      } as ServerRequest;

      const uriFactory: UriFactory = jest.fn((givenUri: string): Uri => {
        expect(givenUri).toBe('http://localhost/api?key=value');

        return uri;
      });

      const serverRequestFactory: ServerRequestFactory = jest.fn(
        (givenMethod: string, givenUri: Uri | string): ServerRequest => {
          expect(givenMethod).toBe('GET');
          expect(givenUri).toBe(uri);

          return serverRequest;
        },
      );

      const streamFromResourceFactory: StreamFromResourceFactory = jest.fn((givenStream: Stream): Duplex => {
        return givenStream as Duplex;
      });

      const uwebsocketsToServerRequestFactory = createUwebsocketsToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
      );

      const { body, ...rest } = uwebsocketsToServerRequestFactory(req, res);

      expect(body).toBeInstanceOf(Stream);

      expect(await readStream(body)).toBe('test');

      expect(rest).toMatchInlineSnapshot(`
        {
          "headers": {
            "key1": [
              "value1",
            ],
            "key2": [
              "value2",
            ],
            "key3": [
              "value3",
              "value4",
            ],
            "key4": [
              "value9",
            ],
            "key5": [
              "value12",
            ],
          },
          "protocolVersion": "1.1",
          "uri": {
            "query": {
              "key": "value",
            },
          },
        }
      `);

      expect(forEach).toHaveBeenCalledTimes(1);
      expect(getMethod).toHaveBeenCalledTimes(1);
      expect(getQuery).toHaveBeenCalledTimes(1);
      expect(getUrl).toHaveBeenCalledTimes(1);
      expect(getHeader).toHaveBeenCalledTimes(1);
      expect(onData).toHaveBeenCalledTimes(1);

      expect(serverRequestFactory).toHaveBeenCalledTimes(1);
      expect(uriFactory).toHaveBeenCalledTimes(1);
      expect(streamFromResourceFactory).toHaveBeenCalledTimes(1);
    });

    test('without uriOptions', () => {
      const headers: Record<string, string> = {
        host: 'localhost:10080',
      };

      const forEach = jest.fn((callback: (name: string, value: string) => void): void => {
        Object.entries({
          key1: 'value1',
        }).forEach(([name, value]) => {
          callback(name, value);
        });
      });
      const getMethod = jest.fn(() => 'get');
      const getQuery = jest.fn(() => '');
      const getUrl = jest.fn(() => '/api');
      const getHeader = jest.fn((name: string) => headers[name] || '');

      const req = {
        forEach,
        getMethod,
        getQuery,
        getUrl,
        getHeader,
      } as unknown as HttpRequest;

      const onData = jest.fn((callback: (chunk: ArrayBuffer, isLast: boolean) => void): void => {});

      const res = {
        onData,
      } as unknown as HttpResponse;

      const uri = {
        query: { key: 'value' },
      } as unknown as Uri;

      const stream = new Duplex();

      const serverRequest = {
        body: stream,
        uri,
      } as ServerRequest;

      const uriFactory: UriFactory = jest.fn((givenUri: string): Uri => {
        expect(givenUri).toBe('http://localhost:10080/api');

        return uri;
      });

      const serverRequestFactory: ServerRequestFactory = jest.fn(
        (givenMethod: string, givenUri: Uri | string): ServerRequest => {
          expect(givenMethod).toBe('GET');
          expect(givenUri).toBe(uri);

          return serverRequest;
        },
      );

      const streamFromResourceFactory: StreamFromResourceFactory = jest.fn((givenStream: Stream): Duplex => {
        return givenStream as Duplex;
      });

      const uwebsocketsToServerRequestFactory = createUwebsocketsToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
      );

      const { body, ...rest } = uwebsocketsToServerRequestFactory(req, res);

      expect(body).toBeInstanceOf(Stream);

      expect(rest).toMatchInlineSnapshot(`
        {
          "headers": {
            "key1": [
              "value1",
            ],
          },
          "protocolVersion": "1.1",
          "uri": {
            "query": {
              "key": "value",
            },
          },
        }
      `);

      expect(forEach).toHaveBeenCalledTimes(1);
      expect(getMethod).toHaveBeenCalledTimes(1);
      expect(getQuery).toHaveBeenCalledTimes(1);
      expect(getUrl).toHaveBeenCalledTimes(1);
      expect(getHeader).toHaveBeenCalledTimes(1);
      expect(onData).toHaveBeenCalledTimes(1);

      expect(serverRequestFactory).toHaveBeenCalledTimes(1);
      expect(uriFactory).toHaveBeenCalledTimes(1);
      expect(streamFromResourceFactory).toHaveBeenCalledTimes(1);
    });

    test('with uriOptions scheme and host', () => {
      const headers: Record<string, string> = {};

      const forEach = jest.fn((callback: (name: string, value: string) => void): void => {
        Object.entries({
          key1: 'value1',
        }).forEach(([name, value]) => {
          callback(name, value);
        });
      });
      const getMethod = jest.fn(() => 'get');
      const getQuery = jest.fn(() => '');
      const getUrl = jest.fn(() => '/api');
      const getHeader = jest.fn((name: string) => headers[name] || '');

      const req = {
        forEach,
        getMethod,
        getQuery,
        getUrl,
        getHeader,
      } as unknown as HttpRequest;

      const onData = jest.fn((callback: (chunk: ArrayBuffer, isLast: boolean) => void): void => {});

      const res = {
        onData,
      } as unknown as HttpResponse;

      const uri = {
        query: { key: 'value' },
      } as unknown as Uri;

      const stream = new Duplex();

      const serverRequest = {
        body: stream,
        uri,
      } as ServerRequest;

      const uriFactory: UriFactory = jest.fn((givenUri: string): Uri => {
        expect(givenUri).toBe('https://some-host/api');

        return uri;
      });

      const serverRequestFactory: ServerRequestFactory = jest.fn(
        (givenMethod: string, givenUri: Uri | string): ServerRequest => {
          expect(givenMethod).toBe('GET');
          expect(givenUri).toBe(uri);

          return serverRequest;
        },
      );

      const streamFromResourceFactory: StreamFromResourceFactory = jest.fn((givenStream: Stream): Duplex => {
        return givenStream as Duplex;
      });

      const uwebsocketsToServerRequestFactory = createUwebsocketsToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
        { schema: 'https', host: 'some-host' },
      );

      const { body, ...rest } = uwebsocketsToServerRequestFactory(req, res);

      expect(body).toBeInstanceOf(Stream);

      expect(rest).toMatchInlineSnapshot(`
        {
          "headers": {
            "key1": [
              "value1",
            ],
          },
          "protocolVersion": "1.1",
          "uri": {
            "query": {
              "key": "value",
            },
          },
        }
      `);

      expect(forEach).toHaveBeenCalledTimes(1);
      expect(getMethod).toHaveBeenCalledTimes(1);
      expect(getQuery).toHaveBeenCalledTimes(1);
      expect(getUrl).toHaveBeenCalledTimes(1);
      expect(getHeader).toHaveBeenCalledTimes(1);
      expect(onData).toHaveBeenCalledTimes(1);

      expect(serverRequestFactory).toHaveBeenCalledTimes(1);
      expect(uriFactory).toHaveBeenCalledTimes(1);
      expect(streamFromResourceFactory).toHaveBeenCalledTimes(1);
    });

    test('with uriOptions forwarded, but missing related headers', () => {
      const headers: Record<string, string> = {};

      const forEach = jest.fn();
      const getMethod = jest.fn(() => 'get');
      const getQuery = jest.fn(() => 'key=value');
      const getUrl = jest.fn(() => '/api');
      const getHeader = jest.fn((name: string) => headers[name] || '');

      const req = {
        forEach,
        getMethod,
        getQuery,
        getUrl,
        getHeader,
      } as unknown as HttpRequest;

      const onData = jest.fn((callback: (chunk: ArrayBuffer, isLast: boolean) => void): void => {});

      const res = {
        onData,
      } as unknown as HttpResponse;

      const uri = {
        query: { key: 'value' },
      } as unknown as Uri;

      const stream = new Duplex();

      const serverRequest = {
        body: stream,
        uri,
      } as ServerRequest;

      const uriFactory: UriFactory = jest.fn();
      const serverRequestFactory: ServerRequestFactory = jest.fn();
      const streamFromResourceFactory: StreamFromResourceFactory = jest.fn();

      const uwebsocketsToServerRequestFactory = createUwebsocketsToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
        'forwarded',
      );

      try {
        uwebsocketsToServerRequestFactory(req, res);
        fail('expect error');
      } catch (e) {
        expect(e).toMatchInlineSnapshot(
          `[Error: Missing "x-forwarded-proto", "x-forwarded-host", "x-forwarded-port" header(s).]`,
        );
      }

      expect(forEach).toHaveBeenCalledTimes(1);
      expect(getMethod).toHaveBeenCalledTimes(1);
      expect(getQuery).toHaveBeenCalledTimes(1);
      expect(getUrl).toHaveBeenCalledTimes(1);
      expect(getHeader).toHaveBeenCalledTimes(3);
      expect(onData).toHaveBeenCalledTimes(0);

      expect(serverRequestFactory).toHaveBeenCalledTimes(0);
      expect(uriFactory).toHaveBeenCalledTimes(0);
      expect(streamFromResourceFactory).toHaveBeenCalledTimes(0);
    });

    test('with uriOptions forwarded', () => {
      const headers: Record<string, string> = {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'localhost',
        'x-forwarded-port': '10443',
      };

      const forEach = jest.fn((callback: (name: string, value: string) => void): void => {
        Object.entries({
          key1: 'value1',
        }).forEach(([name, value]) => {
          callback(name, value);
        });
      });
      const getMethod = jest.fn(() => 'get');
      const getQuery = jest.fn(() => 'key=value');
      const getUrl = jest.fn(() => '/api');
      const getHeader = jest.fn((name: string) => headers[name] || '');

      const req = {
        forEach,
        getMethod,
        getQuery,
        getUrl,
        getHeader,
      } as unknown as HttpRequest;

      const onData = jest.fn((callback: (chunk: ArrayBuffer, isLast: boolean) => void): void => {});

      const res = {
        onData,
      } as unknown as HttpResponse;

      const uri = {
        query: { key: 'value' },
      } as unknown as Uri;

      const stream = new Duplex();

      const serverRequest = {
        body: stream,
        uri,
      } as ServerRequest;

      const uriFactory: UriFactory = jest.fn((givenUri: string): Uri => {
        expect(givenUri).toBe('https://localhost:10443/api?key=value');

        return uri;
      });

      const serverRequestFactory: ServerRequestFactory = jest.fn(
        (givenMethod: string, givenUri: Uri | string): ServerRequest => {
          expect(givenMethod).toBe('GET');
          expect(givenUri).toBe(uri);

          return serverRequest;
        },
      );

      const streamFromResourceFactory: StreamFromResourceFactory = jest.fn((givenStream: Stream): Duplex => {
        return givenStream as Duplex;
      });

      const uwebsocketsToServerRequestFactory = createUwebsocketsToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
        'forwarded',
      );

      const { body, ...rest } = uwebsocketsToServerRequestFactory(req, res);

      expect(body).toBeInstanceOf(Stream);

      expect(rest).toMatchInlineSnapshot(`
        {
          "headers": {
            "key1": [
              "value1",
            ],
          },
          "protocolVersion": "1.1",
          "uri": {
            "query": {
              "key": "value",
            },
          },
        }
      `);

      expect(forEach).toHaveBeenCalledTimes(1);
      expect(getMethod).toHaveBeenCalledTimes(1);
      expect(getQuery).toHaveBeenCalledTimes(1);
      expect(getUrl).toHaveBeenCalledTimes(1);
      expect(getHeader).toHaveBeenCalledTimes(3);
      expect(onData).toHaveBeenCalledTimes(1);

      expect(serverRequestFactory).toHaveBeenCalledTimes(1);
      expect(uriFactory).toHaveBeenCalledTimes(1);
      expect(streamFromResourceFactory).toHaveBeenCalledTimes(1);
    });
  });

  test('createResponseToUwebsocketsEmitter', async () => {
    const body = new PassThrough();

    body.write('{"key":"value"}');
    body.end();

    const response = {
      status: 200,
      reasonPhrase: 'OK',
      headers: {
        key1: ['value11', 'value12'],
      },
      body,
    } as unknown as Response;

    const writeStatus = jest.fn((status: string) => {
      expect(status).toBe('200 OK');
    });
    const writeHeader = jest.fn((key: string, value: string) => {
      expect(key).toBe('key1');
      expect(value).toBe('value11, value12');
    });
    const write = jest.fn((buffer: ArrayBuffer) => {
      expect(new TextDecoder('utf-8').decode(buffer)).toBe('{"key":"value"}');
    });
    const end = jest.fn((text: string) => {});

    const res = {
      writeStatus,
      writeHeader,
      write,
      end,
    } as unknown as HttpResponse;

    const responseToUwebsocketsEmitter = createResponseToUwebsocketsEmitter();

    responseToUwebsocketsEmitter(response, res);

    await new Promise<void>((resolve) => {
      response.body.on('end', () => resolve());
    });

    expect(writeStatus).toHaveBeenCalledTimes(1);
    expect(writeHeader).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledTimes(1);
    expect(end).toHaveBeenCalledTimes(1);
  });
});
