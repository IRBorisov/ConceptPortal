/**
 * Alias generation, validation, and remapping.
 */

import { applyEntityReferenceMapping } from '../../cctext/language-api';
import { type AliasMapping, applyAliasMapping, applyTypificationMapping } from '../../rslang/api';
import { type ArgumentValue, type CstType, type RSForm } from '../rsform';

import { getCstTypePrefix } from './cst-type';

/** Fields of {@link Constituenta} updated in place by alias mapping. */
export interface ConstituentaMappableFields {
  alias: string;
  definition_formal: string;
  typification_manual: string;
  term_raw: string;
  definition_raw: string;
}

/** Build alias mapping from template argument bindings. */
export function argumentValuesToMapping(args: ArgumentValue[]): AliasMapping {
  const mapping: AliasMapping = {};
  for (const arg of args) {
    if (arg.value) {
      mapping[arg.alias] = arg.value;
    }
  }
  return mapping;
}

/** Validate alias format for a given {@link CstType} (prefix + digits, min length 2). */
export function validateAliasFormat(alias: string, type: CstType): boolean {
  if (alias.length < 2) {
    return false;
  }
  const prefix = getCstTypePrefix(type);
  if (!alias.startsWith(prefix)) {
    return false;
  }
  if (!/^\d+$/.exec(alias.substring(prefix.length))) {
    return false;
  }
  return true;
}

/** Validate new alias against {@link CstType} and {@link RSForm}. */
export function validateNewAlias(alias: string, type: CstType, schema: RSForm): boolean {
  if (!validateAliasFormat(alias, type)) {
    return false;
  }
  if (schema.cstByAlias.has(alias)) {
    return false;
  }
  return true;
}

/** Generate alias for new {@link Constituenta} of a given {@link CstType} for current {@link RSForm}. */
export function generateAlias(type: CstType, schema: RSForm, takenAliases: string[] = []): string {
  const prefix = getCstTypePrefix(type);
  let index = schema.items.reduce((prev, cst) => {
    if (cst.cst_type !== type) {
      return prev;
    }
    const next = Number(cst.alias.substring(prefix.length)) + 1;
    return Math.max(prev, next);
  }, 1);
  let alias = `${prefix}${index}`;
  while (takenAliases.includes(alias)) {
    index = index + 1;
    alias = `${prefix}${index}`;
  }
  return alias;
}

/**
 * Remap formal expressions and terminological entity references in constituent fields.
 * Mutates each element of `items` in place; pass owned or cloned data only.
 */
export function applyMappingToConstituents<T extends ConstituentaMappableFields>(
  items: T[],
  mapping: AliasMapping,
  changeAliases: boolean
): void {
  for (const cst of items) {
    if (changeAliases && cst.alias in mapping) {
      cst.alias = mapping[cst.alias];
    }
    cst.definition_formal = applyAliasMapping(cst.definition_formal, mapping);
    cst.typification_manual = applyTypificationMapping(cst.typification_manual, mapping);
    cst.term_raw = applyEntityReferenceMapping(cst.term_raw, mapping);
    cst.definition_raw = applyEntityReferenceMapping(cst.definition_raw, mapping);
  }
}

/** Remove alias from expression. */
export function removeAliasReference(expression: string, alias: string): string {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return expression.replaceAll(new RegExp(`\\b${escaped}\\b`, 'g'), '').trim();
}

/** Add alias to expression. */
export function addAliasReference(expression: string, alias: string): string {
  return expression + ' ' + alias;
}
