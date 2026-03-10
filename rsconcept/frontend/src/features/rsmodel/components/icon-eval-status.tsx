import {
  type DomIconProps,
  IconStatusError,
  IconStatusOK,
  IconStatusUnknown
} from '@/components/icons';

import { EvalStatus } from '../models/rsmodel';

// TODO: specify icons

export function IconEvalStatus({ value, size = '1.25rem', className }: DomIconProps<EvalStatus>) {
  switch (value) {
    case EvalStatus.NO_EVAL:
    case EvalStatus.NOT_PROCESSED:
      return <IconStatusUnknown size={size} className={className} />;

    case EvalStatus.EVAL_FAIL:
    case EvalStatus.AXIOM_FALSE:
      return <IconStatusError size={size} className={className} />;

    case EvalStatus.EMPTY:
    case EvalStatus.HAS_DATA:
      return <IconStatusOK size={size} className={className} />;
  }
}