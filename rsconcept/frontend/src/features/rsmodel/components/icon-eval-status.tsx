import {
  type DomIconProps,
  IconMissingBase,
  IconStatusError,
  IconStatusNoEval,
  IconStatusOK,
  IconStatusUnknown
} from '@/components/icons';
import { EvalStatus } from '@/domain/library';

export function IconEvalStatus({ value, size = '1.25rem', className }: DomIconProps<EvalStatus>) {
  switch (value) {
    case EvalStatus.NO_EVAL:
      return <IconStatusNoEval size={size} className={className} />;
    case EvalStatus.NOT_PROCESSED:
      return <IconStatusUnknown size={size} className={className} />;

    case EvalStatus.INVALID_DATA:
    case EvalStatus.EVAL_FAIL:
    case EvalStatus.AXIOM_FALSE:
      return <IconStatusError size={size} className={className} />;

    case EvalStatus.EMPTY:
      return <IconMissingBase size={size} className={className} />;
    case EvalStatus.HAS_DATA:
      return <IconStatusOK size={size} className={className} />;
  }
}
