import { type Styling, type Titled } from '@/components/props';

import { ValueIcon } from './ValueIcon';

// characters - threshold for small labels - small font
const SMALL_THRESHOLD = 3;

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
  return <ValueIcon dense smallThreshold={SMALL_THRESHOLD} textClassName='min-w-5' {...props} />;
}
