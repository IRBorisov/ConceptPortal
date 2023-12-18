import clsx from 'clsx';
import type { TabProps } from 'react-tabs';
import { Tab } from 'react-tabs';

interface ConceptTabProps
extends Omit<TabProps, 'children'> {
  label?: string
}

function ConceptTab({ label, className, ...otherProps }: ConceptTabProps) {
  return (
  <Tab
    className={clsx(
      'h-full min-w-[6rem]',
      'px-2 py-1 flex justify-center',
      'clr-tab',
      'text-sm whitespace-nowrap small-caps font-semibold',
      'select-none hover:cursor-pointer',
      className
    )}
    {...otherProps}
  >
    {label}
  </Tab>);
}

ConceptTab.tabsRole = 'Tab';

export default ConceptTab;