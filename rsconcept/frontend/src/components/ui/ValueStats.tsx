import { CProps } from '@/components/props';
import { PARAMETER } from '@/utils/constants';

import ValueIcon from './ValueIcon';

interface ValueStatsProps extends CProps.Styling, CProps.Titled {
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
function ValueStats(props: ValueStatsProps) {
  return <ValueIcon dense smallThreshold={PARAMETER.statSmallThreshold} textClassName='min-w-[1.4rem]' {...props} />;
}

export default ValueStats;
