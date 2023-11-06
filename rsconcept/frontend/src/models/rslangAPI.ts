// Module: RSLang model API

import { applyPattern } from '../utils/utils';
import { CstType } from './rsform';
import { IArgumentValue } from './rslang'

const LOCALS_REGEXP = /[_a-zα-ω][a-zα-ω]*\d*/g;

export function extractGlobals(expression: string): Set<string> {
  return new Set(expression.match(/[XCSADFPT]\d+/g) ?? []);
}

export function inferTemplatedType(templateType: CstType, args: IArgumentValue[]): CstType {
  if (args.length === 0 || args.some(arg => !arg.value)) {
    return templateType;
  } else if (templateType === CstType.PREDICATE) {
    return CstType.AXIOM;
  } else {
    return CstType.TERM;
  }
}

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

  console.log(body);
  console.log(head);
  console.log(args);
  console.log(mapping);

  if (!head) {
    return body;
  } else {
    return `[${head}] ${body}`
  }
}
