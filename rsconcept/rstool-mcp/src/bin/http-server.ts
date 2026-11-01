#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

import { createBearerTokenVerifier } from '../http-auth';
import { createRSToolHttpServer } from '../http-server';

async function main(): Promise<void> {
  const credentialsFile = process.env.RSTOOL_HTTP_TOKENS_FILE;
  const persistenceDir = process.env.RSTOOL_PERSISTENCE_DIR;
  if (!credentialsFile || !persistenceDir) {
    throw new Error('RSTOOL_HTTP_TOKENS_FILE and RSTOOL_PERSISTENCE_DIR are required');
  }
  let credentials;
  try {
    credentials = JSON.parse(await readFile(credentialsFile, 'utf8'));
  } catch {
    throw new Error('Cannot read HTTP credentials JSON');
  }
  const host = process.env.RSTOOL_HTTP_HOST ?? '127.0.0.1';
  const port = Number(process.env.RSTOOL_HTTP_PORT ?? 8093);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid RSTOOL_HTTP_PORT');
  const service = createRSToolHttpServer({
    persistenceDir,
    verifyToken: createBearerTokenVerifier(credentials),
    allowedHosts: process.env.RSTOOL_HTTP_ALLOWED_HOSTS?.split(',').map(value => value.trim()),
  });
  await new Promise<void>((resolve, reject) => {
    service.server.once('error', reject);
    service.server.listen(port, host, () => {
      service.server.off('error', reject);
      resolve();
    });
  });
  process.stderr.write(`rstool-mcp HTTP ready on ${host}:${port}/mcp\n`);
  const stop = () => {
    void service.close().catch(() => {
      process.stderr.write('rstool-mcp HTTP shutdown failed\n');
      process.exitCode = 1;
    });
  };
  service.server.on('error', error => {
    process.stderr.write(`rstool-mcp HTTP server error: ${error.message}\n`);
    process.exitCode = 1;
    stop();
  });
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}

main().catch(error => {
  process.stderr.write(`rstool-mcp HTTP fatal: ${error instanceof Error ? error.message : 'Startup failed'}\n`);
  process.exit(1);
});
