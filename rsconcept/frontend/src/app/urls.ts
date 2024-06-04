/**
 * Module: Internal navigation constants.
 */

import { buildConstants } from '@/utils/buildConstants';

/**
 * Routes.
 */
export const routes = {
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
  oss: 'oss'
};

interface SchemaProps {
  id: number | string;
  tab: number;
  version?: number | string;
  active?: number | string;
}

interface OssProps {
  id: number | string;
  tab: number;
}

/**
 * Internal navigation URLs.
 */
export const urls = {
  admin: `${buildConstants.backend}/admin`,
  home: '/',
  login: `/${routes.login}`,
  login_hint: (userName: string) => `/login?username=${userName}`,
  profile: `/${routes.profile}`,
  signup: `/${routes.signup}`,
  library: `/${routes.library}`,
  library_filter: (strategy: string) => `/library?filter=${strategy}`,
  create_schema: `/${routes.create_schema}`,
  manuals: `/${routes.manuals}`,
  help_topic: (topic: string) => `/manuals?topic=${topic}`,
  schema: (id: number | string, version?: number | string) =>
    `/rsforms/${id}` + (version !== undefined ? `?v=${version}` : ''),
  oss: (id: number | string) => `/oss/${id}`,
  schema_props: ({ id, tab, version, active }: SchemaProps) => {
    const versionStr = version !== undefined ? `v=${version}&` : '';
    const activeStr = active !== undefined ? `&active=${active}` : '';
    return `/rsforms/${id}?${versionStr}tab=${tab}${activeStr}`;
  },
  oss_props: ({ id, tab }: OssProps) => {
    return `/oss/${id}?tab=${tab}`;
  }
};
