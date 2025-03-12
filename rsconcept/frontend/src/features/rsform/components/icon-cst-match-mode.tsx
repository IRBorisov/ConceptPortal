import { type DomIconProps, IconAlias, IconFilter, IconFormula, IconTerm, IconText } from '@/components/icons';

import { CstMatchMode } from '../stores/cst-search';

/** Icon for constituenta match mode. */
export function IconCstMatchMode({ value, size = '1.25rem', className }: DomIconProps<CstMatchMode>) {
  switch (value) {
    case CstMatchMode.ALL:
      return <IconFilter size={size} className={className} />;
    case CstMatchMode.TEXT:
      return <IconText size={size} className={className ?? 'text-sec-600'} />;
    case CstMatchMode.EXPR:
      return <IconFormula size={size} className={className ?? 'text-sec-600'} />;
    case CstMatchMode.TERM:
      return <IconTerm size={size} className={className ?? 'text-sec-600'} />;
    case CstMatchMode.NAME:
      return <IconAlias size={size} className={className ?? 'text-sec-600'} />;
  }
}
