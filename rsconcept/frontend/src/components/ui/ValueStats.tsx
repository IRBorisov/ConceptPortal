import { PARAMETER } from '@/utils/constants';

import { CProps } from '../props';
import ValueIcon from './ValueIcon';

interface ValueStatsProps extends CProps.Styling, CProps.Titled {
  id: string;
  icon: React.ReactNode;
  value: string | number;
}

function ValueStats(props: ValueStatsProps) {
  return <ValueIcon dense smallThreshold={PARAMETER.statSmallThreshold} textClassName='min-w-[1.4rem]' {...props} />;
}

export default ValueStats;
