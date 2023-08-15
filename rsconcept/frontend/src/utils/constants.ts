// Constants
const prod = {
  backend: 'https://portal.acconcept.ru:8082',
  // backend: 'https://dev.concept.ru:8000',
  // backend: 'https://localhost:8000',
  // backend: 'https://api.portal.concept.ru',
};

const dev = {
  backend: 'http://localhost:8000',
};

export const config = process.env.NODE_ENV === 'production' ? prod : dev;
export const TIMEOUT_UI_REFRESH = 100;

export const urls = {
  concept: 'https://www.acconcept.ru/',
  exteor32: 'https://drive.google.com/open?id=1IHlMMwaYlAUBRSxU1RU_hXM5mFU9-oyK&usp=drive_fs',
  exteor64: 'https://drive.google.com/open?id=1IJt25ZRQ-ZMA6t7hOqmo5cv05WJCQKMv&usp=drive_fs',
  ponomarev: 'https://inponomarev.ru/textbook',
  intro_video: 'https://www.youtube.com/watch?v=0Ty9mu9sOJo',
  full_course: 'https://www.youtube.com/playlist?list=PLGe_JiAwpqu1C70ruQmCm_OWTWU3KJwDo',
  gitrepo: 'https://github.com/IRBorisov/ConceptPortal'
};

export const resources = {
  graph_font: '/DejaVu.ttf'
}

export const prefixes = {
  cst_list: 'cst-list-',
  cst_status_list: 'cst-status-list-'
}
