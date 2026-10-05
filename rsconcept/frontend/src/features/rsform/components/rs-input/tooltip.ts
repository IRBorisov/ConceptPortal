import { type Extension } from '@codemirror/state';
import { hoverTooltip, type TooltipView } from '@codemirror/view';

import { globalTx } from '@/i18n';
import { type Constituenta } from '@rsconcept/domain/library';
import { isBasicConcept } from '@rsconcept/domain/library/rsform-api';
import { type AstNode } from '@rsconcept/domain/parsing';
import { type ExpressionType, readTypeAnnotation, TokenID } from '@rsconcept/domain/rslang';
import { type RSErrorDescription } from '@rsconcept/domain/rslang/error';
import { labelType } from '@rsconcept/domain/rslang/labels';

import { cn } from '@/components/utils';
import { appendBoldTextRow, appendMathBoldLabelParagraph } from '@/utils/format';
import { isMac } from '@/utils/utils';

import { describeDiagnostic } from '../../labels';

import { Local } from './parse/parser.terms';
import { analyzeRSInput, readRSContext, rsContextField } from './rs-context';
import { findAliasAt } from './utils';

/** Hover tooltips for identifiers and error ranges; reads data from {@link RSEditorContext}. */
export const rsHoverTooltip: Extension = [
  rsContextField,
  hoverTooltip((view, pos) => {
    const context = readRSContext(view.state);
    const schema = context.schema;
    if (!schema) {
      return null;
    }
    const aliasData = findAliasAt(pos, view.state);
    const rangedErrors = context.errors?.filter(error => pos >= error.from && pos < error.to) ?? null;
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
        create: () => domTooltipConstituenta(cst ?? null, rangedErrors, context.onOpenEdit !== null)
      };
    } else {
      let type: ExpressionType | null = null;
      let parse = context.parse;
      if (!parse) {
        parse = analyzeRSInput(view.state.doc.toString(), schema, context.cstType, context.activeAlias);
        context.onParse?.(parse);
      }
      if (parse?.ast) {
        type = findLocalType(parse.ast, aliasData.alias, aliasData.node.from);
      }
      return {
        pos: aliasData.node.from,
        end: aliasData.node.to,
        above: false,
        create: () => domTooltipLocal(aliasData.alias, type, rangedErrors)
      };
    }
  })
];

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
  dom.className = cn(
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
    row.innerText = `${describeDiagnostic(error)}`;
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
      appendMathBoldLabelParagraph(
        dom,
        globalTx('tx.rsexpression') + globalTx('tx.general.colon'),
        cst.definition_formal
      );
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
