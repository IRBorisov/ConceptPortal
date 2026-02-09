import {
  type DomIconProps,
  IconStatusError,
  IconStatusIncalculable,
  IconStatusOK,
  IconStatusUnknown
} from '@/components/icons';

import { CstStatus } from '../models/rsform';

export function IconExpressionStatus({ value, size = '1.25rem', className }: DomIconProps<CstStatus>) {
  switch (value) {
    case CstStatus.VERIFIED:
    case CstStatus.PROPERTY:
      return <IconStatusOK size={size} className={className} />;

    case CstStatus.UNKNOWN:
      return <IconStatusUnknown size={size} className={className} />;
    case CstStatus.INCALCULABLE:
      return <IconStatusIncalculable size={size} className={className} />;

    case CstStatus.INCORRECT:
    case CstStatus.UNDEFINED:
      return <IconStatusError size={size} className={className} />;
  }
}
