import type { TabProps } from 'react-tabs';
import { Tab } from 'react-tabs';

interface ConceptTabProps
extends Omit<TabProps, 'title' | 'children'> {
  className?: string
  tooltip?: string
  label?: string
}

function ConceptTab({ label, tooltip, className, ...otherProps }: ConceptTabProps) {
  return (
  <Tab
    className={`px-2 py-1 h-full min-w-[6rem] flex justify-center text-sm hover:cursor-pointer clr-tab whitespace-nowrap small-caps select-none font-semibold ${className}`}
    title={tooltip}
    {...otherProps}
  >
    {label}
  </Tab>);
}

ConceptTab.tabsRole = 'Tab';

export default ConceptTab;
