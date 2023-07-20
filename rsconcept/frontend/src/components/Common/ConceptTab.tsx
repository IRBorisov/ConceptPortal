import { Tab} from 'react-tabs';
import type { TabProps } from 'react-tabs';

function ConceptTab({children, className, ...otherProps} : TabProps) {
  return (
  <Tab 
    className={
      'px-2 py-1 text-sm text-gray-600 hover:cursor-pointer dark:text-zinc-200 hover:bg-gray-300  dark:hover:bg-gray-400'
      + ' ' + className
    }
    {...otherProps}
  >
    {children}
  </Tab>
  );
}

ConceptTab.tabsRole = 'Tab';

export default ConceptTab;