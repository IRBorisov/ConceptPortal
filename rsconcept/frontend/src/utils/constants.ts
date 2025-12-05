/**
 * Module: Global constants.
 */

/** Global application Parameters. The place where magic numbers are put to rest. */
export const PARAMETER = {
  smallScreen: 640, // Tailwind CSS 'sm' breakpoint for small screens (in pixels)

  minimalTimeout: 10, // Minimum delay for rapid UI updates (in milliseconds)
  refreshTimeout: 100, // Delay after refresh actions to allow UI to settle (in milliseconds)
  notificationDelay: 300, // Duration to display notifications (in milliseconds)
  zoomDuration: 500, // Duration of zoom animations (in milliseconds)
  navigationPopupDelay: 300, // Delay before showing navigation popups (in milliseconds)

  moveDuration: 500, // Duration of move animations (in milliseconds)
  graphLayoutDuration: 1000, // Duration of graph layout animations (in milliseconds)
  clickDelay: 250, // Delay before click actions (in milliseconds)

  ossImageWidth: 1280, // Default width for OSS images (in pixels)
  ossImageHeight: 960, // Default height for OSS images (in pixels)

  graphHandleSize: 3, // Size of graph connection handles (in pixels)
  graphNodePadding: 5, // Padding inside graph nodes (in pixels)
  graphNodeRadius: 20, // Radius of graph nodes (in pixels)

  indentJSON: 2, // Number of spaces for JSON indentation

  logicLabel: 'LOGIC',
  errorNodeLabel: '[ERROR]',
  exteorVersion: '4.9.7'
} as const;

/** Numeric limitations. */
export const limits = {
  len_alias: 255,
  len_email: 320,
  len_title: 500,
  len_location: 500,
  len_description: 10000,
  len_text: 20000
} as const;

/** Exteor file extension for RSForm. */
export const EXTEOR_TRS_FILE = '.trs';

/** Regex patterns for data validation. */
export const patterns = {
  login: '^[a-zA-Z][a-zA-Z0-9_\\-]{1,}[a-zA-Z0-9]$'
} as const;

/** Local URIs. */
export const resources = {
  privacy_policy: '/privacy.pdf',
  logo: '/logo_full.svg',
  db_schema: '/db_schema.svg'
} as const;

/** External URLs. */
export const external_urls = {
  portal: 'https://portal.acconcept.ru',
  concept: 'https://www.acconcept.ru/',
  exteor32: 'https://drive.google.com/open?id=1IHlMMwaYlAUBRSxU1RU_hXM5mFU9-oyK&usp=drive_fs',
  exteor64: 'https://drive.google.com/open?id=1IJt25ZRQ-ZMA6t7hOqmo5cv05WJCQKMv&usp=drive_fs',
  ponomarev: 'https://inponomarev.ru/textbook',
  intro_video: 'https://www.youtube.com/watch?v=0Ty9mu9sOJo',
  full_course: 'https://www.youtube.com/playlist?list=PLGe_JiAwpqu1C70ruQmCm_OWTWU3KJwDo',
  zak_lectures:
    'https://www.acconcept.ru/product/metody-konceptualnogo-analiza-i-sinteza-v-teoreticheskom-issledovanii-i-proektirovanii-socialno-jekonomicheskih-sistem-3-e-izdanie/',

  git_portal: 'https://github.com/IRBorisov/ConceptPortal',
  git_core: 'https://github.com/IRBorisov/ConceptCore',
  git_cctext: 'https://github.com/IRBorisov/cctext',
  mail_portal: 'mailto:portal@acconcept.ru',
  restAPI: 'https://api.portal.acconcept.ru'
} as const;

/** Youtube and VK IDs for embedding. */
export interface IVideo {
  /** Youtube ID. */
  youtube: string;

  /** VK ID. */
  vk: string;
}

/** Youtube and VK IDs for embedding. */
export const videos = {
  explication: {
    youtube: '0Ty9mu9sOJo',
    vk: 'oid=-232112636&id=456239017'
  }
};

/** Global element ID. */
export const globalIDs = {
  tooltip: 'global_tooltip',
  value_tooltip: 'value_tooltip',
  constituenta_tooltip: 'cst_tooltip',
  operation_tooltip: 'operation_tooltip',
  email_tooltip: 'email_tooltip',
  library_item_editor: 'library_item_editor',
  constituenta_editor: 'constituenta_editor',
  prompt_editor: 'prompt_editor',
  graph_schemas: 'graph_schemas_tooltip',
  user_dropdown: 'user_dropdown',
  ai_dropdown: 'ai_dropdown'
} as const;

/** Prefixes for generating unique keys for lists. */
export const prefixes = {
  page_size: 'page_size_',
  oss_list: 'oss_list_',
  cst_list: 'cst_list_',
  cst_side_table: 'cst_side_table_',
  cst_hidden_list: 'cst_hidden_list_',
  cst_status_list: 'cst_status_list_',
  cst_source_list: 'cst_source_list_',
  cst_delete_list: 'cst_delete_list_',
  cst_dependant_list: 'cst_dependant_list_',
  schemas_list: 'schemas_list_',
  operation_list: 'operation_list_',
  csttype_list: 'csttype_',
  policy_list: 'policy_list_',
  location_head_list: 'location_head_list_',
  folders_list: 'folders_list_',
  topic_list: 'topic_list_',
  topic_item: 'topic_item_',
  user_subs: 'user_subs_',
  user_editors: 'user_editors_',
  wordform_list: 'wordform_list_',
  rsedit_btn: 'rsedit_btn_'
} as const;
