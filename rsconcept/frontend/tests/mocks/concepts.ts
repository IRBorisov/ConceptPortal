import { type Page } from '@playwright/test';

import { AccessPolicy, LibraryItemType } from '@rsconcept/domain/library';
import { type OperationSchemaDTO } from '../../src/features/oss/backend/types';
import { type RSFormDTO } from '../../src/features/rsform/backend/types';
import { type RSModelDTO } from '../../src/features/rsmodel/backend/types';
import { BACKEND_URL } from './constants';

const ISO_CREATE = '2026-01-01T00:00:00+00:00';
const ISO_UPDATE = '2026-01-02T00:00:00+00:00';
const rsformDetailsPattern = /\/api\/rsforms\/(\d+)\/details$/;
const rsformVersionPattern = /\/api\/library\/(\d+)\/versions\/(\d+)$/;
const ossDetailsPattern = /\/api\/oss\/(\d+)\/details$/;
const rsmodelDetailsPattern = /\/api\/models\/(\d+)\/details$/;

export const dataRSForms = new Map<number, RSFormDTO>();
export const dataOss = new Map<number, OperationSchemaDTO>();
export const dataRSModels = new Map<number, RSModelDTO>();

export function resetConceptMocks() {
  dataRSForms.clear();
  dataOss.clear();
  dataRSModels.clear();
}

export function createRSFormMock(id: number, title = `КС ${id}`): RSFormDTO {
  return {
    id,
    item_type: LibraryItemType.RSFORM,
    alias: `KS_${id}`,
    title,
    description: `Описание ${title}`,
    visible: true,
    read_only: false,
    location: '/U',
    access_policy: AccessPolicy.PUBLIC,
    time_create: ISO_CREATE,
    time_update: ISO_UPDATE,
    owner: 1,
    is_produced: false,
    editors: [],
    version: 1,
    versions: [],
    items: [],
    attribution: [],
    inheritance: [],
    oss: [],
    models: []
  };
}

export function createOssMock(id: number, title = `ОСС ${id}`): OperationSchemaDTO {
  return {
    id,
    item_type: LibraryItemType.OSS,
    alias: `OSS_${id}`,
    title,
    description: `Описание ${title}`,
    visible: true,
    read_only: false,
    location: '/U',
    access_policy: AccessPolicy.PUBLIC,
    time_create: ISO_CREATE,
    time_update: ISO_UPDATE,
    owner: 1,
    editors: [],
    operations: [],
    blocks: [],
    replicas: [],
    layout: [],
    arguments: [],
    substitutions: []
  };
}

export function createRSModelMock(id: number, schemaID: number, title = `Модель ${id}`): RSModelDTO {
  return {
    id,
    item_type: LibraryItemType.RSMODEL,
    alias: `M_${id}`,
    title,
    description: `Описание ${title}`,
    visible: true,
    read_only: false,
    location: '/U',
    access_policy: AccessPolicy.PUBLIC,
    time_create: ISO_CREATE,
    time_update: ISO_UPDATE,
    owner: 1,
    editors: [],
    schema: schemaID,
    items: []
  };
}

export async function setupConcepts(page: Page) {
  await page.route(new RegExp(`${BACKEND_URL}/api/rsforms/(\\d+)/details$`), async route => {
    const url = route.request().url();
    const matched = rsformDetailsPattern.exec(url);
    const id = matched ? Number(matched[1]) : null;
    const data = id !== null ? dataRSForms.get(id) : undefined;
    if (!data) {
      await route.fulfill({ status: 404, json: { detail: 'Not found' } });
      return;
    }
    await route.fulfill({ json: data });
  });

  await page.route(new RegExp(`${BACKEND_URL}/api/library/(\\d+)/versions/(\\d+)$`), async route => {
    const url = route.request().url();
    const matched = rsformVersionPattern.exec(url);
    const id = matched ? Number(matched[1]) : null;
    const version = matched ? Number(matched[2]) : null;
    const data = id !== null ? dataRSForms.get(id) : undefined;
    if (!data || version === null) {
      await route.fulfill({ status: 404, json: { detail: 'Not found' } });
      return;
    }
    await route.fulfill({ json: { ...data, version } });
  });

  await page.route(new RegExp(`${BACKEND_URL}/api/oss/(\\d+)/details$`), async route => {
    const url = route.request().url();
    const matched = ossDetailsPattern.exec(url);
    const id = matched ? Number(matched[1]) : null;
    const data = id !== null ? dataOss.get(id) : undefined;
    if (!data) {
      await route.fulfill({ status: 404, json: { detail: 'Not found' } });
      return;
    }
    await route.fulfill({ json: data });
  });

  await page.route(new RegExp(`${BACKEND_URL}/api/models/(\\d+)/details$`), async route => {
    const url = route.request().url();
    const matched = rsmodelDetailsPattern.exec(url);
    const id = matched ? Number(matched[1]) : null;
    const data = id !== null ? dataRSModels.get(id) : undefined;
    if (!data) {
      await route.fulfill({ status: 404, json: { detail: 'Not found' } });
      return;
    }
    await route.fulfill({ json: data });
  });
}
