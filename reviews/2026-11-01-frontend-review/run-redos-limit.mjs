import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const length = process.argv[2] ?? '24';
const limitMs = Number(process.argv[3] ?? 4000);
const worker = fileURLToPath(new URL('./redos-worker.mjs', import.meta.url));
const child = spawn(process.execPath, ['--experimental-strip-types', worker, length], { stdio: 'inherit' });
const timer = setTimeout(() => {
  child.kill();
  console.log(JSON.stringify({ length: Number(length), killed: true, limitMs }));
  process.exit(124);
}, limitMs);
child.on('exit', code => {
  clearTimeout(timer);
  process.exit(code ?? 1);
});
