import {
  type DomIconProps,
  IconStatusError,
  IconStatusIncalculable,
  IconStatusOK,
  IconStatusUnknown
} from '@/components/icons';

import { ExpressionStatus } from '../models/rsform';

export function IconExpressionStatus({ value, size = '1.25rem', className }: DomIconProps<ExpressionStatus>) {
  switch (value) {
    case ExpressionStatus.VERIFIED:
    case ExpressionStatus.PROPERTY:
      return <IconStatusOK size={size} className={className} />;

    case ExpressionStatus.UNKNOWN:
      return <IconStatusUnknown size={size} className={className} />;
    case ExpressionStatus.INCALCULABLE:
      return <IconStatusIncalculable size={size} className={className} />;

    case ExpressionStatus.INCORRECT:
    case ExpressionStatus.UNDEFINED:
      return <IconStatusError size={size} className={className} />;
  }
}
