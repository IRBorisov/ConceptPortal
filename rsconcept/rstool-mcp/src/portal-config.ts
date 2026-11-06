import { mkdir, readFile, realpath, stat } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';

import { createBearerTokenVerifier, type HttpCredential } from './http-auth';
import type { RSToolHttpServerOptions } from './http-server';
import { PortalClient } from './portal-client';
import { PortalPublisher, type ServicePortalCredential } from './portal-publisher';
import { PortalVault } from './portal-vault';

/** Load opt-in CLI configuration without ever including secret values or file contents in errors. */
export async function loadPortalConfiguration(
  environment: NodeJS.ProcessEnv,
  credentials: readonly HttpCredential[],
  persistenceDir: string
): Promise<RSToolHttpServerOptions['portal']> {
  const settings = [
    environment.RSTOOL_PORTAL_ORIGIN,
    environment.RSTOOL_PUBLIC_ORIGIN,
    environment.RSTOOL_PORTAL_VAULT_DIR,
    environment.RSTOOL_PORTAL_MASTER_KEY_FILE,
    environment.RSTOOL_ACCOUNT_TOKENS_FILE,
  ];
  if (
    !settings.some(Boolean) &&
    !environment.RSTOOL_PORTAL_SERVICE_KEY_FILE &&
    !environment.RSTOOL_PORTAL_SERVICE_POLICY_FILE
  )
    return undefined;
  if (!settings.every(Boolean)) throw new Error('All five Portal configuration settings are required');
  try {
    createBearerTokenVerifier(credentials);
    const [portalOrigin, publicOrigin, vaultDirectory, masterKeyFile, accountTokensFile] = settings as string[];
    if ([vaultDirectory, masterKeyFile, accountTokensFile, persistenceDir].some((value) => !isAbsolute(value)))
      throw new Error('Absolute paths required');
    const publicUrl = new URL(publicOrigin);
    if (publicUrl.protocol !== 'https:' || publicUrl.origin !== publicOrigin)
      throw new Error('HTTPS account origin required');
    const api = new PortalClient(portalOrigin);
    await mkdir(vaultDirectory, { recursive: true, mode: 0o700 });
    await mkdir(persistenceDir, { recursive: true, mode: 0o700 });
    const vaultPath = await realpath(vaultDirectory),
      workspacePath = await realpath(persistenceDir);
    if (within(vaultPath, workspacePath) || within(workspacePath, vaultPath))
      throw new Error('Separate data directories required');
    const protectedInput = async (file: string) => {
      const canonical = await realpath(file);
      if (within(vaultPath, canonical) || within(workspacePath, canonical))
        throw new Error('Secrets must be outside application data');
      const info = await stat(canonical);
      if (!info.isFile() || info.size > 65536 || (process.platform !== 'win32' && info.mode & 0o077))
        throw new Error('Private regular credential file required');
      return readFile(canonical);
    };
    const accountCredentials: HttpCredential[] = JSON.parse((await protectedInput(accountTokensFile)).toString('utf8'));
    const verifyAccountToken = createBearerTokenVerifier(accountCredentials);
    const tokens = new Set(credentials.map((credential) => credential.token));
    const subjects = new Set(credentials.map((credential) => credential.subject));
    if (accountCredentials.some((credential) => tokens.has(credential.token) || !subjects.has(credential.subject)))
      throw new Error('Invalid account credential separation');
    let service: ServicePortalCredential | undefined;
    const serviceFile = environment.RSTOOL_PORTAL_SERVICE_KEY_FILE,
      policyFile = environment.RSTOOL_PORTAL_SERVICE_POLICY_FILE;
    if (Boolean(serviceFile) !== Boolean(policyFile)) throw new Error('Both service settings required');
    if (serviceFile && policyFile) {
      const policy = JSON.parse(await readFile(policyFile, 'utf8'));
      service = {
        token: (await protectedInput(serviceFile)).toString('utf8').trim(),
        subjects: policy.subjects,
        targetIds: policy.targetIds,
      };
    }
    const vault = new PortalVault(vaultDirectory, await protectedInput(masterKeyFile));
    return { publicOrigin, verifyAccountToken, publisher: new PortalPublisher(vault, api, service) };
  } catch {
    throw new Error('Cannot initialize Portal credentials/configuration');
  }
}

/** Canonical paths keep credential material out of both plaintext workspace and encrypted-vault backups. */
function within(parent: string, child: string): boolean {
  const path = relative(resolve(parent), resolve(child));
  return !path.startsWith('..') && !isAbsolute(path);
}
