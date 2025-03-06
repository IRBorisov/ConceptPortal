import { type Page } from '@playwright/test';

import { type ICurrentUser, IUserLoginDTO } from '../../src/features/auth/backend/types';
import { BACKEND_URL } from './constants';

const dataAnonymousAuth: ICurrentUser = {
  id: null,
  username: '',
  is_staff: false,
  editor: []
};

const dataAdminAuth: ICurrentUser = {
  id: 1,
  username: 'admin',
  is_staff: true,
  editor: []
};

const dataUserAuth: ICurrentUser = {
  id: 2,
  username: 'user',
  is_staff: false,
  editor: [2]
};

let currentAuth = dataAnonymousAuth;

export async function setupAuth(context: Page) {
  await context.route(`${BACKEND_URL}/users/api/auth`, async route => {
    await route.fulfill({ json: currentAuth });
  });
}

export function authAnonymous() {
  currentAuth = dataAnonymousAuth;
}

export function authAdmin() {
  currentAuth = dataAdminAuth;
}

export function authUser() {
  currentAuth = dataUserAuth;
}

export async function setupLogin(page: Page) {
  await page.route(`${BACKEND_URL}/users/api/login`, async route => {
    const data = route.request().postDataJSON() as IUserLoginDTO;
    if (data.password !== 'password') {
      await route.fulfill({
        status: 400,
        json: {
          detail: 'Invalid credentials'
        }
      });
      return;
    }
    if (data.username === 'admin') {
      authAdmin();
    } else {
      authUser();
    }
    await route.fulfill({ status: 200 });
  });
}

export async function setupLogout(page: Page) {
  await page.route(`${BACKEND_URL}/users/api/logout`, async route => {
    authAnonymous();
    await route.fulfill({ status: 200 });
  });
}
