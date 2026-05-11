import { type Extension } from '@codemirror/state';
import { hoverTooltip, type TooltipView } from '@codemirror/view';
import clsx from 'clsx';

import { type Constituenta, type RSForm } from '@/domain/library';
import { isBasicConcept } from '@/domain/library/rsform-api';
import { type AnalysisFull, type ExpressionType, readTypeAnnotation, TokenID } from '@/domain/rslang';
import { type RSErrorDescription } from '@/domain/rslang/error';
import { describeRSError, labelType } from '@/domain/rslang/labels';
import { globalTx } from '@/i18n';

import { appendBoldTextRow, appendMathBoldLabelParagraph } from '@/utils/format';
import { type AstNode } from '@/utils/parsing';
import { isMac } from '@/utils/utils';

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
    'select-none cursor-auto',
    'whitespace-pre-line'
  );
  return dom;
}

function appendErrorRows(dom: HTMLDivElement, errors: readonly RSErrorDescription[]) {
  for (const error of errors) {
    const row = document.createElement('p');
    row.className = 'text-destructive';
    row.innerText = `${describeRSError(error.code, error.params)}`;
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

  appendMathBoldLabelParagraph(dom, `${aliasText}:`, labelType(type));

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
    text.innerText = globalTx('tx.cst.undefined');
    dom.appendChild(text);
  } else {
    appendMathBoldLabelParagraph(dom, `${cst.alias}:`, labelType(cst.effectiveType));

    if (cst.term_resolved) {
      appendBoldTextRow(dom, globalTx('tx.lang.term') + globalTx('tx.general.colon'), cst.term_resolved);
    }

    if (cst.definition_formal) {
      appendBoldTextRow(dom, globalTx('tx.rsexpression') + globalTx('tx.general.colon'), cst.definition_formal);
    }

    if (cst.definition_resolved) {
      appendBoldTextRow(dom, globalTx('tx.lang.definition') + globalTx('tx.general.colon'), cst.definition_resolved);
    }

    if (cst.convention) {
      if (isBasicConcept(cst.cst_type)) {
        appendBoldTextRow(dom, globalTx('tx.lib.convention') + globalTx('tx.general.colon'), cst.convention);
      } else {
        appendBoldTextRow(dom, globalTx('tx.lib.comment') + globalTx('tx.general.colon'), cst.convention);
      }
    }

    if (cst.spawner_alias) {
      appendBoldTextRow(
        dom, //
        globalTx('tx.cst.spawner') + globalTx('tx.general.colon'),
        cst.spawner_alias
      );
    }

    if (cst.spawn_alias.length > 0) {
      appendBoldTextRow(
        dom,
        globalTx('tx.cst.spawned.plural.short') + globalTx('tx.general.colon'),
        cst.spawn_alias.join(', ')
      );
    }

    if (canClick) {
      const clickTip = document.createElement('p');
      clickTip.className = 'text-center text-xs mt-1';
      clickTip.innerText =
        (isMac() ? 'Cmd + ' : 'Ctrl + ') + globalTx('tx.general.click') + ' ' + globalTx('tx.shell.hotkey.toOpen');
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
