import clsx from 'clsx';
import type { TabProps } from 'react-tabs';
import { Tab } from 'react-tabs';

import { globalIDs } from '@/utils/constants';

interface ConceptTabProps
extends Omit<TabProps, 'children'> {
  label?: string
}

function ConceptTab({
  label, title, className,
  ...otherProps
}: ConceptTabProps) {
  return (
  <Tab
    className={clsx(
      'min-w-[6rem]',
      'px-2 py-1 flex justify-center',
      'clr-tab',
      'text-sm whitespace-nowrap small-caps font-semibold',
      'select-none hover:cursor-pointer',
      className
    )}
    data-tooltip-id={title ? (globalIDs.tooltip) : undefined}
    data-tooltip-content={title}
    {...otherProps}
  >
    {label}
  </Tab>);
}

ConceptTab.tabsRole = 'Tab';

export default ConceptTab;