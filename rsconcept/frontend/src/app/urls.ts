/**
 * Module: Internal navigation constants.
 */

import { buildConstants } from '@/utils/buildConstants';

/**
 * Routes.
 */
export const routes = {
  not_found: 'not-found',
  login: 'login',
  signup: 'signup',
  profile: 'profile',
  restore_password: 'restore-password',
  password_change: 'password-change',
  library: 'library',
  create_schema: 'library/create',
  manuals: 'manuals',
  help: 'manuals',
  rsforms: 'rsforms',
  oss: 'oss',
  icons: 'icons',
  database_schema: 'database-schema'
};

/**
 * Internal navigation URLs.
 */
export const urls = {
  page404: '/not-found',
  admin: `${buildConstants.backend}/admin`,
  rest_api: `${buildConstants.backend}/`,
  home: '/',
  login: `/${routes.login}`,
  login_hint: (userName: string) => `/login?username=${userName}`,
  profile: `/${routes.profile}`,
  icons: `/${routes.icons}`,
  database_schema: `/${routes.database_schema}`,
  signup: `/${routes.signup}`,
  library: `/${routes.library}`,
  library_filter: (strategy: string) => `/library?filter=${strategy}`,
  create_schema: `/${routes.create_schema}`,
  manuals: `/${routes.manuals}`,
  help_topic: (topic: string) => `/manuals?topic=${topic}`,
  schema: (id: number | string, version?: number | string) =>
    `/rsforms/${id}` + (version !== undefined ? `?v=${version}` : ''),
  oss: (id: number | string, tab?: number) => `/oss/${id}` + (tab !== undefined ? `?tab=${tab}` : ''),

  schema_props: ({
    id,
    tab,
    version,
    active
  }: {
    id: number | string;
    tab: number;
    version?: number | string;
    active?: number | string;
  }) => {
    const versionStr = version !== undefined ? `v=${version}&` : '';
    const activeStr = active !== undefined ? `&active=${active}` : '';
    return `/rsforms/${id}?${versionStr}tab=${tab}${activeStr}`;
  },

  oss_props: ({ id, tab }: { id: number | string; tab: number }) => {
    return `/oss/${id}?tab=${tab}`;
  }
};
