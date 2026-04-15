import { EvalStatus } from '@/domain/library';

import { APP_COLORS } from '@/styling/colors';

/** Determines background color for {@link CstStatus}. */
export function colorBgEvalStatus(status: EvalStatus): string {
  // prettier-ignore
  switch (status) {
    case EvalStatus.NO_EVAL: return APP_COLORS.bgInput;
    case EvalStatus.NOT_PROCESSED: return APP_COLORS.bgBlue;
    case EvalStatus.EVAL_FAIL: return APP_COLORS.bgRed;
    case EvalStatus.INVALID_DATA: return APP_COLORS.bgPurple;
    case EvalStatus.AXIOM_FALSE: return APP_COLORS.bgOrange;
    case EvalStatus.EMPTY: return APP_COLORS.bgTeal;
    case EvalStatus.HAS_DATA: return APP_COLORS.bgGreen50;
  }
}

/** Determines foreground color for {@link EvalStatus}. */
export function colorFgEvalStatus(status: EvalStatus): string {
  // prettier-ignore
  switch (status) {
    case EvalStatus.NO_EVAL: return APP_COLORS.fgDefault;
    case EvalStatus.NOT_PROCESSED: return APP_COLORS.fgBlue;
    case EvalStatus.INVALID_DATA: return APP_COLORS.fgPurple;
    case EvalStatus.EVAL_FAIL: return APP_COLORS.fgRed;
    case EvalStatus.AXIOM_FALSE: return APP_COLORS.fgOrange;
    case EvalStatus.EMPTY: return APP_COLORS.fgTeal;
    case EvalStatus.HAS_DATA: return APP_COLORS.fgGreen;
  }
}
