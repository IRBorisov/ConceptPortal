import { type Extension } from '@codemirror/state';
import { hoverTooltip, type TooltipView } from '@codemirror/view';
import clsx from 'clsx';

import { labelCstTypification } from '../../labels';
import { type IConstituenta, type IRSForm } from '../../models/rsform';
import { isBasicConcept } from '../../models/rsformAPI';

import { findAliasAt } from './utils';

const tooltipProducer = (schema: IRSForm, canClick?: boolean) => {
  return hoverTooltip((view, pos) => {
    const { alias, start, end } = findAliasAt(pos, view.state);
    if (!alias) {
      return null;
    }
    const cst = schema.cstByAlias.get(alias);
    return {
      pos: start,
      end: end,
      above: false,
      create: () => domTooltipConstituenta(cst, canClick)
    };
  });
};

export function rsHoverTooltip(schema: IRSForm, canClick?: boolean): Extension {
  return [tooltipProducer(schema, canClick)];
}

/**
 * Create DOM tooltip for {@link Constituenta}.
 */
function domTooltipConstituenta(cst?: IConstituenta, canClick?: boolean): TooltipView {
  const dom = document.createElement('div');
  dom.className = clsx(
    'max-h-[25rem] max-w-[25rem] min-w-[10rem]',
    'dense',
    'p-2',
    'border shadow-md',
    'cc-scroll-y',
    'text-sm font-main'
  );

  if (!cst) {
    const text = document.createElement('p');
    text.innerText = 'Конституента не определена';
    dom.appendChild(text);
  } else {
    const alias = document.createElement('p');
    alias.className = 'font-math';
    alias.style.overflowWrap = 'anywhere';
    alias.innerHTML = `<b>${cst.alias}:</b> ${labelCstTypification(cst)}`;
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
