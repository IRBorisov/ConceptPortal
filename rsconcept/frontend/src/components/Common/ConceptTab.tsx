import type { TabProps } from 'react-tabs';
import { Tab } from 'react-tabs';

function ConceptTab({ children, className, ...otherProps }: TabProps) {
  return (
  <Tab
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    className={`px-2 py-1 text-sm hover:cursor-pointer clr-tab ${className} whitespace-nowrap`}
    {...otherProps}
  >
    {children}
  </Tab>
  );
}

ConceptTab.tabsRole = 'Tab';

export default ConceptTab;
