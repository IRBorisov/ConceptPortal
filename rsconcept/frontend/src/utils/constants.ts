/**
 * Module: Global constants.
 */

/**
 * Variable constants depending on build type.
 */
export const buildConstants = {
  backend: import.meta.env.VITE_PORTAL_BACKEND as string
};

/**
 * General UI timeout [in ms] for waiting for render.
 */
export const TIMEOUT_UI_REFRESH = 100;

/**
 * Threshold for small screen size optimizations.
 */
export const SMALL_SCREEN_WIDTH = 640; // == tailwind:xs

/**
 * Timeout [in ms] for graph refresh.
 */
export const TIMEOUT_GRAPH_REFRESH = 200;

/**
 * Exteor file extension for RSForm.
 */
export const EXTEOR_TRS_FILE = '.trs';

/**
 * Numeric limitations.
 */
export const limits = {
  library_alias_len: 12
};

/**
 * Regex patterns for data validation.
 */
export const patterns = {
  login: '^[a-zA-Z][a-zA-Z0-9_\\-]{1,}[a-zA-Z0-9]$',
  library_alias: `.{1,${limits.library_alias_len}}`
};

/**
 * Local URIs.
 */
export const resources = {
  graph_font: '/DejaVu.ttf',
  privacy_policy: '/privacy.pdf',
  logo: '/logo_full.svg'
};

/**
 * Youtube IDs for embedding.
 */
export const youtube = {
  intro: '0Ty9mu9sOJo'
};

/**
 * External URLs.
 */
export const urls = {
  concept: 'https://www.acconcept.ru/',
  exteor32: 'https://drive.google.com/open?id=1IHlMMwaYlAUBRSxU1RU_hXM5mFU9-oyK&usp=drive_fs',
  exteor64: 'https://drive.google.com/open?id=1IJt25ZRQ-ZMA6t7hOqmo5cv05WJCQKMv&usp=drive_fs',
  ponomarev: 'https://inponomarev.ru/textbook',
  intro_video: 'https://www.youtube.com/watch?v=0Ty9mu9sOJo',
  full_course: 'https://www.youtube.com/playlist?list=PLGe_JiAwpqu1C70ruQmCm_OWTWU3KJwDo',

  git_repo: 'https://github.com/IRBorisov/ConceptPortal',
  mail_portal: 'mailto:portal@acconcept.ru',
  restAPI: 'https://api.portal.acconcept.ru'
};

/**
 * Local storage ID.
 */
export const storage = {
  PREFIX: 'portal.',

  themeDark: 'theme.dark',

  rseditFont: 'rsedit.font',
  rseditShowList: 'rsedit.show_list',
  rseditShowControls: 'rsedit.show_controls',

  librarySearchStrategy: 'library.search.strategy',
  libraryPagination: 'library.pagination',

  rsgraphFilter: 'rsgraph.filter',
  rsgraphLayout: 'rsgraph.layout',
  rsgraphColoringScheme: 'rsgraph.coloring_scheme',

  cstFilterMatch: 'cst.filter.match',
  cstFilterGraph: 'cst.filter.graph'
};

/**
 * Global element ID.
 */
export const globals = {
  tooltip: 'global_tooltip',
  password_tooltip: 'password_tooltip',
  main_scroll: 'main_scroll',
  library_item_editor: 'library_item_editor',
  constituenta_editor: 'constituenta_editor'
};

/**
 * Prefixes for generating unique keys for lists.
 */
export const prefixes = {
  page_size: 'page_size_',
  cst_list: 'cst_list_',
  cst_inline_synth_list: 'cst_inline_synth_list_',
  cst_inline_synth_substitutes: 'cst_inline_synth_substitutes_',
  cst_side_table: 'cst_side_table_',
  cst_hidden_list: 'cst_hidden_list_',
  cst_modal_list: 'cst_modal_list_',
  cst_template_ist: 'cst_template_list_',
  cst_wordform_list: 'cst_wordform_list_',
  cst_status_list: 'cst_status_list_',
  cst_match_mode_list: 'cst_match_mode_list_',
  cst_source_list: 'cst_source_list_',
  cst_delete_list: 'cst_delete_list_',
  cst_dependant_list: 'cst_dependant_list_',
  csttype_list: 'csttype_',
  library_filters_list: 'library_filters_list_',
  topic_list: 'topic_list_',
  library_list: 'library_list_',
  wordform_list: 'wordform_list_',
  rsedit_btn: 'rsedit_btn_'
};
