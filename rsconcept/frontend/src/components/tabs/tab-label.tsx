import type { TabProps as TabPropsImpl } from 'react-tabs';
import { Tab as TabImpl } from 'react-tabs';
import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

import { type Titled } from '../props';

interface TabLabelProps extends Omit<TabPropsImpl, 'children'>, Titled {
  /** Label to display in the tab. */
  label?: string;
}

/**
 * Displays a tab header with a label.
 */
export function TabLabel({
  label,
  title,
  titleHtml,
  hideTitle,
  className,
  role = 'tab',
  ...otherProps
}: TabLabelProps) {
  return (
    <TabImpl
      className={clsx(
        'min-w-20 h-full',
        'px-2 py-1 flex justify-center',
        'cc-hover cc-animate-color duration-150',
        'text-sm whitespace-nowrap font-controls',
        'select-none hover:cursor-pointer',
        'outline-hidden',
        className
      )}
      tabIndex='-1'
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      role={role}
      {...otherProps}
    >
      {label}
    </TabImpl>
  );
}

TabLabel.tabsRole = 'Tab';
