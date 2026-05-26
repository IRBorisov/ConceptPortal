import { syntaxTree } from '@codemirror/language';
import { type Extension } from '@codemirror/state';
import { hoverTooltip, type TooltipView } from '@codemirror/view';
import clsx from 'clsx';

import { globalTx } from '@/i18n';
import { type EntityReference, type SyntacticReference } from '@rsconcept/domain/cctext';
import { type Constituenta, type RSForm } from '@rsconcept/domain/library';

import { findContainedNodes } from '@/utils/codemirror';
import { appendBoldTextRow } from '@/utils/format';
import { isMac } from '@/utils/utils';

import { describeConstituentaTerm } from '../../labels';

import { RefEntity } from './parse/parser.terms';
import { findReferenceAt } from './utils';

const tooltipProducer = (schema: RSForm, canClick?: boolean) => {
  return hoverTooltip((view, pos) => {
    const parse = findReferenceAt(pos, view.state);
    if (!parse) {
      return null;
    }

    if ('entity' in parse.ref) {
      const cst = schema.cstByAlias.get(parse.ref.entity) ?? null;
      return {
        pos: parse.start,
        end: parse.end,
        above: false,
        create: () => domTooltipEntityReference(parse.ref as EntityReference, cst, canClick)
      };
    }

    let masterText: string | null = null;
    if (parse.ref.offset > 0) {
      const entities = findContainedNodes(parse.end, view.state.doc.length, syntaxTree(view.state), [RefEntity]);
      if (parse.ref.offset <= entities.length) {
        const master = entities[parse.ref.offset - 1];
        masterText = view.state.doc.sliceString(master.from, master.to);
      }
    } else {
      const entities = findContainedNodes(0, parse.start, syntaxTree(view.state), [RefEntity]);
      if (-parse.ref.offset <= entities.length) {
        const master = entities[-parse.ref.offset - 1];
        masterText = view.state.doc.sliceString(master.from, master.to);
      }
    }

    return {
      pos: parse.start,
      end: parse.end,
      above: false,
      create: () => domTooltipSyntacticReference(parse.ref as SyntacticReference, masterText, canClick)
    };
  });
};

export function refsHoverTooltip(schema: RSForm, canClick?: boolean): Extension {
  return [tooltipProducer(schema, canClick)];
}

function domTooltipEntityReference(ref: EntityReference, cst: Constituenta | null, canClick?: boolean): TooltipView {
  const dom = document.createElement('div');
  dom.className = clsx(
    'max-h-100 max-w-100 min-w-40',
    'dense',
    'p-2 flex flex-col',
    'rounded-md shadow-md',
    'cc-scroll-y',
    'text-sm bg-card',
    'select-none cursor-auto',
    'whitespace-pre-line'
  );

  appendBoldTextRow(dom, globalTx('tx.lang.reference.entity'));

  appendBoldTextRow(dom, `${ref.entity}:`, describeConstituentaTerm(cst));

  const grams = document.createElement('div');
  grams.className = 'flex flex-wrap gap-1 mt-1';
  for (const gramStr of ref.tags) {
    const gram = document.createElement('div');
    gram.id = `tooltip-${gramStr}`;
    gram.className = 'min-w-12 px-1 border rounded-lg text-sm text-center whitespace-nowrap bg-accent';
    gram.style.borderWidth = '1px';
    gram.innerText = globalTx(`tx.lang.grammeme.${gramStr}`);
    grams.appendChild(gram);
  }
  dom.appendChild(grams);

  const controlsTip = document.createElement('p');
  controlsTip.className = 'text-left text-xs mt-1';
  controlsTip.textContent =
    'Alt + 1' +
    globalTx('tx.general.colon') +
    globalTx('tx.lang.reference.entity') +
    '\nAlt + 2' +
    globalTx('tx.general.colon') +
    globalTx('tx.lang.reference.syntactic');

  if (canClick) {
    controlsTip.textContent =
      (isMac() ? 'Cmd + ' : 'Ctrl + ') +
      globalTx('tx.general.click') +
      ' ' +
      globalTx('tx.general.colon') +
      globalTx('ui.rsform.refsTooltip.toOpen') +
      '\n' +
      controlsTip.textContent;
  }
  dom.appendChild(controlsTip);

  return { dom };
}

function domTooltipSyntacticReference(
  ref: SyntacticReference,
  masterRef: string | null,
  canClick?: boolean
): TooltipView {
  const dom = document.createElement('div');
  dom.className = clsx(
    'max-h-100 max-w-100 min-w-40',
    'dense',
    'p-2 flex flex-col',
    'rounded-md shadow-md',
    'cc-scroll-y',
    'text-sm bg-card',
    'select-none cursor-auto',
    'whitespace-pre-line'
  );

  appendBoldTextRow(dom, globalTx('tx.lang.reference.syntactic'));
  appendBoldTextRow(dom, globalTx('tx.lang.reference.offset.short') + ':', ref.offset);
  appendBoldTextRow(dom, globalTx('tx.lang.reference.master') + ':', masterRef ?? 'N/A');
  appendBoldTextRow(dom, globalTx('tx.lang.morphology.nominal') + ':', ref.nominal);

  if (canClick) {
    const clickTip = document.createElement('p');
    clickTip.className = 'text-center text-xs mt-1';
    clickTip.textContent = 'Alt + 2' + globalTx('tx.general.colon') + globalTx('tx.shell.hotkey.toEdit');
    dom.appendChild(clickTip);
  }

  return { dom };
}
