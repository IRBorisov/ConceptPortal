/**
 * Shared UI message ids (`lid`) and non-React formatter (`formatLabel`).
 * In client components `formatLabel` is fine; use `useTx` when mixing with other ICU strings.
 */
export { LABEL_DEFAULTS, lid } from '@/app/i18n/labels/catalog';
export { formatLabel } from '@/app/i18n/format-app-message';
