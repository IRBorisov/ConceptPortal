import { type Styling, type Titled } from '@/components/props';
import { PARAMETER } from '@/utils/constants';

import { ValueIcon } from './ValueIcon';

interface ValueStatsProps extends Styling, Titled {
  /** Id of the component. */
  id: string;

  /** Icon to display. */
  icon: React.ReactNode;

  /** Value to display. */
  value: string | number;
}

/**
 * Displays statistics value with an icon.
 */
export function ValueStats(props: ValueStatsProps) {
  return <ValueIcon dense smallThreshold={PARAMETER.statSmallThreshold} textClassName='min-w-[1.4rem]' {...props} />;
}
