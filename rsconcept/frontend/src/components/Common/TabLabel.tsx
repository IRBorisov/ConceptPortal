import clsx from 'clsx';
import type { TabProps as TabPropsImpl } from 'react-tabs';
import { Tab as TabImpl } from 'react-tabs';

import { globalIDs } from '@/utils/constants';

interface TabLabelProps extends Omit<TabPropsImpl, 'children'> {
  label?: string;
}

function TabLabel({ label, title, className, ...otherProps }: TabLabelProps) {
  return (
    <TabImpl
      className={clsx(
        'min-w-[6rem]',
        'px-2 py-1 flex justify-center',
        'clr-tab',
        'text-sm whitespace-nowrap font-controls',
        'select-none hover:cursor-pointer',
        className
      )}
      data-tooltip-id={title ? globalIDs.tooltip : undefined}
      data-tooltip-content={title}
      {...otherProps}
    >
      {label}
    </TabImpl>
  );
}

TabLabel.tabsRole = 'Tab';

export default TabLabel;
