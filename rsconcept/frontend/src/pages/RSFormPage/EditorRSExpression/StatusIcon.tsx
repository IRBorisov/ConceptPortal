'use client';

import { IconStatusError, IconStatusIncalculable, IconStatusOK, IconStatusUnknown } from '@/components/Icons';
import { ExpressionStatus } from '@/models/rsform';

interface StatusIconProps {
  status: ExpressionStatus;
}

function StatusIcon({ status }: StatusIconProps) {
  if (status === ExpressionStatus.VERIFIED || status === ExpressionStatus.PROPERTY) {
    return <IconStatusOK size='1rem' />;
  } else if (status === ExpressionStatus.UNKNOWN) {
    return <IconStatusUnknown size='1rem' />;
  } else if (status === ExpressionStatus.INCALCULABLE) {
    return <IconStatusIncalculable size='1rem' />;
  } else {
    return <IconStatusError size='1rem' />;
  }
}

export default StatusIcon;
