import { type Page } from '@playwright/test';

import { type LibraryItem } from '@rsconcept/domain/library';
import { BACKEND_URL } from './constants';

export const dataLibraryItems: LibraryItem[] = [];

export async function setupLibrary(page: Page) {
  await page.route(`${BACKEND_URL}/api/library/all`, async route => {
    await route.fulfill({ json: dataLibraryItems });
  });
  await page.route(`${BACKEND_URL}/api/library/active`, async route => {
    await route.fulfill({ json: dataLibraryItems });
  });
}
