import { syntaxTree } from "@codemirror/language"
import { Extension } from '@codemirror/state';
import { hoverTooltip } from '@codemirror/view';

import { parseEntityReference, parseSyntacticReference } from '../../models/language';
import { IConstituenta } from '../../models/rsform';
import { domTooltipEntityReference, domTooltipSyntacticReference, findEnvelopingNodes } from '../../utils/codemirror';
import { IColorTheme } from '../../utils/color';
import { RefEntity, RefSyntactic } from './parse/parser.terms';

export const globalsHoverTooltip = (items: IConstituenta[], colors: IColorTheme) => {
  return hoverTooltip((view, pos) => {
    const nodes = findEnvelopingNodes(pos, pos, syntaxTree(view.state), [RefEntity, RefSyntactic]);
    if (nodes.length !== 1) {
      return null;
    }
    const start = nodes[0].from;
    const end = nodes[0].to;
    const text = view.state.doc.sliceString(start, end);
    if (nodes[0].type.id === RefEntity) {
      const ref = parseEntityReference(text);
      const cst = items.find(cst => cst.alias === ref.entity);
      return {
        pos: start,
        end: end,
        above: false,
        create: () => domTooltipEntityReference(ref, cst, colors)
      }
    } else {
      const ref = parseSyntacticReference(text);
      return {
        pos: start,
        end: end,
        above: false,
        create: () => domTooltipSyntacticReference(ref)
      }
    }
  });
}

export function refsHoverTooltip(items: IConstituenta[], colors: IColorTheme): Extension {
  return [globalsHoverTooltip(items, colors)];
}
