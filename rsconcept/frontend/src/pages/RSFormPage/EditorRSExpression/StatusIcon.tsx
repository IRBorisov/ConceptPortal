'use client';

import { BiBug, BiCheckCircle, BiHelpCircle, BiPauseCircle } from 'react-icons/bi';

import { ExpressionStatus } from '@/models/rsform';

interface StatusIconProps {
  status: ExpressionStatus;
}

function StatusIcon({ status }: StatusIconProps) {
  if (status === ExpressionStatus.VERIFIED || status === ExpressionStatus.PROPERTY) {
    return <BiCheckCircle size='1rem' />;
  } else if (status === ExpressionStatus.UNKNOWN) {
    return <BiHelpCircle size='1rem' />;
  } else if (status === ExpressionStatus.INCALCULABLE) {
    return <BiPauseCircle size='1rem' />;
  } else {
    return <BiBug size='1rem' />;
  }
}

export default StatusIcon;
