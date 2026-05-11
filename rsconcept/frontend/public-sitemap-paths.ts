/**
 * Pathnames emitted into `sitemap.xml` at build time.
 * List only URLs meant for public indexing; omit auth, account, and blocked paths
 * (see `public/robots.txt` Disallow rules).
 */

export const PUBLIC_SITEMAP_PATHS = ['/', '/library', '/manuals', '/manuals?topic=thesaurus', '/sandbox'] as const;
