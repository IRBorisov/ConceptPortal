import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Plugin } from 'vite';
import { loadEnv } from 'vite';

import { PUBLIC_SITEMAP_PATHS } from './public-sitemap-paths';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeOrigin(raw: string): string {
  return raw.trim().replace(/\/+$/, '');
}

function locationForPath(origin: string, pathname: string): string {
  if (pathname === '/') {
    return `${origin}/`;
  }
  return `${origin}${pathname}`;
}

function buildSitemapXml(origin: string, lastmod: string): string {
  const body = PUBLIC_SITEMAP_PATHS.map(p => {
    const loc = locationForPath(origin, p);
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function loadMergedEnv(mode: string, root: string): Record<string, string> {
  const fromEnvDir = loadEnv(mode, path.join(root, 'env'), '');
  const fromRoot = loadEnv(mode, root, '');
  return { ...fromEnvDir, ...fromRoot };
}

/**
 * Writes `sitemap.xml` and a `robots.txt` that includes `Sitemap:` after the static template.
 */
export function sitemapPlugin(): Plugin {
  let resolvedOutDir = path.join(__dirname, 'dist');
  let mode = 'production';

  return {
    name: 'portal-sitemap',
    apply: 'build',
    configResolved(config) {
      resolvedOutDir = path.resolve(config.root, config.build.outDir);
      mode = config.mode;
    },
    closeBundle() {
      const root = __dirname;
      const env = loadMergedEnv(mode, root);
      const originRaw = env.VITE_PORTAL_PUBLIC_ORIGIN ?? 'https://portal.acconcept.ru';

      const origin = normalizeOrigin(originRaw);
      if (!origin.startsWith('http://') && !origin.startsWith('https://')) {
        this.warn(`[portal-sitemap] VITE_PORTAL_PUBLIC_ORIGIN must be an absolute URL; got "${originRaw}". Skipping sitemap.`);
        return;
      }

      const lastmod = new Date().toISOString().slice(0, 10);
      writeFileSync(path.join(resolvedOutDir, 'sitemap.xml'), buildSitemapXml(origin, lastmod), 'utf8');

      const robotsTemplatePath = path.join(root, 'public', 'robots.txt');
      const robotsBase = readFileSync(robotsTemplatePath, 'utf8').replace(/\s*$/, '');
      const robotsOut = `${robotsBase}\n\nSitemap: ${origin}/sitemap.xml\n`;
      writeFileSync(path.join(resolvedOutDir, 'robots.txt'), robotsOut, 'utf8');
    }
  };
}
