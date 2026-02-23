import { type Extension } from '@codemirror/state';
import { hoverTooltip, type TooltipView } from '@codemirror/view';
import clsx from 'clsx';

import { type ExpressionType, TokenID } from '@/features/rslang';
import { labelType } from '@/features/rslang/labels';

import { type AstNode } from '@/utils/parsing';

import { type Constituenta, type RSForm } from '../../models/rsform';
import { isBasicConcept } from '../../models/rsform-api';

import { Local } from './parse/parser.terms';
import { findAliasAt } from './utils';

const tooltipProducer = (schema: RSForm, canClick?: boolean) => {
  return hoverTooltip((view, pos) => {
    const data = findAliasAt(pos, view.state);
    if (!data) {
      return null;
    }
    if (data.node.type.id !== Local) {
      const cst = schema.cstByAlias.get(data.alias);
      return {
        pos: data.node.from,
        end: data.node.to,
        above: false,
        create: () => domTooltipConstituenta(cst, canClick)
      };
    } else {
      const parse = schema.analyzer.checkFull(view.state.doc.toString(), { annotateTypes: true });
      let type: ExpressionType | null = null;
      if (parse.ast) {
        type = findLocalType(parse.ast, data.alias, data.node.from);
      }
      return {
        pos: data.node.from,
        end: data.node.to,
        above: false,
        create: () => domTooltipLocal(data.alias, type)
      };
    }
  });
};

export function rsHoverTooltip(schema: RSForm, canClick?: boolean): Extension {
  return [tooltipProducer(schema, canClick)];
}


// ========= Internal =========

function findLocalType(ast: AstNode, alias: string, pos: number): ExpressionType | null {
  if (ast.from === pos && ast.typeID === TokenID.ID_LOCAL) {
    return ast.annotation ? ast.annotation.rsType as ExpressionType : null;
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

function domTooltipLocal(aliasText: string, type: ExpressionType | null): TooltipView {
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

  const alias = document.createElement('p');
  alias.className = 'font-math';
  alias.style.overflowWrap = 'anywhere';
  alias.innerHTML = `<b>${aliasText}:</b> ${labelType(type)}`;
  dom.appendChild(alias);

  return { dom: dom };
}

function domTooltipConstituenta(cst?: Constituenta, canClick?: boolean): TooltipView {
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
  return { dom: dom };
}
