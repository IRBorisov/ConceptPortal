/**
 * Variable constants depending on build type.
 * Extracted as separate file because of bundler issues during tests
 */
export const buildConstants = {
  backend: import.meta.env.VITE_PORTAL_BACKEND as string
};
