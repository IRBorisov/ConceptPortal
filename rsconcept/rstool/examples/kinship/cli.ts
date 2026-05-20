import readline from 'node:readline/promises';
import { resolve } from 'node:path';
import { stdin as input, stdout as output } from 'node:process';

import { RSToolWrapperClient } from '../../src';

import { DEFAULT_SESSION_PATH } from './constants';
import { KinshipModelSession } from './session';
import { formatS1, formatX1, formatA1Status } from './x1-actions';

const HELP = `
Команды изменения X1 (люди):

  list                         показать X1 и связи S1
  add <имя>                    добавить человека
  remove <имя>                 удалить человека (с пересчётом индексов и очисткой S1)
  rename <старое> <новое>      переименовать
  set <имя1> <имя2> ...       заменить весь список людей (S1 сохраняется по именам)
  clear                        очистить X1 и S1
  save [путь]                  сохранить сессию (по умолчанию — исходный файл)
  help                         эта справка
  exit                         выход без сохранения

Флаги запуска:
  --session <path>             файл сессии (по умолчанию: ${DEFAULT_SESSION_PATH})
  --no-save                    не сохранять после команды
`.trim();

const READONLY_COMMANDS = new Set(['help', '?', 'list', 'show']);

function shouldAutoSave(command: string, autoSave: boolean): boolean {
  return autoSave && command !== 'save' && !READONLY_COMMANDS.has(command);
}

interface CliOptions {
  sessionPath: string;
  autoSave: boolean;
  command?: string;
  args: string[];
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    sessionPath: DEFAULT_SESSION_PATH,
    autoSave: true,
    args: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--session') {
      options.sessionPath = argv[index + 1] ?? DEFAULT_SESSION_PATH;
      index += 1;
      continue;
    }
    if (token === '--no-save') {
      options.autoSave = false;
      continue;
    }
    if (!options.command) {
      options.command = token;
      continue;
    }
    options.args.push(token);
  }

  return options;
}

async function printModel(session: KinshipModelSession): Promise<void> {
  const binding = await session.getX1Binding();
  const s1 = await session.getS1Value();
  console.log('X1 (люди):');
  console.log(formatX1(binding));
  console.log('');
  console.log(formatA1Status(binding));
  console.log('');
  console.log('S1 (родитель → ребёнок):');
  console.log(formatS1(binding, s1));
}

async function runCommand(session: KinshipModelSession, command: string, args: string[]): Promise<boolean> {
  switch (command) {
    case 'help':
    case '?':
      console.log(HELP);
      return true;

    case 'list':
    case 'show':
      await printModel(session);
      return true;

    case 'add': {
      const name = args.join(' ').trim();
      if (!name) {
        throw new Error('Укажите имя: add <имя>');
      }
      await session.addPerson(name);
      await session.commitStep(`X1: добавлен «${name}»`);
      console.log(`Добавлен: ${name}`);
      await printModel(session);
      return true;
    }

    case 'remove':
    case 'rm': {
      const name = args.join(' ').trim();
      if (!name) {
        throw new Error('Укажите имя: remove <имя>');
      }
      await session.removePerson(name);
      await session.commitStep(`X1: удалён «${name}»`);
      console.log(`Удалён: ${name}`);
      await printModel(session);
      return true;
    }

    case 'rename': {
      const [oldName, ...rest] = args;
      const newName = rest.join(' ').trim();
      if (!oldName || !newName) {
        throw new Error('Укажите имена: rename <старое> <новое>');
      }
      await session.renamePerson(oldName, newName);
      await session.commitStep(`X1: «${oldName}» → «${newName}»`);
      console.log(`Переименовано: ${oldName} → ${newName}`);
      await printModel(session);
      return true;
    }

    case 'set': {
      const names = args.map(name => name.trim()).filter(Boolean);
      if (names.length === 0) {
        throw new Error('Укажите имена: set <имя1> <имя2> ...');
      }
      await session.setX1List(names);
      await session.commitStep(`X1: задан список (${names.length})`);
      console.log(`Задан X1: ${names.join(', ')}`);
      await printModel(session);
      return true;
    }

    case 'clear': {
      await session.clearX1();
      await session.commitStep('X1 и S1 очищены');
      console.log('X1 и S1 очищены');
      await printModel(session);
      return true;
    }

    case 'save': {
      const savedPath = await session.save(args[0]);
      console.log(`Сохранено: ${savedPath}`);
      return true;
    }

    case 'exit':
    case 'quit':
      return false;

    default:
      throw new Error(`Неизвестная команда: ${command}\n\n${HELP}`);
  }
}

async function runInteractive(session: KinshipModelSession, autoSave: boolean): Promise<void> {
  const rl = readline.createInterface({ input, output });
  console.log('Kinship model CLI — изменение X1');
  console.log(`Сессия: ${resolve(process.cwd(), DEFAULT_SESSION_PATH)}`);
  console.log('Введите help для списка команд.\n');

  try {
    for (;;) {
      const line = (await rl.question('kinship> ')).trim();
      if (!line) {
        continue;
      }
      const [command, ...args] = line.split(/\s+/);
      if (command === 'exit' || command === 'quit') {
        break;
      }
      try {
        await runCommand(session, command, args);
        if (shouldAutoSave(command, autoSave)) {
          const savedPath = await session.save();
          console.log(`(автосохранение: ${savedPath})`);
        }
      } catch (error) {
        console.error(error instanceof Error ? error.message : error);
      }
      console.log('');
    }
  } finally {
    rl.close();
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const client = new RSToolWrapperClient({ cwd: resolve(process.cwd()) });

  try {
    await client.waitUntilReady();
    const session = await KinshipModelSession.open(client, options.sessionPath);

    if (!options.command) {
      await runInteractive(session, options.autoSave);
      return;
    }

    const shouldContinue = await runCommand(session, options.command, options.args);
    if (!shouldContinue) {
      return;
    }

    if (shouldAutoSave(options.command, options.autoSave)) {
      const savedPath = await session.save();
      console.log(`Сохранено: ${savedPath}`);
    }
  } finally {
    await client.close();
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
