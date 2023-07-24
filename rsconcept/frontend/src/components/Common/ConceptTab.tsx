import { Tab} from 'react-tabs';
import type { TabProps } from 'react-tabs';

function ConceptTab({children, className, ...otherProps} : TabProps) {
  return (
  <Tab 
    className={`px-2 py-1 text-sm hover:cursor-pointer clr-tab ${className} whitespace-nowrap`}
    {...otherProps}
  >
    {children}
  </Tab>
  );
}

ConceptTab.tabsRole = 'Tab';

export default ConceptTab;