import { syntaxTree } from '@codemirror/language';
import { Extension } from '@codemirror/state';
import { hoverTooltip } from '@codemirror/view';

import { IEntityReference, ISyntacticReference } from '@/models/language';
import { IRSForm } from '@/models/rsform';
import { IColorTheme } from '@/styling/color';
import {
  domTooltipEntityReference,
  domTooltipSyntacticReference,
  findContainedNodes,
  findReferenceAt
} from '@/utils/codemirror';

import { RefEntity } from './parse/parser.terms';

export const tooltipProducer = (schema: IRSForm, colors: IColorTheme, canClick?: boolean) => {
  return hoverTooltip((view, pos) => {
    const parse = findReferenceAt(pos, view.state);
    if (!parse) {
      return null;
    }

    if ('entity' in parse.ref) {
      const cst = schema.cstByAlias.get(parse.ref.entity);
      return {
        pos: parse.start,
        end: parse.end,
        above: false,
        create: () => domTooltipEntityReference(parse.ref as IEntityReference, cst, colors, canClick)
      };
    } else {
      let masterText: string | undefined = undefined;
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

export function refsHoverTooltip(schema: IRSForm, colors: IColorTheme, canClick?: boolean): Extension {
  return [tooltipProducer(schema, colors, canClick)];
}
