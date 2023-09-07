// Constants
export const config = {
  backend: import.meta.env.VITE_PORTAL_BACKEND as string
};
export const TIMEOUT_UI_REFRESH = 100;
export const TIMEOUT_GRAPH_REFRESH = 200;

export const youtube = {
  intro: '0Ty9mu9sOJo'
};

export const urls = {
  concept: 'https://www.acconcept.ru/',
  exteor32: 'https://drive.google.com/open?id=1IHlMMwaYlAUBRSxU1RU_hXM5mFU9-oyK&usp=drive_fs',
  exteor64: 'https://drive.google.com/open?id=1IJt25ZRQ-ZMA6t7hOqmo5cv05WJCQKMv&usp=drive_fs',
  ponomarev: 'https://inponomarev.ru/textbook',
  intro_video: 'https://www.youtube.com/watch?v=0Ty9mu9sOJo',
  full_course: 'https://www.youtube.com/playlist?list=PLGe_JiAwpqu1C70ruQmCm_OWTWU3KJwDo',

  gitrepo: 'https://github.com/IRBorisov/ConceptPortal',
  mailportal: 'mailto:portal@acconcept.ru',
  restapi: 'https://portal.acconcept.ru:8082/docs/'
};

export const resources = {
  graph_font: '/DejaVu.ttf'
}

export const globalIDs = {
  main_scroll: 'main-scroll'
}

export const prefixes = {
  cst_list: 'cst-list-',
  cst_status_list: 'cst-status-list-',
  topic_list: 'topic-list-',
  library_list: 'library-list-'
}
