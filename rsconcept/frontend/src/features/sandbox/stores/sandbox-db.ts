import Dexie, { type Table } from 'dexie';

import { type SandboxBundle } from '../models/bundle';

const DB_NAME = 'portal_sandbox';
const STORE_VERSION = 1;

export interface SandboxBundleRow {
  id: 'current';
  bundle: SandboxBundle;
}

/** IndexedDB store for the single active sandbox bundle (MVP). */
export class SandboxDB extends Dexie {
  bundle!: Table<SandboxBundleRow, 'current'>;

  constructor() {
    super(DB_NAME);
    this.version(STORE_VERSION).stores({
      bundle: 'id'
    });
  }
}

export const sandboxDB = new SandboxDB();
