import childProcess from 'node:child_process';
import type { Stats } from 'node:fs';
import files from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';

import { createBearerTokenVerifier, type HttpCredential } from './http-auth';
import type { RSToolHttpServerOptions } from './http-server';
import { PortalClient } from './portal-client';
import { PortalCreations } from './portal-creations';
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
    await files.mkdir(vaultDirectory, { recursive: true, mode: 0o700 });
    await files.mkdir(persistenceDir, { recursive: true, mode: 0o700 });
    const vaultPath = await files.realpath(vaultDirectory),
      workspacePath = await files.realpath(persistenceDir);
    if (within(vaultPath, workspacePath) || within(workspacePath, vaultPath))
      throw new Error('Separate data directories required');
    const protectedInput = async (file: string) => {
      const canonical = await files.realpath(file);
      if (within(vaultPath, canonical) || within(workspacePath, canonical))
        throw new Error('Secrets must be outside application data');
      const info = await files.stat(canonical);
      const privateMode = process.platform === 'win32' || !(info.mode & 0o077);
      if (
        !info.isFile() ||
        info.size > 65536 ||
        (!privateMode && !(await systemdCredential(canonical, info, environment.CREDENTIALS_DIRECTORY)))
      )
        throw new Error('Private regular credential file required');
      return files.readFile(canonical);
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
      const policy = JSON.parse(await files.readFile(policyFile, 'utf8'));
      service = {
        token: (await protectedInput(serviceFile)).toString('utf8').trim(),
        subjects: policy.subjects,
        targetIds: policy.targetIds,
      };
    }
    const vault = new PortalVault(vaultDirectory, await protectedInput(masterKeyFile));
    return { publicOrigin, verifyAccountToken,
      publisher: new PortalPublisher(vault, api, service, new PortalCreations(resolve(vaultDirectory, 'creations'))) };
  } catch {
    throw new Error('Cannot initialize Portal credentials/configuration');
  }
}

/** Canonical paths keep credential material out of both plaintext workspace and encrypted-vault backups. */
function within(parent: string, child: string): boolean {
  const path = relative(resolve(parent), resolve(child));
  return !path.startsWith('..') && !isAbsolute(path);
}

/** systemd may expose root-owned 0440 credentials through an ACL granted to this service. */
async function systemdCredential(file: string, info: Stats, suppliedDirectory?: string): Promise<boolean> {
  if (
    process.platform !== 'linux' ||
    !suppliedDirectory ||
    !isAbsolute(suppliedDirectory) ||
    info.uid !== 0 ||
    info.gid !== 0 ||
    (info.mode & 0o777) !== 0o440
  )
    return false;
  const directory = await files.realpath(suppliedDirectory);
  if (dirname(directory) !== '/run/credentials' || dirname(file) !== directory) return false;
  const parent = await files.stat(directory);
  // The directory must be root-controlled, immutable to the service and closed to other users.
  if (!parent.isDirectory() || parent.uid !== 0 || parent.gid !== 0 || parent.mode & 0o227) return false;
  const uid = process.getuid?.();
  if (uid === undefined) return false;
  // -I/-B isolate Python from application/user import paths and avoid bytecode writes.
  // Read only ACL metadata, never credential contents; fail closed if unavailable.
  const result = childProcess.spawnSync('python3', ['-I', '-B', '-c', ACL_READER, file, directory], {
    encoding: 'utf8',
    timeout: 2000,
    maxBuffer: 16384,
  });
  if (result.error || result.status !== 0) return false;
  const acls: unknown = JSON.parse(result.stdout.toString());
  return Array.isArray(acls) && acls.length === 2 && exclusiveAcl(acls[0], uid, 4) && exclusiveAcl(acls[1], uid, 5);
}

// Linux POSIX access ACL xattrs have a version header followed by five expected entries.
const ACL_READER = `import json, os, struct, sys
result = []
for path in sys.argv[1:]:
    data = os.getxattr(path, 'system.posix_acl_access', follow_symlinks=False)
    if len(data) != 44 or struct.unpack_from('<I', data)[0] != 2:
        sys.exit(1)
    result.append(list(struct.iter_unpack('<HHI', data[4:])))
print(json.dumps(result))
`;

/** Accept only owner/service read grants: no owning-group, named-group or other-user access. */
function exclusiveAcl(value: unknown, uid: number, permission: number): boolean {
  const undefinedId = 0xffffffff;
  const expected = [
    [1, permission, undefinedId],
    [2, permission, uid],
    [4, 0, undefinedId],
    [16, permission, undefinedId],
    [32, 0, undefinedId],
  ];
  return (
    Array.isArray(value) &&
    value.length === expected.length &&
    expected.every((entry) =>
      value.some(
        (actual) => Array.isArray(actual) && actual.length === 3 && entry.every((part, index) => actual[index] === part)
      )
    )
  );
}
