import { type Extension } from '@codemirror/state';
import { hoverTooltip, type TooltipView } from '@codemirror/view';
import clsx from 'clsx';

import { type Constituenta, type RSForm } from '@/domain/library';
import { isBasicConcept } from '@/domain/library/rsform-api';
import { type AnalysisFull, type ExpressionType, readTypeAnnotation, TokenID } from '@/domain/rslang';
import { isCritical, type RSErrorDescription } from '@/domain/rslang/error';
import { describeRSError, labelType } from '@/domain/rslang/labels';

import { type AstNode } from '@/utils/parsing';

import { Local } from './parse/parser.terms';
import { findAliasAt } from './utils';

const tooltipProducer = (
  schema: RSForm,
  prepareParse: (value: string) => AnalysisFull | null,
  parse?: AnalysisFull | null,
  errors?: readonly RSErrorDescription[] | null,
  canClick?: boolean
) => {
  return hoverTooltip((view, pos) => {
    const aliasData = findAliasAt(pos, view.state);
    const effectiveErrors = errors ?? null;
    const rangedErrors = effectiveErrors?.filter(error => pos >= error.from && pos < error.to) ?? null;
    if (!aliasData) {
      if (!rangedErrors || rangedErrors.length === 0) {
        return null;
      }
      const [current] = rangedErrors;
      return {
        pos: current.from,
        end: current.to,
        above: false,
        create: () => domTooltipErrors(rangedErrors)
      };
    }

    if (aliasData.node.type.id !== Local) {
      const cst = schema.cstByAlias.get(aliasData.alias);
      return {
        pos: aliasData.node.from,
        end: aliasData.node.to,
        above: false,
        create: () => domTooltipConstituenta(cst ?? null, rangedErrors ?? null, canClick)
      };
    } else {
      let type: ExpressionType | null = null;
      if (!parse) {
        parse = prepareParse(view.state.doc.toString());
      }
      if (parse?.ast) {
        type = findLocalType(parse.ast, aliasData.alias, aliasData.node.from);
      }
      return {
        pos: aliasData.node.from,
        end: aliasData.node.to,
        above: false,
        create: () => domTooltipLocal(aliasData.alias, type, rangedErrors ?? null)
      };
    }
  });
};

export function rsHoverTooltip(
  schema: RSForm,
  prepareParse: (value: string) => AnalysisFull | null,
  parse?: AnalysisFull | null,
  errors?: readonly RSErrorDescription[] | null,
  canClick?: boolean
): Extension {
  return [tooltipProducer(schema, prepareParse, parse, errors, canClick)];
}

// ========= Internal =========

function findLocalType(ast: AstNode, alias: string, pos: number): ExpressionType | null {
  if (ast.from === pos && ast.typeID === TokenID.ID_LOCAL) {
    return readTypeAnnotation(ast);
  }
  for (const child of ast.children) {
    if (child.from <= pos) {
      const childType = findLocalType(child, alias, pos);
      if (childType) {
        return childType;
      }
    }
  }
  return null;
}

function createTooltipContainer(): HTMLDivElement {
  const dom = document.createElement('div');
  dom.className = clsx(
    'max-h-100 max-w-100 min-w-40',
    'dense',
    'p-2',
    'rounded-md shadow-md',
    'cc-scroll-y',
    'text-sm font-main bg-card',
    'select-none cursor-auto'
  );
  return dom;
}

function appendErrorRows(dom: HTMLDivElement, errors: readonly RSErrorDescription[]) {
  for (const error of errors) {
    const row = document.createElement('p');
    row.className = 'text-destructive';
    const title = isCritical(error.code) ? 'Ошибка' : 'Предупреждение';
    row.innerText = `${title}: ${describeRSError(error.code, error.params)}`;
    dom.appendChild(row);
  }
}

function domTooltipErrors(errors: readonly RSErrorDescription[]): TooltipView {
  const dom = createTooltipContainer();
  appendErrorRows(dom, errors);
  return { dom };
}

function domTooltipLocal(
  aliasText: string,
  type: ExpressionType | null,
  errors: readonly RSErrorDescription[] | null
): TooltipView {
  const dom = createTooltipContainer();

  const alias = document.createElement('p');
  alias.className = 'font-math';
  alias.style.overflowWrap = 'anywhere';
  alias.innerHTML = `<b>${aliasText}:</b> ${labelType(type)}`;
  dom.appendChild(alias);

  if (errors && errors.length > 0) {
    const divider = document.createElement('p');
    divider.className = 'my-1 border-t';
    dom.appendChild(divider);
    appendErrorRows(dom, errors);
  }

  return { dom: dom };
}

function domTooltipConstituenta(
  cst: Constituenta | null,
  errors: readonly RSErrorDescription[] | null,
  canClick?: boolean
): TooltipView {
  const dom = createTooltipContainer();

  if (!cst) {
    const text = document.createElement('p');
    text.innerText = 'Конституента не определена';
    dom.appendChild(text);
  } else {
    const alias = document.createElement('p');
    alias.className = 'font-math';
    alias.style.overflowWrap = 'anywhere';
    alias.innerHTML = `<b>${cst.alias}:</b> ${labelType(cst.analysis.type)}`;
    dom.appendChild(alias);

    if (cst.term_resolved) {
      const term = document.createElement('p');
      term.innerHTML = `<b>Термин:</b> ${cst.term_resolved}`;
      dom.appendChild(term);
    }

    if (cst.definition_formal) {
      const expression = document.createElement('p');
      expression.innerHTML = `<b>Выражение:</b> ${cst.definition_formal}`;
      dom.appendChild(expression);
    }

    if (cst.definition_resolved) {
      const definition = document.createElement('p');
      definition.innerHTML = `<b>Определение:</b> ${cst.definition_resolved}`;
      dom.appendChild(definition);
    }

    if (cst.convention) {
      const convention = document.createElement('p');
      if (isBasicConcept(cst.cst_type)) {
        convention.innerHTML = `<b>Конвенция:</b> ${cst.convention}`;
      } else {
        convention.innerHTML = `<b>Комментарий:</b> ${cst.convention}`;
      }
      dom.appendChild(convention);
    }

    if (cst.spawner_alias) {
      const derived = document.createElement('p');
      derived.innerHTML = `<b>Основание:</b> ${cst.spawner_alias}`;
      dom.appendChild(derived);
    }

    if (cst.spawn_alias.length > 0) {
      const children = document.createElement('p');
      children.innerHTML = `<b>Порождает:</b> ${cst.spawn_alias.join(', ')}`;
      dom.appendChild(children);
    }

    if (canClick) {
      const clickTip = document.createElement('p');
      clickTip.className = 'text-center text-xs mt-1';
      clickTip.innerText = 'Ctrl + клик для перехода';
      dom.appendChild(clickTip);
    }
  }

  if (errors && errors.length > 0) {
    const divider = document.createElement('p');
    divider.className = 'my-1 border-t';
    dom.appendChild(divider);
    appendErrorRows(dom, errors);
  }

  return { dom: dom };
}
