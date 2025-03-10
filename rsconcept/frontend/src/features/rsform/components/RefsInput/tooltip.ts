import { syntaxTree } from '@codemirror/language';
import { type Extension } from '@codemirror/state';
import { hoverTooltip, type TooltipView } from '@codemirror/view';
import clsx from 'clsx';

import { APP_COLORS } from '@/styling/colors';
import { findContainedNodes } from '@/utils/codemirror';

import { colorFgGrammeme } from '../../colors';
import { describeConstituentaTerm, labelGrammeme } from '../../labels';
import { type IEntityReference, type ISyntacticReference } from '../../models/language';
import { parseGrammemes } from '../../models/languageAPI';
import { type IConstituenta, type IRSForm } from '../../models/rsform';

import { RefEntity } from './parse/parser.terms';
import { findReferenceAt } from './utils';

export const tooltipProducer = (schema: IRSForm, canClick?: boolean) => {
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
        create: () => domTooltipEntityReference(parse.ref as IEntityReference, cst, canClick)
      };
    } else {
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
        create: () => domTooltipSyntacticReference(parse.ref as ISyntacticReference, masterText, canClick)
      };
    }
  });
};

export function refsHoverTooltip(schema: IRSForm, canClick?: boolean): Extension {
  return [tooltipProducer(schema, canClick)];
}

/**
 * Create DOM tooltip for {@link IEntityReference}.
 */
function domTooltipEntityReference(ref: IEntityReference, cst: IConstituenta | null, canClick?: boolean): TooltipView {
  const dom = document.createElement('div');
  dom.className = clsx(
    'max-h-100 max-w-100 min-w-40',
    'dense',
    'p-2 flex flex-col',
    'border shadow-md',
    'cc-scroll-y',
    'text-sm',
    'select-none cursor-auto'
  );

  const header = document.createElement('p');
  header.innerHTML = '<b>Ссылка на конституенту</b>';
  dom.appendChild(header);

  const term = document.createElement('p');
  term.innerHTML = `<b>${ref.entity}:</b> ${describeConstituentaTerm(cst)}`;
  dom.appendChild(term);

  const grams = document.createElement('div');
  grams.className = 'flex flex-wrap gap-1 mt-1';
  parseGrammemes(ref.form).forEach(gramStr => {
    const gram = document.createElement('div');
    gram.id = `tooltip-${gramStr}`;
    gram.className = 'min-w-12 px-1 border rounded-md text-sm text-center whitespace-nowrap';
    gram.style.borderWidth = '1px';
    gram.style.borderColor = colorFgGrammeme(gramStr);
    gram.style.color = colorFgGrammeme(gramStr);
    gram.style.fontWeight = '600';
    gram.style.backgroundColor = APP_COLORS.bgInput;
    gram.innerText = labelGrammeme(gramStr);
    grams.appendChild(gram);
  });
  dom.appendChild(grams);

  if (canClick) {
    const clickTip = document.createElement('p');
    clickTip.className = 'text-center text-xs mt-1';
    clickTip.innerHTML = 'Ctrl + клик для перехода</br>Ctrl + пробел для редактирования';
    dom.appendChild(clickTip);
  }

  return { dom: dom };
}

/**
 * Create DOM tooltip for {@link ISyntacticReference}.
 */
function domTooltipSyntacticReference(
  ref: ISyntacticReference,
  masterRef: string | null,
  canClick?: boolean
): TooltipView {
  const dom = document.createElement('div');
  dom.className = clsx(
    'max-h-100 max-w-100 min-w-40',
    'dense',
    'p-2 flex flex-col',
    'border shadow-md',
    'cc-scroll-y',
    'text-sm',
    'select-none cursor-auto'
  );

  const header = document.createElement('p');
  header.innerHTML = '<b>Связывание слов</b>';
  dom.appendChild(header);

  const offset = document.createElement('p');
  offset.innerHTML = `<b>Смещение:</b> ${ref.offset}`;
  dom.appendChild(offset);

  const master = document.createElement('p');
  master.innerHTML = `<b>Основная ссылка: </b> ${masterRef ?? 'не определена'}`;
  dom.appendChild(master);

  const nominal = document.createElement('p');
  nominal.innerHTML = `<b>Начальная форма:</b> ${ref.nominal}`;
  dom.appendChild(nominal);

  if (canClick) {
    const clickTip = document.createElement('p');
    clickTip.className = 'text-center text-xs mt-1';
    clickTip.innerHTML = 'Ctrl + пробел для редактирования';
    dom.appendChild(clickTip);
  }

  return { dom: dom };
}
