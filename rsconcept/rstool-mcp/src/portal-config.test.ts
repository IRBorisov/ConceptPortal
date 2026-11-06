import childProcess from 'node:child_process';
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
function systemdSetup(directory = '/run/credentials/rstool-test.service') {
  const app = setup();
  const modes = { file: 0o100440, directory: 0o40550, uid: 0, gid: 0, directoryUid: 0 };
  const acl = (permission: number) => [
    [1, permission, 0xffffffff],
    [2, permission, process.getuid!()],
    [4, 0, 0xffffffff],
    [16, permission, 0xffffffff],
    [32, 0, 0xffffffff],
  ];
  const acls = [acl(4), acl(5)];
  vi.spyOn(childProcess, 'spawnSync').mockImplementation(() => {
    const output = Buffer.from(JSON.stringify(acls));
    return {
      pid: 1,
      status: 0,
      signal: null,
      output: [null, output, Buffer.alloc(0)],
      stdout: output,
      stderr: Buffer.alloc(0),
    };
  });
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
    acls,
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

it.skipIf(process.platform !== 'linux')(
  'rejects otherwise matching credential paths outside the systemd runtime root',
  async () => {
    const app = systemdSetup('/outside-credentials/rstool-test.service');
    await expect(loadPortalConfiguration(app.environment, mcp, app.workspace)).rejects.toThrow('Cannot initialize');
    expect(childProcess.spawnSync).not.toHaveBeenCalled();
  }
);

it.skipIf(process.platform !== 'linux').each([
  [0, 2, 1, 4],
  [1, 2, 1, 5],
  [0, 1, 2, 12345],
  [1, 1, 2, 12345],
  [0, 4, 1, 4],
])('rejects additional effective ACL access %j', async (which, entry, field, value) => {
  const app = systemdSetup();
  app.acls[which][entry][field] = field === 2 ? process.getuid!() + 1 : value;
  await expect(loadPortalConfiguration(app.environment, mcp, app.workspace)).rejects.toThrow('Cannot initialize');
});

it.skipIf(process.platform !== 'linux')('fails closed when the ACL reader cannot verify metadata', async () => {
  const app = systemdSetup();
  vi.mocked(childProcess.spawnSync).mockReturnValue({
    pid: 1,
    status: 1,
    signal: null,
    output: [null, Buffer.alloc(0), Buffer.alloc(0)],
    stdout: Buffer.alloc(0),
    stderr: Buffer.alloc(0),
  });
  await expect(loadPortalConfiguration(app.environment, mcp, app.workspace)).rejects.toThrow('Cannot initialize');
});

it.skipIf(process.platform !== 'linux')(
  'verifies real Linux POSIX ACL xattrs through the isolated reader',
  async () => {
    const originalSpawn = childProcess.spawnSync.bind(childProcess);
    const app = systemdSetup();
    fs.mkdirSync(app.workspace, { mode: 0o700 });
    fs.mkdirSync(app.environment.RSTOOL_PORTAL_VAULT_DIR, { mode: 0o700 });
    const prepare = `import os, struct, sys
uid = int(sys.argv[1])
for path, permission in ((sys.argv[2], 4), (sys.argv[3], 4), (sys.argv[4], 5)):
    entries = ((1, permission, 0xffffffff), (2, permission, uid), (4, 0, 0xffffffff),
               (16, permission, 0xffffffff), (32, 0, 0xffffffff))
    data = struct.pack('<I', 2) + b''.join(struct.pack('<HHI', *entry) for entry in entries)
    os.setxattr(path, 'system.posix_acl_access', data)
`;
    try {
      const prepared = originalSpawn('python3', [
        '-I',
        '-B',
        '-c',
        prepare,
        String(process.getuid!()),
        app.master,
        app.accounts,
        app.directory,
      ]);
      expect(prepared.status).toBe(0);
      const paths = new Map([
        [app.credentialDirectory, app.directory],
        [app.credentialDirectory + '/master', app.master],
        [app.credentialDirectory + '/accounts', app.accounts],
      ]);
      vi.mocked(childProcess.spawnSync).mockImplementation((command, args, options) =>
        originalSpawn(
          command,
          (args ?? []).map((argument) => paths.get(argument) ?? argument),
          options
        )
      );
      const loaded = await loadPortalConfiguration(app.environment, mcp, app.workspace);
      expect(await loaded!.verifyAccountToken(human[0].token)).toBe('alice');
      const readerCall = vi.mocked(childProcess.spawnSync).mock.calls[0];
      expect(readerCall[0]).toBe('python3');
      expect(readerCall[1]?.slice(0, 3)).toEqual(['-I', '-B', '-c']);
    } finally {
      fs.chmodSync(app.directory, 0o700);
    }
  }
);
