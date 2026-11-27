import { randomBytes } from 'node:crypto';

import { expect, test } from '@playwright/test';

import { type OperationCreatedResponse } from '@/features/oss/backend/types';
import { type RSFormDTO } from '@/features/rsform';

const site = process.env.PORTAL_TEST_SITE;
const api = process.env.PORTAL_TEST_API;
const username = process.env.PORTAL_TEST_USER;
const password = process.env.PORTAL_TEST_PASSWORD;

// eslint-disable-next-line playwright/no-skipped-test -- The live scenario needs an isolated Portal and explicit credentials.
test.skip(!site || !api || !username || !password, 'Requires an isolated local Portal and a test account');

test('relativization retries a stale creation and allows editing result texts', async ({ page, context }) => {
  test.setTimeout(120_000);
  for (const endpoint of [site!, api!]) {
    expect(new URL(endpoint).hostname).toMatch(/^(localhost|127\.0\.0\.1)$/);
  }
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.getByRole('textbox', { name: 'Логин или email' }).fill(username!);
  await page.getByRole('textbox', { name: 'Пароль' }).fill(password!);
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await page.waitForURL('**/library**');

  async function call<T>(method: string, path: string, data?: object): Promise<T> {
    const cookie = (await context.cookies(api)).find(item => item.name === 'csrftoken');
    const response = await context.request.fetch(api! + path, {
      method,
      data,
      headers: { 'Origin': site!, 'X-CSRFToken': cookie?.value ?? '' }
    });
    expect(response.ok(), await response.text()).toBe(true);
    return response.json() as Promise<T>;
  }

  const suffix = randomBytes(4).toString('hex');
  const metadata = { alias: 'CS' + suffix, title: 'Проверка графа', access_policy: 'private', location: '/U' };
  const source = await call<{ id: number }>('POST', '/api/rsforms/create-from-data', {
    item_data: metadata,
    schema_data: {
      attribution: [],
      items: [
        { id: 1, alias: 'X1', cst_type: 'basic', term_raw: 'вершины', convention: 'Множество вершин.' },
        {
          id: 2,
          alias: 'S1',
          cst_type: 'structure',
          term_raw: 'рёбра',
          definition_formal: 'ℬ(X1×X1)',
          convention: 'Упорядоченные пары вершин.'
        }
      ]
    }
  });
  const oss = await call<{ id: number }>('POST', '/api/library', {
    ...metadata,
    alias: 'OS' + suffix,
    title: 'ОСС для проверки релятивизации',
    item_type: 'oss'
  });
  const attached = await call<OperationCreatedResponse>('POST', '/api/oss/' + oss.id + '/import-schema', {
    item_data: { alias: metadata.alias, title: metadata.title, parent: null },
    source: source.id,
    clone_source: false,
    layout: [],
    position: { x: 0, y: 0, width: 180, height: 66 }
  });

  const openGraph = async () => {
    await page.goto('/oss/' + oss.id + '?tab=1', { waitUntil: 'domcontentloaded' });
    await page.locator('.react-flow__node[data-id="o' + attached.new_operation + '"]').waitFor();
  };
  await openGraph();
  await page.locator('.react-flow__node[data-id="o' + attached.new_operation + '"]').click();
  await page.getByRole('button', { name: /^Добавить/ }).click();
  await page.getByRole('button', { name: 'Релятивизация', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Релятивизация' });
  await dialog.getByRole('combobox', { name: 'Фокус релятивизации' }).click();
  await page.getByRole('button', { name: /^X1.*вершины/ }).click();
  await dialog.getByRole('textbox', { name: 'Имя семейства' }).fill('набор вершин');
  await dialog.getByRole('textbox', { name: 'Сокращение' }).fill('REL' + suffix);
  const create = dialog.getByRole('button', { name: 'Создать', exact: true });
  await page.route(
    '**/create-relativization',
    route =>
      route.continue({
        postData: JSON.stringify({ ...route.request().postDataJSON(), source_time_update: '2000-01-01T00:00:00Z' })
      }),
    { times: 1 }
  );
  const rejected = page.waitForResponse(response => response.url().endsWith('/create-relativization'));
  await create.click();
  expect((await rejected).status()).toBe(409);
  await expect(dialog.getByRole('textbox', { name: 'Имя семейства' })).toHaveValue('набор вершин');

  const saved = page.waitForResponse(response => response.url().endsWith('/create-relativization'));
  await create.click();
  const response = await saved;
  expect(response.status(), await response.text()).toBe(201);
  const data = (await response.json()) as OperationCreatedResponse;
  const result = data.oss.operations.find(row => row.id === data.new_operation)!.result;
  const stored = await call<RSFormDTO>('GET', '/api/rsforms/' + result + '/details');
  const axis = stored.items.find(row => row.term_raw === 'вершины (набор вершин)')!;
  expect(stored.items.some(row => row.term_raw === 'рёбра (набор вершин)')).toBe(true);
  expect(axis.convention).toBe(
    'Семейство «набор вершин» состоит из допустимых подмножеств множества «вершины»\n\nМножество вершин.'
  );
  expect(stored.projected).toContain(axis.id);
  const edited = 'Конвенция допустимых наборов вершин.';
  await call('PATCH', '/api/rsforms/' + result + '/update-cst', {
    target: axis.id,
    item_data: { convention: edited }
  });
  const updated = await call<RSFormDTO>('GET', '/api/rsforms/' + result + '/details');
  expect(updated.items.find(row => row.id === axis.id)?.convention).toBe(edited);
  await openGraph();
  const edge = page.locator('.react-flow__edge[data-id="o' + attached.new_operation + '-o' + data.new_operation + '"]');
  await expect(edge).toHaveCount(1);
  await expect(edge.locator('path.react-flow__edge-path')).toHaveAttribute('marker-end', /url/);
});
