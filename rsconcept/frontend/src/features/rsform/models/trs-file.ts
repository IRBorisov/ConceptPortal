/**
 * Module: TRS file preparation.
 */

import { strToU8, zipSync } from 'fflate';

import { CstType, type RSForm } from '@/domain/library';

const TRS_ENTITY_CONSTITUENTA = 'constituenta';
const TRS_ENTITY_SCHEMA = 'rsform';
const TRS_HEADER = 'Exteor 4.8.13.1000 - 30/05/2022';
const TRS_INNER_FILENAME = 'document.json';
const TRS_VERSION = 16;

/** Create TRS-compatible JSON payload from {@link RSForm}. */
export function prepareTRSData(schema: RSForm) {
  return {
    type: TRS_ENTITY_SCHEMA,
    title: schema.title,
    alias: schema.alias,
    comment: schema.description,
    items: schema.items
      .filter(cst => cst.cst_type !== CstType.NOMINAL)
      .map(cst => ({
        entityUID: cst.id,
        type: TRS_ENTITY_CONSTITUENTA,
        cstType: cst.cst_type,
        alias: cst.alias,
        convention: cst.convention,
        term: {
          raw: cst.term_raw,
          resolved: cst.term_resolved,
          forms: cst.term_forms
        },
        definition: {
          formal: cst.definition_formal,
          text: {
            raw: cst.definition_raw,
            resolved: cst.definition_resolved
          }
        }
      })),
    claimed: false,
    selection: [],
    version: TRS_VERSION,
    versionInfo: TRS_HEADER
  };
}

/** Create `.trs` archive blob from {@link RSForm}. */
export function prepareTRSFile(schema: RSForm): Blob {
  const json = JSON.stringify(prepareTRSData(schema), null, 4);

  const zipped = zipSync({
    [TRS_INNER_FILENAME]: strToU8(json)
  });

  return new Blob([new Uint8Array(zipped)], { type: 'application/zip' });
}
