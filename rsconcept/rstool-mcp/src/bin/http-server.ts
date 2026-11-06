#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { relative, resolve, isAbsolute } from 'node:path';

import { createBearerTokenVerifier } from '../http-auth';
import { createRSToolHttpServer } from '../http-server';
import { PortalClient } from '../portal-client';
import { PortalPublisher, type ServicePortalCredential } from '../portal-publisher';
import { PortalVault } from '../portal-vault';

/** Load mandatory credentials and durable storage before opening the HTTP listener. */
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
  const portalSettings = [process.env.RSTOOL_PORTAL_ORIGIN, process.env.RSTOOL_PUBLIC_ORIGIN,
    process.env.RSTOOL_PORTAL_VAULT_DIR, process.env.RSTOOL_PORTAL_MASTER_KEY_FILE, process.env.RSTOOL_ACCOUNT_TOKENS_FILE];
  let portal;
  if (portalSettings.some(Boolean) || process.env.RSTOOL_PORTAL_SERVICE_KEY_FILE || process.env.RSTOOL_PORTAL_SERVICE_POLICY_FILE) {
    if (!portalSettings.every(Boolean)) throw new Error('All five Portal configuration settings are required');
    const [portalOrigin, publicOrigin, vaultDirectory, masterKeyFile, accountTokensFile] = portalSettings as string[];
    const within = (parent: string, child: string) => { const path = relative(resolve(parent), resolve(child)); return !path.startsWith('..') && !isAbsolute(path); };
    if (within(persistenceDir, vaultDirectory) || within(vaultDirectory, persistenceDir)) throw new Error('Portal vault and rstool workspaces need separate directories');
    let serviceCredential: ServicePortalCredential | undefined;
    try {
      const serviceKeyFile = process.env.RSTOOL_PORTAL_SERVICE_KEY_FILE;
      const policyFile = process.env.RSTOOL_PORTAL_SERVICE_POLICY_FILE;
      if (Boolean(serviceKeyFile) !== Boolean(policyFile)) throw new Error('Both service credential settings are required');
      if (serviceKeyFile && policyFile) {
        const policy = JSON.parse(await readFile(policyFile, 'utf8'));
        serviceCredential = { token: (await readFile(serviceKeyFile, 'utf8')).trim(), subjects: policy.subjects, targetIds: policy.targetIds };
      }
      const vault = new PortalVault(vaultDirectory, await readFile(masterKeyFile));
      const accountCredentials = JSON.parse(await readFile(accountTokensFile, 'utf8'));
      const verifyAccountToken = createBearerTokenVerifier(accountCredentials);
      const mcpTokens = new Set(credentials.map((credential: { token: string }) => credential.token));
      const mcpSubjects = new Set(credentials.map((credential: { subject: string }) => credential.subject));
      if (accountCredentials.some((credential: { token: string; subject: string }) => mcpTokens.has(credential.token) || !mcpSubjects.has(credential.subject))) throw new Error('Invalid account credential separation');
      portal = { publicOrigin, verifyAccountToken, publisher: new PortalPublisher(vault, new PortalClient(portalOrigin), serviceCredential) };
    } catch { throw new Error('Cannot initialize Portal credentials/configuration'); }
  }
  const service = createRSToolHttpServer({
    persistenceDir,
    verifyToken: createBearerTokenVerifier(credentials),
    allowedHosts: process.env.RSTOOL_HTTP_ALLOWED_HOSTS?.split(',').map(value => value.trim()),
    portal,
  });
  await new Promise<void>((resolve, reject) => {
    service.server.once('error', reject);
    service.server.listen(port, host, () => {
      service.server.off('error', reject);
      resolve();
    });
  });
  process.stderr.write(`rstool-mcp HTTP ready on ${host}:${port}/mcp\n`);
  /** Drain requests on a signal or listener failure, preserving failure exit status. */
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
