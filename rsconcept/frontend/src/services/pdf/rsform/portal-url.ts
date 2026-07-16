import { external_urls } from '@/utils/constants';

/**
 * Absolute Portal URL for a schema page.
 *
 * Kept local to the PDF package so the worker graph does not import `@/app/urls` / Vite env.
 */
export function schemaPortalUrl(schemaId: number): string {
  return `${external_urls.portal}/rsforms/${schemaId}`;
}
