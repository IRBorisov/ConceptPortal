// Constants
const prod = {
  url: {
    BASE: 'http://rs.acconcept.ru:8000/api/',
    AUTH: 'http://rs.acconcept.ru:8000/users/api/'
  }
};

const dev = {
  url: {
    BASE: 'http://localhost:8000/api/',
    AUTH: 'http://localhost:8000/users/api/'
  }
};

export const urls = {
  concept: 'https://www.acconcept.ru/',
  exteor32: 'https://drive.google.com/open?id=1IHlMMwaYlAUBRSxU1RU_hXM5mFU9-oyK&usp=drive_fs',
  exteor64: 'https://drive.google.com/open?id=1IJt25ZRQ-ZMA6t7hOqmo5cv05WJCQKMv&usp=drive_fs',
  ponomarev: 'https://inponomarev.ru/textbook',
  intro_video: 'https://www.youtube.com/watch?v=0Ty9mu9sOJo',
  full_course: 'https://www.youtube.com/playlist?list=PLGe_JiAwpqu1C70ruQmCm_OWTWU3KJwDo'
};

export const config = process.env.NODE_ENV === 'production' ? prod : dev;
