/**
 * Module: API for RSLanguage.
 */

import { type Tree } from '@lezer/common';

import { cursorNode } from '@/utils/codemirror';
import { PARAMETER } from '@/utils/constants';

import { CstType, type IRSErrorDescription, type RSErrorType } from '../backend/types';
import { labelCstTypification } from '../labels';

import { type IRSForm } from './rsform';
import { type AliasMapping, type IArgumentValue, RSErrorClass, type SyntaxTree } from './rslang';

// cspell:disable
const LOCALS_REGEXP = /[_a-zα-ω][a-zα-ω]*\d*/g;
const GLOBALS_REGEXP = /[XCSADFPT]\d+/g;
const COMPLEX_SYMBOLS_REGEXP = /[∀∃×ℬ;|:]/g;
const TYPIFICATION_SET = /^ℬ+\([ℬ\(X\d+\)×]*\)$/g;
// cspell:enable

/** Extracts global variable names from a given expression. */
export function extractGlobals(expression: string): Set<string> {
  return new Set(expression.match(GLOBALS_REGEXP) ?? []);
}

/** Check if expression is simple derivation. */
export function isSimpleExpression(text: string): boolean {
  return !text.match(COMPLEX_SYMBOLS_REGEXP);
}

/** Check if expression is set typification. */
export function isSetTypification(text: string): boolean {
  return !!text.match(TYPIFICATION_SET);
}

/** Infers type of constituent for a given template and arguments. */
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
 * const template = '[header] body content';
 * const result = splitTemplateDefinition(template);
 * // result: `{ head: 'header', body: 'body content' }`
 */
export function splitTemplateDefinition(target: string) {
  let start = 0;
  for (; start < target.length && target[start] !== '['; ++start);
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
          };
        }
      }
    }
  }
  return {
    head: '',
    body: target
  };
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

  const mapping: AliasMapping = {};
  args
    .filter(arg => !!arg.value)
    .forEach(arg => {
      mapping[arg.alias] = arg.value!;
    });

  let { head, body } = splitTemplateDefinition(expression);
  body = applyPattern(body, mapping, LOCALS_REGEXP);
  const argTexts = head.split(',').map(text => text.trim());
  head = argTexts
    .filter(arg => [...arg.matchAll(LOCALS_REGEXP)].every(local => local.every(match => !(match in mapping))))
    .join(', ');

  if (!head) {
    return body;
  } else {
    return `[${head}] ${body}`;
  }
}

/**
 * Generate ErrorID label.
 */
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

/** Apply alias mapping. */
export function applyAliasMapping(target: string, mapping: AliasMapping): string {
  return applyPattern(target, mapping, GLOBALS_REGEXP);
}

/** Apply alias typification mapping. */
export function applyTypificationMapping(target: string, mapping: AliasMapping): string {
  const modified = applyAliasMapping(target, mapping);
  if (modified === target) {
    return target;
  }

  const deleteBrackets: number[] = [];
  const positions: number[] = [];
  const booleans: number[] = [];
  let boolCount: number = 0;
  let stackSize: number = 0;

  for (let i = 0; i < modified.length; i++) {
    const char = modified[i];
    if (char === 'ℬ') {
      boolCount++;
      continue;
    }
    if (char === '(') {
      stackSize++;
      positions.push(i);
      booleans.push(boolCount);
    }
    boolCount = 0;
    if (char === ')') {
      if (
        i < modified.length - 1 &&
        modified[i + 1] === ')' &&
        stackSize > 1 &&
        positions[stackSize - 2] + booleans[stackSize - 1] + 1 === positions[stackSize - 1]
      ) {
        deleteBrackets.push(i);
        deleteBrackets.push(positions[stackSize - 2]);
      }
      if (i === modified.length - 1 && stackSize === 1 && positions[0] === 0) {
        deleteBrackets.push(i);
        deleteBrackets.push(positions[0]);
      }
      stackSize--;
      positions.pop();
      booleans.pop();
    }
  }

  let result = '';
  for (let i = 0; i < modified.length; i++) {
    if (!deleteBrackets.includes(i)) {
      result += modified[i];
    }
  }

  return result;
}

/** Transform Tree to {@link SyntaxTree}. */
export function transformAST(tree: Tree): SyntaxTree {
  const result: SyntaxTree = [];
  const parents: number[] = [];
  const cursor = tree.cursor();
  let finished = false;
  let leave = true;
  while (!finished) {
    let node = cursorNode(cursor);
    node.isLeaf = !cursor.firstChild();

    leave = true;
    result.push({
      uid: result.length,
      parent: parents.length > 0 ? parents[parents.length - 1] : result.length,
      typeID: node.type.id,
      start: node.from,
      finish: node.to,
      data: {
        dataType: 'string',
        value: node.type.name == '⚠' ? PARAMETER.errorNodeLabel : node.type.name
      }
    });
    parents.push(result.length - 1);

    if (!node.isLeaf) continue;

    for (;;) {
      node = cursorNode(cursor, node.isLeaf);
      if (leave) {
        parents.pop();
      }

      leave = cursor.type.isAnonymous;
      node.isLeaf = false;
      if (cursor.nextSibling()) {
        break;
      }
      if (!cursor.parent()) {
        finished = true;
        break;
      }
      leave = true;
    }
  }
  return result;
}

export function generatePrompt(schema: IRSForm): string {
  const intro =
    'Концептуальная схема — это формализованная модель предметной области, выраженная с помощью языка родов структур, основанного на аппарате формальной логики и теории множеств, и дополненная естественно-языковыми пояснениями. Она представляет собой систему взаимосвязанных определений, где каждое понятие или утверждение задаётся в строгом формате Обозначение - "Типизация" - "Термин" - "Определение в языке родов структур" - "Определение в естественном языке" - "Конвенция или комментарий".\nОбозначение — уникальный идентификатор понятия (например, X1, S3, F14).\nТипизация — структура элементов множества, моделирующего данное понятие (например, ℬ(X1) для подмножества индивидов или ℬ(X1×X1) для бинарных отношений или ℬ(X1) 🠔 [ℬ(X1×ℬ(X1))] — для терм-функции).\nТермин — название понятия в естественном языке.\nКонвенция описывает неопределяемые понятия предметным языком, включая уточнения, ограничения или примеры, включая ссылки на внешние данные (например, документы).\nВ формальном выражении используется ряд формальных конструкций.\npr1(α) — малая проекция, возвращающая компонент кортежа, соответствующий индексу.\nPr2,1(S1) — большая проекция, которая превращает множество кортежей в новую структуру в соответствии с набором индексов. В данном примере элементы S1 превращаются в пары, где на 1 месте стоит второй компонент, а на 2 месте — первый.\nFi1[S1](S2) — фильтр, который по заданным в квадратных скобках параметрам отбирает из множества кортежей в круглых скобках подмножество такое, что соответствующие заданным индексам компоненты кортежей из S2 включены в соответствующий параметр в квадратных скобках.\nD{ξ∈X1 | P1[ξ]} — декларативное объявление, которое позволяет задать область определения (слева от вертикальной черты) и логическое выражение (справа от черты), которое используется для отбора подмножества из области определения.\nI{(σ, γ) | σ:∈X1; γ:=F1[σ]; P1[σ, γ]} — императивное определения, задаваемое вычисляемым выражением элемента (слева от черты) и последовательностью действия (справа от черты), позволяющих сформировать необходимые для вычисления выражения переменные. Действия разделены точкой с запятой и представлены 3 видами: перебор элементов множества через :∈, вычисление выражения и присвоения значения переменной через := и логического блока, проверяющего некоторое условие, аналогично декларативному определению.\ndebool — преобразует одноэлементное множество в элемент (например, {x} → x)\nR{ξ:=D1 | F1[ξ]≠∅ | ξ∪F1[ξ]} — рекурсивное (циклическое) определение, состоящее из трех (иногда двух) блоков, разделенных вертикальной чертой. Первый блок — определение начального значения. Второй блок — условие продолжения цикла. Третий блок — следующее значение выражение вычисленное через текущее значение. Второй блок может быть пропущен, поскольку по умолчанию цикл останавливается если следующее значение равно текущему.\n------------\nДалее приведена концептуальная схема, описывающая некоторую предметную область.\n';
  const outro =
    '\n------\nПри ответе на следующий вопрос используй представленные в концептуальной схеме понятия и определения.\n';

  let body = `Название концептуальной схемы: ${schema.title}\n`;
  body += `[${schema.alias}] Описание: "${schema.description}"\n\n`;
  body += 'Понятия:\n';
  schema.items.forEach(item => {
    body += `${item.alias} - "${labelCstTypification(item)}" - "${item.term_resolved}" - "${
      item.definition_formal
    }" - "${item.definition_resolved}" - "${item.convention}"\n`;
  });
  return `${intro} ${body} ${outro}`;
}

// ====== Internals =========
/** Text substitution guided by mapping and regular expression. */
function applyPattern(text: string, mapping: AliasMapping, pattern: RegExp): string {
  if (text === '' || pattern === null) {
    return text;
  }
  let posInput = 0;
  let output = '';
  const patternMatches = text.matchAll(pattern);
  for (const segment of patternMatches) {
    const entity = segment[0];
    const start = segment.index ?? 0;
    if (entity in mapping) {
      output += text.substring(posInput, start);
      output += mapping[entity];
      posInput = start + segment[0].length;
    }
  }
  output += text.substring(posInput);
  return output;
}

const ERROR_LEXER_MASK = 512;
const ERROR_PARSER_MASK = 1024;
const ERROR_SEMANTIC_MASK = 2048;

/** Infers error class from error type (code). */
function inferErrorClass(error: RSErrorType): RSErrorClass {
  if ((error & ERROR_LEXER_MASK) !== 0) {
    return RSErrorClass.LEXER;
  } else if ((error & ERROR_PARSER_MASK) !== 0) {
    return RSErrorClass.PARSER;
  } else if ((error & ERROR_SEMANTIC_MASK) !== 0) {
    return RSErrorClass.SEMANTIC;
  } else {
    return RSErrorClass.UNKNOWN;
  }
}
