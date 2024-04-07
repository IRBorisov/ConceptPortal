import { syntaxTree } from '@codemirror/language';
import { Extension } from '@codemirror/state';
import { hoverTooltip } from '@codemirror/view';

import { parseEntityReference, parseSyntacticReference } from '@/models/languageAPI';
import { IRSForm } from '@/models/rsform';
import { IColorTheme } from '@/styling/color';
import {
  domTooltipEntityReference,
  domTooltipSyntacticReference,
  findContainedNodes,
  findEnvelopingNodes
} from '@/utils/codemirror';

import { ReferenceTokens } from './parse';
import { RefEntity, RefSyntactic } from './parse/parser.terms';

export const globalsHoverTooltip = (schema: IRSForm, colors: IColorTheme) => {
  return hoverTooltip((view, pos) => {
    const nodes = findEnvelopingNodes(pos, pos, syntaxTree(view.state), ReferenceTokens);
    if (nodes.length !== 1) {
      return null;
    }
    const start = nodes[0].from;
    const end = nodes[0].to;
    const text = view.state.doc.sliceString(start, end);
    if (nodes[0].type.id === RefEntity) {
      const ref = parseEntityReference(text);
      const cst = schema.cstByAlias.get(ref.entity);
      return {
        pos: start,
        end: end,
        above: false,
        create: () => domTooltipEntityReference(ref, cst, colors)
      };
    } else if (nodes[0].type.id === RefSyntactic) {
      const ref = parseSyntacticReference(text);
      let masterText: string | undefined = undefined;
      if (ref.offset > 0) {
        const entities = findContainedNodes(end, view.state.doc.length, syntaxTree(view.state), [RefEntity]);
        if (ref.offset <= entities.length) {
          const master = entities[ref.offset - 1];
          masterText = view.state.doc.sliceString(master.from, master.to);
        }
      } else {
        const entities = findContainedNodes(0, start, syntaxTree(view.state), [RefEntity]);
        if (-ref.offset <= entities.length) {
          const master = entities[-ref.offset - 1];
          masterText = view.state.doc.sliceString(master.from, master.to);
        }
      }
      return {
        pos: start,
        end: end,
        above: false,
        create: () => domTooltipSyntacticReference(ref, masterText)
      };
    } else {
      return null;
    }
  });
};

export function refsHoverTooltip(schema: IRSForm, colors: IColorTheme): Extension {
  return [globalsHoverTooltip(schema, colors)];
}
