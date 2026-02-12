/**
 * Module: Internal navigation constants.
 */

import { buildConstants } from '@/utils/build-constants';

/** Routes. */
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
  models: 'models',
  icons: 'icons',
  database_schema: 'database-schema',
  prompt_templates: 'prompt-templates'
} as const;

/** Internal navigation URLs. */
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
  prompt_templates: `/${routes.prompt_templates}`,
  prompt_template: (active: number | null, tab: number) =>
    `/prompt-templates?tab=${tab}${active ? `&active=${active}` : ''}`,
  manuals: `/${routes.manuals}`,
  help_topic: (topic: string) => `/manuals?topic=${topic}`,
  schema: (id: number | string, version?: number | string) =>
    `/rsforms/${id}` + (version !== undefined ? `?v=${version}` : ''),
  oss: (id: number | string, tab?: number) => `/oss/${id}` + (tab !== undefined ? `?tab=${tab}` : ''),
  model: (id: number | string, tab?: number) => `/models/${id}` + (tab !== undefined ? `?tab=${tab}` : ''),

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

  oss_props: ({ id, tab }: { id: number | string; tab: number; }) => {
    return `/oss/${id}?tab=${tab}`;
  },

  model_props: ({ id, tab, active }: { id: number | string; tab: number; active?: number | string; }) => {
    const activeStr = active !== undefined ? `&active=${active}` : '';
    return `/models/${id}?tab=${tab}${activeStr}`;
  }
} as const;
