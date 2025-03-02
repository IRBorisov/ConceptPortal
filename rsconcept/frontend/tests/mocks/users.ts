import { type Page } from '@playwright/test';

import {
  type IUpdateProfileDTO,
  type IUserInfo,
  type IUserProfile,
  type IUserSignupDTO
} from '../../src/features/users/backend/types';
import { BACKEND_URL } from '../constants';

const dataActiveUsers: IUserInfo[] = [
  {
    id: 1,
    first_name: 'Admin',
    last_name: 'User'
  },
  {
    id: 2,
    first_name: 'User',
    last_name: 'User'
  }
];

let dataUserProfile: IUserProfile = {
  id: 1,
  username: 'user',
  email: 'user@example.com',
  first_name: 'User',
  last_name: 'User'
};

export async function setupUsers(page: Page) {
  await page.route(`${BACKEND_URL}/users/api/active-users`, async route => {
    await route.fulfill({ json: dataActiveUsers });
  });
}

export async function setupUserProfile(page: Page) {
  await page.route(`${BACKEND_URL}/users/api/profile`, async route => {
    await route.fulfill({ json: dataUserProfile });
  });
}

export async function setupUserSignup(page: Page) {
  await page.route(`${BACKEND_URL}/users/api/signup`, async route => {
    const data = route.request().postDataJSON() as IUserSignupDTO;
    const newID = dataActiveUsers.length + 1;
    dataActiveUsers.push({
      id: newID,
      first_name: data.first_name,
      last_name: data.last_name
    });
    dataUserProfile = {
      id: newID,
      username: data.username,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name
    };
    await route.fulfill({ json: dataUserProfile });
  });
}

export async function setupUserProfileUpdate(page: Page) {
  await page.route(`${BACKEND_URL}/users/api/profile`, async route => {
    dataUserProfile = {
      ...dataUserProfile,
      ...(route.request().postDataJSON() as IUpdateProfileDTO)
    };
    await route.fulfill({ json: dataUserProfile });
  });
}
