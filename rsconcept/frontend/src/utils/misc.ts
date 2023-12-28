/**
 * Module: miscellaneous static functions to generate UI resources.
 */

import { ILibraryItem } from '@/models/library';
import { CstType, IConstituenta, IRSForm } from '@/models/rsform';
import { IRSErrorDescription, RSErrorClass } from '@/models/rslang';
import { inferErrorClass } from '@/models/rslangAPI';

import { labelCstType } from './labels';

export function getCstTypePrefix(type: CstType) {
  // prettier-ignore
  switch (type) {
    case CstType.BASE: return 'X';
    case CstType.CONSTANT: return 'C';
    case CstType.STRUCTURED: return 'S';
    case CstType.AXIOM: return 'A';
    case CstType.TERM: return 'D';
    case CstType.FUNCTION: return 'F';
    case CstType.PREDICATE: return 'P';
    case CstType.THEOREM: return 'T';
  }
}

export function validateCstAlias(alias: string, type: CstType, schema: IRSForm): boolean {
  return alias.length >= 2 && alias[0] == getCstTypePrefix(type) && !schema.items.find(cst => cst.alias === alias);
}

export function getCstExpressionPrefix(cst: IConstituenta): string {
  return cst.alias + (cst.cst_type === CstType.STRUCTURED ? '::=' : ':==');
}

export function getCstTypeShortcut(type: CstType) {
  const prefix = labelCstType(type) + ' [Alt + ';
  // prettier-ignore
  switch (type) {
    case CstType.BASE: return prefix + '1]';
    case CstType.STRUCTURED: return prefix + '2]';
    case CstType.TERM: return prefix + '3]';
    case CstType.AXIOM: return prefix + '4]';
    case CstType.FUNCTION: return prefix + 'Q]';
    case CstType.PREDICATE: return prefix + 'W]';
    case CstType.CONSTANT: return prefix + '5]';
    case CstType.THEOREM: return prefix + '6]';
  }
}

export function createAliasFor(type: CstType, schema: IRSForm): string {
  const prefix = getCstTypePrefix(type);
  if (!schema.items || schema.items.length <= 0) {
    return `${prefix}1`;
  }
  const index = schema.items.reduce((prev, cst, index) => {
    if (cst.cst_type !== type) {
      return prev;
    }
    index = Number(cst.alias.slice(1 - cst.alias.length)) + 1;
    return Math.max(prev, index);
  }, 1);
  return `${prefix}${index}`;
}

export function cloneTitle(target: ILibraryItem): string {
  if (!target.title.includes('[клон]')) {
    return target.title + ' [клон]';
  } else {
    return target.title + '+';
  }
}

export function getRSErrorPrefix(error: IRSErrorDescription): string {
  const id = error.errorType.toString(16);
  // prettier-ignore
  switch(inferErrorClass(error.errorType)) {
    case RSErrorClass.LEXER: return 'L' + id;
    case RSErrorClass.PARSER: return 'P' + id;
    case RSErrorClass.SEMANTIC: return 'S' + id;
    case RSErrorClass.UNKNOWN: return 'U' + id;
  }
}
