// Module: RSLang model API

import { CstType } from './rsform';
import { IArgumentValue } from './rslang'

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

export function substituteTemplateArgs(expression: string, args: IArgumentValue[]): string {
  if (args.every(arg => !arg.value)) {
    return expression;
  }

  const mapping: { [key: string]: string } = {};
  args.filter(arg => !!arg.value).forEach(arg => { mapping[arg.alias] = arg.value!; })



  // TODO: figure out actual substitution
  return expression
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
          
        }
      }
    }
  }
  return {
    head: '',
    body: target
  }
}

// function applyPattern(text: string, mapping: { [key: string]: string }, pattern: RegExp): string {
//   /** Apply mapping to matching in regular expression patter subgroup 1. */
//   if (text === '' || pattern === null) {
//       return text;
//   }
//   let posInput: number = 0;
//   let output: string = '';
//   const patternMatches = text.matchAll(pattern);
//   for (const segment of patternMatches) {
//       const entity = segment[1];
//       if (entity in mapping) {
//           output += text.substring(posInput, segment.index);
//           output += mapping[entity];
//           output += text.substring(segment.index, segment.index + segment[0].length);
//           posInput = segment.index + segment[0].length;
//       }
//   }
//   output += text.substring(posInput);
//   return output;
// }

// def apply_pattern(text: str, mapping: dict[str, str], pattern: re.Pattern[str]) -> str:
//     ''' Apply mapping to matching in regular expression patter subgroup 1. '''
//     if text == '' or pattern == '':
//         return text
//     pos_input: int = 0
//     output: str = ''
//     for segment in re.finditer(pattern, text):
//         entity = segment.group(1)
//         if entity in mapping:
//             output += text[pos_input : segment.start(1)]
//             output += mapping[entity]
//             output += text[segment.end(1) : segment.end(0)]
//             pos_input = segment.end(0)
//     output += text[pos_input : len(text)]
//     return output