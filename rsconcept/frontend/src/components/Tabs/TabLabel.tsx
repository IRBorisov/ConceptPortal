import type { TabProps as TabPropsImpl } from 'react-tabs';
import { Tab as TabImpl } from 'react-tabs';
import clsx from 'clsx';

import { globals } from '@/utils/constants';

import { CProps } from '../props';

interface TabLabelProps extends Omit<TabPropsImpl, 'children'>, CProps.Titled {
  /** Label to display in the tab. */
  label?: string;
}

/**
 * Displays a tab header with a label.
 */
export function TabLabel({ label, title, titleHtml, hideTitle, className, ...otherProps }: TabLabelProps) {
  return (
    <TabImpl
      className={clsx(
        'min-w-[5.5rem] h-full',
        'px-2 py-1 flex justify-center',
        'clr-hover cc-animate-color duration-150',
        'text-sm whitespace-nowrap font-controls',
        'select-none hover:cursor-pointer',
        'outline-none',
        className
      )}
      tabIndex='-1'
      data-tooltip-id={!!title || !!titleHtml ? globals.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      {...otherProps}
    >
      {label}
    </TabImpl>
  );
}

TabLabel.tabsRole = 'Tab';
