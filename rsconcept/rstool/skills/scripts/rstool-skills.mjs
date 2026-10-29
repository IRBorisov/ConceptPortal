#!/usr/bin/env node
/**
 * Writes the `rstool` entry skill stub into a project skills directory.
 *
 * The stub holds only `name`, `description` and the path to the real router skill,
 * so nothing has to be re-synced after a package update. Which directory a host loads
 * is the agent's call (skills/INSTALL.md), so there is no default `--dir`.
 *
 * Usage:
 *   rstool-skills install --dir <skills-dir>... [--source <router SKILL.md>] [--target <path>]
 *   rstool-skills stub [--source <router SKILL.md>] [--target <path>]   (prints the stub)
 *
 * Defaults: --source — router skill of this package; --target — its path from the
 * current directory, or node_modules/@rsconcept/rstool/skills/rstool/SKILL.md when
 * the package lies outside it.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROUTER = fileURLToPath(new URL('../rstool/SKILL.md', import.meta.url));

/** Extracts the YAML front matter `description` block (folded `>-` or single line) verbatim. */
export function readDescription(skillText) {
  const match = /^---\n([\s\S]*?)\n---/.exec(skillText.replace(/\r\n/g, '\n'));
  if (!match) {
    throw new Error('SKILL.md has no front matter');
  }
  const lines = match[1].split('\n');
  const start = lines.findIndex(line => line.startsWith('description:'));
  if (start < 0) {
    throw new Error('SKILL.md has no description');
  }
  const block = [lines[start]];
  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith(' ')) {
      break;
    }
    block.push(line);
  }
  return block.join('\n');
}

/** Renders the stub skill pointing at `targetPath` (written as is, use forward slashes). */
export function renderStub(skillText, targetPath) {
  return [
    '---',
    'name: rstool',
    readDescription(skillText),
    '---',
    '',
    '# rstool',
    '',
    `Заглушка для автосрабатывания. Прочитай \`${targetPath}\` и следуй ему.`,
    '',
    'Содержимое скилла — только там; эта заглушка его не повторяет и обновлять её после обновления пакета не нужно.',
    ''
  ].join('\n');
}

function parseArgs(argv) {
  const args = { dirs: [], source: undefined, target: undefined };
  for (let i = 0; i < argv.length; i++) {
    const value = argv[i + 1];
    if (argv[i] === '--dir') {
      args.dirs.push(value);
      i++;
    } else if (argv[i] === '--source') {
      args.source = value;
      i++;
    } else if (argv[i] === '--target') {
      args.target = value;
      i++;
    }
  }
  return args;
}

function stubTarget(args, source) {
  // On Windows a source on another drive has no relative path: relative() returns it absolute.
  const fromProject = relative(process.cwd(), source);
  const outside = fromProject.startsWith('..') || isAbsolute(fromProject);
  return (
    args.target ??
    (outside ? 'node_modules/@rsconcept/rstool/skills/rstool/SKILL.md' : fromProject.split('\\').join('/'))
  );
}

function install(args) {
  const source = resolve(args.source ?? ROUTER);
  const text = readFileSync(source, 'utf8');
  const target = stubTarget(args, source);
  for (const dir of args.dirs) {
    const path = join(dir, 'rstool', 'SKILL.md');
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, renderStub(text, target), 'utf8');
    console.log(`wrote ${path} → ${target}`);
    const legacy = join(dir, 'rstool-helper', 'SKILL.md');
    if (existsSync(legacy)) {
      console.log(`note: ${legacy} is the old copied skill; remove it — rstool replaces it`);
    }
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  if (command === 'install' && args.dirs.length > 0) {
    install(args);
  } else if (command === 'stub') {
    const source = resolve(args.source ?? ROUTER);
    process.stdout.write(renderStub(readFileSync(source, 'utf8'), stubTarget(args, source)));
  } else {
    console.error(
      'Usage: rstool-skills install --dir <skills-dir>... | rstool-skills stub [--source <SKILL.md>] [--target <path>]\n' +
        'Which skills directory to use: node_modules/@rsconcept/rstool/skills/INSTALL.md'
    );
    process.exit(2);
  }
}
