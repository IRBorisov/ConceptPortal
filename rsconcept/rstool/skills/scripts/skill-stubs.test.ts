import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const SCRIPT = resolve(import.meta.dirname, 'rstool-skills.mjs');
const ROUTER = resolve(import.meta.dirname, '../rstool/SKILL.md');
const WORKSPACE = resolve(import.meta.dirname, '../../../..');
const STUBS = ['.agents/skills/rstool/SKILL.md', '.claude/skills/rstool/SKILL.md'];

function renderStub(target: string): string {
  return execFileSync('node', [SCRIPT, 'stub', '--source', ROUTER, '--target', target], { encoding: 'utf8' });
}

describe('rstool skill stubs', () => {
  it.each(STUBS)('workspace %s matches the router skill', stub => {
    const path = join(WORKSPACE, stub);
    if (!existsSync(path)) {
      return;
    }
    expect(readFileSync(path, 'utf8')).toBe(renderStub('rsconcept/rstool/skills/rstool/SKILL.md'));
  });

  it('install requires an explicit skills directory', () => {
    const project = mkdtempSync(join(tmpdir(), 'rstool-skills-'));
    try {
      expect(() => execFileSync('node', [SCRIPT, 'install'], { cwd: project, stdio: 'pipe' })).toThrow();
      expect(existsSync(join(project, '.claude'))).toBe(false);
      expect(existsSync(join(project, '.agents'))).toBe(false);
    } finally {
      rmSync(project, { recursive: true, force: true });
    }
  });

  it('installs a stub that points into node_modules', () => {
    const project = mkdtempSync(join(tmpdir(), 'rstool-skills-'));
    try {
      execFileSync('node', [SCRIPT, 'install', '--dir', 'skills'], { cwd: project, encoding: 'utf8' });
      const stub = readFileSync(join(project, 'skills/rstool/SKILL.md'), 'utf8');
      expect(stub).toBe(renderStub('node_modules/@rsconcept/rstool/skills/rstool/SKILL.md'));
      expect(stub).toContain('name: rstool');
    } finally {
      rmSync(project, { recursive: true, force: true });
    }
  });
});
