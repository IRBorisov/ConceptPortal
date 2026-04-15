import { CstStatus } from '@/domain/library';

import {
  type DomIconProps,
  IconStatusError,
  IconStatusIncalculable,
  IconStatusOK,
  IconStatusUnknown
} from '@/components/icons';

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
      return <IconStatusError size={size} className={className} />;
  }
}
