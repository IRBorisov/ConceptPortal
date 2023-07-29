import type { TabProps } from 'react-tabs';
import { Tab } from 'react-tabs';

function ConceptTab({ children, className, ...otherProps }: TabProps) {
  return (
  <Tab
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    className={`px-2 py-1 border-r-2 text-sm hover:cursor-pointer clr-tab whitespace-nowrap ${className}`}
    {...otherProps}
  >
    {children}
  </Tab>
  );
}

ConceptTab.tabsRole = 'Tab';

export default ConceptTab;
