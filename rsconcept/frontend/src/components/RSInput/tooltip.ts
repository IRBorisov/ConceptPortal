import { Extension } from '@codemirror/state';
import { hoverTooltip } from '@codemirror/view';

import { IConstituenta } from '../../models/rsform';
import { labelCstTypification } from '../../utils/labels';

function createTooltipFor(cst: IConstituenta) {
  const dom = document.createElement('div');
  dom.className = 'overflow-y-auto border shadow-md max-h-[25rem] max-w-[25rem] min-w-[10rem] w-fit z-tooltip text-sm px-2 py-2';
  const alias = document.createElement('p');
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
    convention.innerHTML = `<b>Конвенция:</b> ${cst.convention}`;
    dom.appendChild(convention);
  }
  return { dom: dom }
}

export const getHoverTooltip = (items: IConstituenta[]) => {
  return hoverTooltip((view, pos, side) => {
    const {from, to, text} = view.state.doc.lineAt(pos);
    let start = pos, end = pos;
    while (start > from && /\w/.test(text[start - from - 1]))
      start--;
    while (end < to && /\w/.test(text[end - from]))
      end++;
    if (start === pos && side < 0 || end === pos && side > 0) {
      return null;
    }
    const alias = text.slice(start - from, end - from);
    const cst = items.find(cst => cst.alias === alias);
    if (!cst) {
      return null;
    }
    return {
      pos: start,
      end: end,
      above: false,
      create: () => createTooltipFor(cst)
    }
  });
}

export function rshoverTooltip(items: IConstituenta[]): Extension {
  return [getHoverTooltip(items)];
}
