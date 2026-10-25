#!/usr/bin/env node
/**
 * Writes the `rstool` entry skill stub into a project skills directory.
 *
 * The stub holds only `name`, `description` and the path to the real router skill,
 * so nothing has to be re-synced after a package update.
 *
 * Usage:
 *   rstool-skills install [--dir <skills-dir>]... [--source <path-to-router-SKILL.md>]
 *   rstool-skills stub --source <path> --target <path-written-in-stub>   (prints the stub)
 *
 * Defaults: --dir .claude/skills and .agents/skills; --source — router skill of the
 * installed package, referenced as node_modules/@rsconcept/rstool/skills/rstool/SKILL.md.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
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

function install(args) {
  const source = resolve(args.source ?? ROUTER);
  const text = readFileSync(source, 'utf8');
  const dirs = args.dirs.length > 0 ? args.dirs : ['.claude/skills', '.agents/skills'];
  const fromProject = relative(process.cwd(), source).split('\\').join('/');
  const target =
    args.target ??
    (fromProject.startsWith('..') ? 'node_modules/@rsconcept/rstool/skills/rstool/SKILL.md' : fromProject);
  for (const dir of dirs) {
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
  if (command === 'install') {
    install(args);
  } else if (command === 'stub' && args.source && args.target) {
    process.stdout.write(renderStub(readFileSync(args.source, 'utf8'), args.target));
  } else {
    console.error(
      'Usage: rstool-skills install [--dir <skills-dir>]... | rstool-skills stub --source <SKILL.md> --target <path>'
    );
    process.exit(2);
  }
}
