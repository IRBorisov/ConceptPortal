import {
  type DomIconProps,
  IconGraphCollapse,
  IconGraphExpand,
  IconGraphInputs,
  IconGraphOutputs,
  IconSettings
} from '@/components/icons1';

import { DependencyMode } from '../stores/cst-search';

/** Icon for term graph dependency mode. */
export function IconDependencyMode({ value, size = '1.25rem', className }: DomIconProps<DependencyMode>) {
  switch (value) {
    case DependencyMode.ALL:
      return <IconSettings size={size} className={className} />;
    case DependencyMode.OUTPUTS:
      return <IconGraphOutputs size={size} className={className ?? 'text-sec-600'} />;
    case DependencyMode.INPUTS:
      return <IconGraphInputs size={size} className={className ?? 'text-sec-600'} />;
    case DependencyMode.EXPAND_OUTPUTS:
      return <IconGraphExpand size={size} className={className ?? 'text-sec-600'} />;
    case DependencyMode.EXPAND_INPUTS:
      return <IconGraphCollapse size={size} className={className ?? 'text-sec-600'} />;
  }
}
