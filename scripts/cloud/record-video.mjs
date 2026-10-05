#!/usr/bin/env node
// Record a browser walkthrough of the locally running portal as an .mp4 (and .webm).
//
// Usage (from repo root, with backend on :8000 and frontend on :3000 running):
//   node scripts/cloud/record-video.mjs <scenario.mjs> [out-file.mp4]
//
// A scenario is an ES module whose default export is `async ({ page, baseURL, login, pause }) => {}`.
// See scripts/cloud/scenarios/smoke.mjs.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const repoRoot = path.resolve(import.meta.dirname, '../..');
const require = createRequire(path.join(repoRoot, 'rsconcept/frontend/package.json'));
const { chromium } = require('@playwright/test');

const [scenarioArg, outArg] = process.argv.slice(2);
if (!scenarioArg) {
  console.error('Usage: node scripts/cloud/record-video.mjs <scenario.mjs> [out-file.mp4]');
  process.exit(2);
}

const baseURL = process.env.PORTAL_URL ?? 'http://localhost:3000';
const outFile = path.resolve(outArg ?? `recordings/${path.basename(scenarioArg, '.mjs')}-${Date.now()}.mp4`);
const width = Number(process.env.VIDEO_WIDTH ?? 1280);
const height = Number(process.env.VIDEO_HEIGHT ?? 800);

// Cloud containers ship a preinstalled Chromium that may not match the pinned Playwright revision.
const executablePath =
  process.env.CHROMIUM_PATH ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

const tmpDir = path.join(path.dirname(outFile), `.video-${process.pid}`);
mkdirSync(tmpDir, { recursive: true });

const browser = await chromium.launch({ executablePath });
const context = await browser.newContext({
  baseURL,
  locale: process.env.VIDEO_LOCALE ?? 'ru-RU',
  viewport: { width, height },
  recordVideo: { dir: tmpDir, size: { width, height } }
});
if (!process.env.VIDEO_SHOW_TOURS) {
  // Same as rsconcept/frontend/tests/setup.ts: keep onboarding tour invitations from covering the UI.
  await context.addInitScript(() => {
    if (localStorage.getItem('portal.onboarding')) return;
    const skipped = { status: 'skipped', seenVersion: 999, resumeStep: 0 };
    localStorage.setItem(
      'portal.onboarding',
      JSON.stringify({
        state: {
          tours: { 'sandbox-intro': skipped, 'library-intro': skipped },
          resumeOfferTourID: null,
          resumeNesting: []
        },
        version: 1
      })
    );
  });
}
const page = await context.newPage();

const pause = (ms = 800) => page.waitForTimeout(ms);
async function login(username = 'admin', password = 'admin12345') {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Логин или email' }).fill(username);
  await page.getByRole('textbox', { name: 'Пароль' }).fill(password);
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await page.waitForURL(/\/library/);
}

let failed = false;
try {
  const scenario = (await import(pathToFileURL(path.resolve(scenarioArg)).href)).default;
  await scenario({ page, baseURL, login, pause });
} catch (error) {
  failed = true;
  console.error('Scenario failed:', error);
  await page.screenshot({ path: outFile.replace(/\.mp4$/, '-failure.png') }).catch(() => {});
} finally {
  await context.close();
  await browser.close();
}

const webm = await page.video().path();
const webmOut = outFile.replace(/\.mp4$/, '.webm');
renameSync(webm, webmOut);
rmSync(tmpDir, { recursive: true, force: true });
try {
  execFileSync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-i',
    webmOut,
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    outFile
  ]);
  console.log(`Video: ${outFile}`);
} catch {
  console.error(`ffmpeg unavailable or failed; no .mp4 written, video kept as ${webmOut}`);
  failed = true;
}
process.exit(failed ? 1 : 0);
