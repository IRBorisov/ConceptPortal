import { type Page } from '@playwright/test';

import { type ICurrentUser } from '../../src/features/auth/backend/types';
import { BACKEND_URL } from '../constants';

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

export async function authAnonymous(page: Page) {
  await page.route(`${BACKEND_URL}/users/api/auth`, async route => {
    await route.fulfill({ json: dataAnonymousAuth });
  });
}

export async function authAdmin(page: Page) {
  await page.route(`${BACKEND_URL}/users/api/auth`, async route => {
    await route.fulfill({ json: dataAdminAuth });
  });
}

export async function authUser(page: Page) {
  await page.route(`${BACKEND_URL}/users/api/auth`, async route => {
    await route.fulfill({ json: dataUserAuth });
  });
}
