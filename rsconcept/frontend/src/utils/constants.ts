/**
 * Module: Global constants.
 */

/**
 * Variable constants depending on build type.
 */
export const buidConstants = {
  backend: import.meta.env.VITE_PORTAL_BACKEND as string
};

/**
 * General UI timeout [in ms] for waiting for render.
 */
export const TIMEOUT_UI_REFRESH = 100;

/**
 * Timeout [in ms] for graph refresh.
 */
export const TIMEOUT_GRAPH_REFRESH = 200;

/**
 * Exteor file extension for RSForm.
 */
export const EXTEOR_TRS_FILE = '.trs';

/**
 * Resource relative URIs.
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
 * Constant URLs.
 */
export const urls = {
  concept: 'https://www.acconcept.ru/',
  exteor32: 'https://drive.google.com/open?id=1IHlMMwaYlAUBRSxU1RU_hXM5mFU9-oyK&usp=drive_fs',
  exteor64: 'https://drive.google.com/open?id=1IJt25ZRQ-ZMA6t7hOqmo5cv05WJCQKMv&usp=drive_fs',
  ponomarev: 'https://inponomarev.ru/textbook',
  intro_video: 'https://www.youtube.com/watch?v=0Ty9mu9sOJo',
  full_course: 'https://www.youtube.com/playlist?list=PLGe_JiAwpqu1C70ruQmCm_OWTWU3KJwDo',

  gitrepo: 'https://github.com/IRBorisov/ConceptPortal',
  mailportal: 'mailto:portal@acconcept.ru',
  restapi: 'https://api.portal.acconcept.ru'
};

/**
 * Global unique IDs.
 */
export const globalIDs = {
  password_tooltip: 'password-tooltip',
  main_scroll: 'main-scroll',
  library_item_editor: 'library-item-editor',
  constituenta_editor: 'constituenta-editor'
};

/**
 * Prefixes for generating unique keys for lists.
 */
export const prefixes = {
  page_size: 'page-size-',
  cst_list: 'cst-list-',
  cst_hidden_list: 'cst-hidden-list-',
  cst_modal_list: 'cst-modal-list-',
  cst_template_ist: 'cst-template-list-',
  cst_wordform_list: 'cst-wordform-list-',
  cst_status_list: 'cst-status-list-',
  cst_match_mode_list: 'cst-match-mode-list-',
  cst_source_list: 'cst-source-list-',
  cst_delete_list: 'cst-delete-list-',
  cst_dependant_list: 'cst-dependant-list-',
  csttype_list: 'csttype-',
  library_filters_list: 'library-filters-list-',
  topic_list: 'topic-list-',
  library_list: 'library-list-',
  wordform_list: 'wordform-list-',
  rsedit_btn: 'rsedit-btn-'
};
