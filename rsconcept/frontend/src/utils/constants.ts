// Constants
const prod = {
  backend: 'http://rs.acconcept.ru:8000',
};

const dev = {
  backend: 'http://localhost:8000',
};

export const config = process.env.NODE_ENV === 'production' ? prod : dev;
export const timeout_updateUI = 100;

export const urls = {
  concept: 'https://www.acconcept.ru/',
  exteor32: 'https://drive.google.com/open?id=1IHlMMwaYlAUBRSxU1RU_hXM5mFU9-oyK&usp=drive_fs',
  exteor64: 'https://drive.google.com/open?id=1IJt25ZRQ-ZMA6t7hOqmo5cv05WJCQKMv&usp=drive_fs',
  ponomarev: 'https://inponomarev.ru/textbook',
  intro_video: 'https://www.youtube.com/watch?v=0Ty9mu9sOJo',
  full_course: 'https://www.youtube.com/playlist?list=PLGe_JiAwpqu1C70ruQmCm_OWTWU3KJwDo'
};

export const resources = {
  graph_font: 'https://ey2pz3.csb.app/NotoSansSC-Regular.ttf'
}

export const prefixes = {
  cst_list: 'cst-list-'
}
