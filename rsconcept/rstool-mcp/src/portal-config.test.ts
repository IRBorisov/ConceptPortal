import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import files from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';
import { loadPortalConfiguration } from './portal-config';

const mcp = [{ subject: 'alice', token: 'a'.repeat(40) }];
const human = [{ subject: 'alice', token: 'b'.repeat(40) }];
const directories: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const directory of directories.splice(0)) {
    const relative = path.relative(path.resolve(os.tmpdir()), path.resolve(directory));
    if (relative.startsWith('..') || !relative.startsWith('portal-config-test-')) throw new Error('Unsafe cleanup');
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

/** Fixtures contain random test-only encryption material, never a production credential. */
function setup() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-config-test-'));
  directories.push(directory);
  const master = path.join(directory, 'master');
  const accounts = path.join(directory, 'accounts.json');
  fs.writeFileSync(master, randomBytes(32), { mode: 0o600 });
  fs.writeFileSync(accounts, JSON.stringify(human), { mode: 0o600 });
  const environment = {
    RSTOOL_PORTAL_ORIGIN: 'https://api.portal.example',
    RSTOOL_PUBLIC_ORIGIN: 'https://mcp.example',
    RSTOOL_PORTAL_VAULT_DIR: path.join(directory, 'vault'),
    RSTOOL_PORTAL_MASTER_KEY_FILE: master,
    RSTOOL_ACCOUNT_TOKENS_FILE: accounts,
  };
  return { environment, directory, master, accounts, workspace: path.join(directory, 'workspaces') };
}

it('keeps integration disabled by default and requires complete opt-in', async () => {
  await expect(loadPortalConfiguration({}, mcp, '/unused')).resolves.toBeUndefined();
  await expect(
    loadPortalConfiguration({ RSTOOL_PORTAL_ORIGIN: 'https://api.example' }, mcp, '/unused')
  ).rejects.toThrow('All five');
  await expect(loadPortalConfiguration({ RSTOOL_PORTAL_SERVICE_KEY_FILE: '/unused' }, mcp, '/unused')).rejects.toThrow(
    'All five'
  );
});

it('uses the separate human audience and does not expose configured credentials', async () => {
  const app = setup();
  const options = await loadPortalConfiguration(app.environment, mcp, app.workspace);
  expect(await options!.verifyAccountToken(human[0].token)).toBe('alice');
  expect(await options!.verifyAccountToken(mcp[0].token)).toBeNull();
  expect(JSON.stringify(options)).not.toContain(human[0].token);
});

it('refuses overlapping audiences and account identities absent from MCP configuration', async () => {
  const app = setup();
  fs.writeFileSync(app.accounts, JSON.stringify(mcp));
  await expect(loadPortalConfiguration(app.environment, mcp, app.workspace)).rejects.toThrow('Cannot initialize');
  fs.writeFileSync(app.accounts, JSON.stringify([{ ...human[0], subject: 'bob' }]));
  await expect(loadPortalConfiguration(app.environment, mcp, app.workspace)).rejects.toThrow('Cannot initialize');
});

it('keeps master keys out of application backups and refuses overlapping data directories', async () => {
  const app = setup();
  fs.mkdirSync(app.environment.RSTOOL_PORTAL_VAULT_DIR);
  const unsafeMaster = path.join(app.environment.RSTOOL_PORTAL_VAULT_DIR, 'master');
  fs.copyFileSync(app.master, unsafeMaster);
  await expect(
    loadPortalConfiguration({ ...app.environment, RSTOOL_PORTAL_MASTER_KEY_FILE: unsafeMaster }, mcp, app.workspace)
  ).rejects.toThrow('Cannot initialize');
  await expect(
    loadPortalConfiguration({ ...app.environment, RSTOOL_PORTAL_VAULT_DIR: app.workspace }, mcp, app.workspace)
  ).rejects.toThrow('Cannot initialize');
});

it('requires a full-size master key and refuses plaintext-readable credentials on Unix', async () => {
  const app = setup();
  fs.writeFileSync(app.master, 'short');
  await expect(loadPortalConfiguration(app.environment, mcp, app.workspace)).rejects.toThrow('Cannot initialize');
  if (process.platform !== 'win32') {
    fs.writeFileSync(app.master, randomBytes(32));
    fs.chmodSync(app.master, 0o644);
    await expect(loadPortalConfiguration(app.environment, mcp, app.workspace)).rejects.toThrow('Cannot initialize');
  }
});

/** Use real credential payloads while reproducing the metadata of systemd's root-owned ACL store. */
function systemdSetup() {
  const app = setup();
  const directory = '/run/credentials/rstool-test.service';
  const modes = { file: 0o100440, directory: 0o40550, uid: 0, gid: 0, directoryUid: 0 };
  const paths = new Map([
    [directory + '/master', app.master],
    [directory + '/accounts', app.accounts],
  ]);
  let accountCanonical = directory + '/accounts';
  const originalStat = files.stat.bind(files);
  const originalRealpath = files.realpath.bind(files);
  const originalRead = files.readFile.bind(files);
  vi.spyOn(files, 'realpath').mockImplementation(async (input) => {
    const value = String(input);
    if (value === directory + '/accounts') return accountCanonical;
    if (value === directory || paths.has(value)) return value;
    return originalRealpath(input);
  });
  vi.spyOn(files, 'stat').mockImplementation(async (input) => {
    const value = String(input);
    if (value === directory)
      return Object.assign(await originalStat(app.directory), {
        mode: modes.directory,
        uid: modes.directoryUid,
        gid: 0,
      });
    const actual = paths.get(value);
    if (actual) return Object.assign(await originalStat(actual), { mode: modes.file, uid: modes.uid, gid: modes.gid });
    return originalStat(input);
  });
  vi.spyOn(files, 'readFile').mockImplementation((input, options) =>
    originalRead(paths.get(String(input)) ?? input, options)
  );
  return {
    ...app,
    modes,
    credentialDirectory: directory,
    environment: {
      ...app.environment,
      CREDENTIALS_DIRECTORY: directory,
      RSTOOL_PORTAL_MASTER_KEY_FILE: directory + '/master',
      RSTOOL_ACCOUNT_TOKENS_FILE: directory + '/accounts',
    },
    escapeAccount: () => {
      accountCanonical = '/tmp/outside-credential-store';
      paths.set(accountCanonical, app.accounts);
    },
  };
}

it.skipIf(process.platform !== 'linux')(
  'loads root-owned 0440 systemd credentials from the protected runtime store',
  async () => {
    const app = systemdSetup();
    const options = await loadPortalConfiguration(app.environment, mcp, app.workspace);
    expect(await options!.verifyAccountToken(human[0].token)).toBe('alice');
    expect(await options!.verifyAccountToken(mcp[0].token)).toBeNull();
    expect(JSON.stringify(options)).not.toContain(human[0].token);
  }
);

it
  .skipIf(process.platform !== 'linux')
  .each([
    { file: 0o100444 },
    { file: 0o100460 },
    { file: 0o100640 },
    { uid: 1000 },
    { gid: 1000 },
    { directory: 0o40750 },
    { directory: 0o40555 },
    { directoryUid: 1000 },
  ])('rejects unsafe systemd credential metadata %j', async (unsafe) => {
  const app = systemdSetup();
  Object.assign(app.modes, unsafe);
  await expect(loadPortalConfiguration(app.environment, mcp, app.workspace)).rejects.toThrow('Cannot initialize');
});

it.skipIf(process.platform !== 'linux')(
  'rejects an absent, unrelated or non-systemd credential directory and canonical escapes',
  async () => {
    const app = systemdSetup();
    for (const directory of ['', '/run/credentials/another.service', app.directory, 'relative-directory']) {
      await expect(
        loadPortalConfiguration({ ...app.environment, CREDENTIALS_DIRECTORY: directory }, mcp, app.workspace)
      ).rejects.toThrow('Cannot initialize');
    }
    app.escapeAccount();
    await expect(loadPortalConfiguration(app.environment, mcp, app.workspace)).rejects.toThrow('Cannot initialize');
  }
);
