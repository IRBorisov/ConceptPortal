/**
 * Module: API for RSLanguage.
 */

import { applyPattern } from '../utils/utils';
import { CstType } from './rsform';
import { IArgumentValue, RSErrorClass, RSErrorType } from './rslang'

const LOCALS_REGEXP = /[_a-zα-ω][a-zα-ω]*\d*/g;

/**
 * Extracts global variable names from a given expression.
 */
export function extractGlobals(expression: string): Set<string> {
  return new Set(expression.match(/[XCSADFPT]\d+/g) ?? []);
}

/**
 * Infers type of constituent for a given template and arguments.
 */
export function inferTemplatedType(templateType: CstType, args: IArgumentValue[]): CstType {
  if (args.length === 0 || args.some(arg => !arg.value)) {
    return templateType;
  } else if (templateType === CstType.PREDICATE) {
    return CstType.AXIOM;
  } else {
    return CstType.TERM;
  }
}

/**
 * Splits a string containing a template definition into its head and body parts.
 *
 * A template definition is expected to have the following format: `[head] body`.
 * If the input string does not contain the opening square bracket '[', the entire
 * string is treated as the body, and an empty string is assigned to the head.
 * If the opening bracket is present, the function attempts to find the matching
 * closing bracket ']' to determine the head and body parts.
 *
 * @example
 * const template = "[header] body content";
 * const result = splitTemplateDefinition(template);
 * // result: `{ head: 'header', body: 'body content' }`
 */
export function splitTemplateDefinition(target: string) {
  let start = 0;
  for (; start < target.length && target[start] !== '['; ++start) ;
  if (start < target.length) {
    for (let counter = 0, end = start + 1; end < target.length; ++end) {
      if (target[end] === '[') {
        ++counter;
      } else if (target[end] === ']') {
        if (counter !== 0) {
          --counter;
        } else {
          return {
            head: target.substring(start + 1, end).trim(),
            body: target.substring(end + 1).trim()
          }
        }
      }
    }
  }
  return {
    head: '',
    body: target
  }
}

/**
 * Substitutes values for template arguments in a given expression.
 *
 * This function takes an input mathematical expression and a list of argument values.
 * It replaces template argument placeholders in the expression with their corresponding values
 * from the provided arguments.
 */
export function substituteTemplateArgs(expression: string, args: IArgumentValue[]): string {
  if (args.every(arg => !arg.value)) {
    return expression;
  }

  const mapping: { [key: string]: string } = {};
  args.filter(arg => !!arg.value).forEach(arg => { mapping[arg.alias] = arg.value!; })

  let { head, body } = splitTemplateDefinition(expression);
  body = applyPattern(body, mapping, LOCALS_REGEXP);
  const argTexts = head.split(',').map(text => text.trim());
  head = argTexts
  .filter(
    arg => [...arg.matchAll(LOCALS_REGEXP)]
      .every(local => local.every(match => !(match in mapping)))
  ).join(', ');

  if (!head) {
    return body;
  } else {
    return `[${head}] ${body}`
  }
}

const ERRCODE_LEXER_MASK = 512;
const ERRCODE_PARSER_MASK = 1024;
const ERRCODE_TYPE_MASK = 2048;

/**
 * Infers error class from error type (code).
 */
export function inferErrorClass(error: RSErrorType): RSErrorClass {
  if ((error & ERRCODE_LEXER_MASK) !== 0) {
    return RSErrorClass.LEXER;
  } else if ((error & ERRCODE_PARSER_MASK) !== 0) {
    return RSErrorClass.PARSER;
  } else if ((error & ERRCODE_TYPE_MASK) !== 0) {
    return RSErrorClass.SEMANTIC;
  } else {
    return RSErrorClass.UNKNOWN;
  }
}