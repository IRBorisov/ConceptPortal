import { Extension } from '@codemirror/state';
import { hoverTooltip } from '@codemirror/view';

import { IRSForm } from '@/models/rsform';
import { findAliasAt } from '@/utils/codemirror';
import { domTooltipConstituenta } from '@/utils/codemirror';

const globalsHoverTooltip = (schema: IRSForm) => {
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
      create: () => domTooltipConstituenta(cst)
    };
  });
};

export function rsHoverTooltip(schema: IRSForm): Extension {
  return [globalsHoverTooltip(schema)];
}
