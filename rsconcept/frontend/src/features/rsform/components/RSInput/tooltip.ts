import { Extension } from '@codemirror/state';
import { hoverTooltip } from '@codemirror/view';

import { findAliasAt } from '@/utils/codemirror';
import { domTooltipConstituenta } from '@/utils/codemirror';

import { IRSForm } from '../../models/rsform';

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
