/**
 * Module: Global constants.
 */

/**
 * Global application Parameters. The place where magic numbers are put to rest.
 */
export const PARAMETER = {
  smallScreen: 640, // == tailwind:sm
  smallTreeNodes: 50, // amount of nodes threshold for size increase for large graphs
  refreshTimeout: 100, // milliseconds delay for post-refresh actions
  minimalTimeout: 10, // milliseconds delay for fast updates
  zoomDuration: 500, // milliseconds animation duration
  navigationDuration: 300, // milliseconds navigation duration
  navigationPopupDelay: 300, // milliseconds delay for navigation popup

  fastAnimation: 200, // milliseconds - duration of fast animation
  fadeDuration: 300, // milliseconds - duration of fade animation
  dropdownDuration: 200, // milliseconds - duration of dropdown animation
  moveDuration: 500, // milliseconds - duration of move animation

  ossImageWidth: 1280, // pixels - size of OSS image
  ossImageHeight: 960, // pixels - size of OSS image
  ossContextMenuWidth: 200, // pixels - width of OSS context menu
  ossContextMenuHeight: 200, // pixels - height of OSS context menu
  ossGridSize: 10, // pixels - size of OSS grid
  ossMinDistance: 20, // pixels - minimum distance between node centers
  ossDistanceX: 180, // pixels - insert x-distance between node centers
  ossDistanceY: 100, // pixels - insert y-distance between node centers

  graphHandleSize: 3, // pixels - size of graph connection handle
  graphNodeRadius: 20, // pixels - radius of graph node
  graphNodePadding: 5, // pixels - padding of graph node
  graphHoverXLimit: 0.4, // ratio to clientWidth used to determine which side of screen popup should be
  graphHoverYLimit: 0.6, // ratio to clientHeight used to determine which side of screen popup should be
  graphPopupDelay: 500, // milliseconds delay for graph popup selections
  graphRefreshDelay: 10, // milliseconds delay for graph viewpoint reset

  ossLongLabel: 14, // characters - threshold for long labels - small font
  statSmallThreshold: 3, // characters - threshold for small labels - small font

  logicLabel: 'LOGIC',
  errorNodeLabel: '[ERROR]',
  exteorVersion: '4.9.7',

  TOOLTIP_WIDTH: 'max-w-[29rem]'
};

/**
 * Numeric limitations.
 */
export const limits = {
  location_len: 500,
  max_semantic_index: 900
};

/**
 * Exteor file extension for RSForm.
 */
export const EXTEOR_TRS_FILE = '.trs';

/**
 * Regex patterns for data validation.
 */
export const patterns = {
  login: '^[a-zA-Z][a-zA-Z0-9_\\-]{1,}[a-zA-Z0-9]$'
};

/**
 * Local URIs.
 */
export const resources = {
  privacy_policy: '/privacy.pdf',
  logo: '/logo_full.svg',
  db_schema: '/db_schema.svg'
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
export const external_urls = {
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
};

/**
 * Global element ID.
 */
export const globalIDs = {
  tooltip: 'global_tooltip',
  value_tooltip: 'value_tooltip',
  constituenta_tooltip: 'cst_tooltip',
  operation_tooltip: 'operation_tooltip',
  email_tooltip: 'email_tooltip',
  library_item_editor: 'library_item_editor',
  constituenta_editor: 'constituenta_editor',
  graph_schemas: 'graph_schemas_tooltip'
};

/**
 * Prefixes for generating unique keys for lists.
 */
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
  library_filters_list: 'library_filters_list_',
  location_head_list: 'location_head_list_',
  folders_list: 'folders_list_',
  topic_list: 'topic_list_',
  topic_item: 'topic_item_',
  library_list: 'library_list_',
  user_subs: 'user_subs_',
  user_editors: 'user_editors_',
  wordform_list: 'wordform_list_',
  rsedit_btn: 'rsedit_btn_'
};
