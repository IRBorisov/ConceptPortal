import { syntaxTree } from '@codemirror/language';
import { type EditorState, type Extension } from '@codemirror/state';
import { hoverTooltip, type TooltipView } from '@codemirror/view';
import clsx from 'clsx';

import { findEnvelopingNodes } from '@/utils/codemirror';

import { describePromptVariable } from '../../labels';
import { type PromptVariableType } from '../../models/prompting';

import { Variable } from './parse/parser.terms';

/**
 * Retrieves variable from position in Editor.
 */
function findVariableAt(pos: number, state: EditorState) {
  const nodes = findEnvelopingNodes(pos, pos, syntaxTree(state), [Variable]);
  if (nodes.length !== 1) {
    return undefined;
  }
  const start = nodes[0].from;
  const end = nodes[0].to;
  const text = state.doc.sliceString(start, end);
  const match = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/.exec(text);
  const varName = match?.[1];
  if (!varName) {
    return undefined;
  }
  return {
    varName: varName,
    start: start,
    end: end
  };
}

const tooltipProducer = (available: string[]) => {
  return hoverTooltip((view, pos) => {
    const parse = findVariableAt(pos, view.state);
    if (!parse) {
      return null;
    }

    const isAvailable = available.includes(parse.varName);
    return {
      pos: parse.start,
      end: parse.end,
      above: false,
      create: () => domTooltipVariable(parse.varName, isAvailable)
    };
  });
};

export function variableHoverTooltip(available: string[]): Extension {
  return [tooltipProducer(available)];
}

/**
 * Create DOM tooltip for {@link PromptVariableType}.
 */
function domTooltipVariable(varName: string, isAvailable: boolean): TooltipView {
  const dom = document.createElement('div');
  dom.className = clsx(
    'max-h-100 max-w-100 min-w-40',
    'dense',
    'px-2 py-1 flex flex-col',
    'rounded-md shadow-md',
    'cc-scroll-y',
    'text-sm bg-card',
    'select-none cursor-auto'
  );

  const header = document.createElement('p');
  header.innerHTML = `<b>Переменная ${varName}</b>`;
  dom.appendChild(header);

  const status = document.createElement('p');
  status.className = isAvailable ? 'text-green-700' : 'text-red-700';
  status.innerText = isAvailable ? 'Доступна для использования' : 'Недоступна для использования';
  dom.appendChild(status);

  const desc = document.createElement('p');
  desc.className = '';
  desc.innerText = `Описание: ${describePromptVariable(varName as PromptVariableType)}`;
  dom.appendChild(desc);

  return { dom: dom };
}
