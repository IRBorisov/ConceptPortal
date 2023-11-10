import type { TabProps } from 'react-tabs';
import { Tab } from 'react-tabs';

interface ConceptTabProps
extends Omit<TabProps, 'className' | 'title'> {
  className?: string
  tooltip?: string
}

function ConceptTab({ children, tooltip, className, ...otherProps }: ConceptTabProps) {
  return (
  <Tab
    className={`px-2 py-1 h-full flex justify-center text-sm hover:cursor-pointer clr-tab whitespace-nowrap min-w-[6rem] ${className}`}
    title={tooltip}
    {...otherProps}
  >
    {children}
  </Tab>
  );
}

ConceptTab.tabsRole = 'Tab';

export default ConceptTab;
