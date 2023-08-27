import type { TabProps } from 'react-tabs';
import { Tab } from 'react-tabs';

interface ConceptTabProps
extends Omit<TabProps, 'className'> {
  className?: string
}

function ConceptTab({ children, className, ...otherProps }: ConceptTabProps) {
  return (
  <Tab
    className={`px-2 py-1 text-sm hover:cursor-pointer clr-tab whitespace-nowrap ${className}`}
    {...otherProps}
  >
    {children}
  </Tab>
  );
}

ConceptTab.tabsRole = 'Tab';

export default ConceptTab;
