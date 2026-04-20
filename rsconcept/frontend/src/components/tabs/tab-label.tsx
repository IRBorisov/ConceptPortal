import type { TabProps as TabPropsImpl } from 'react-tabs';
import { Tab as TabImpl } from 'react-tabs';

import { globalIDs } from '@/utils/constants';

import { type Titled } from '../props';
import { cn } from '../utils';

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
  disabled,
  role = 'tab',
  children,
  selectedClassName = 'text-foreground! bg-secondary',
  ...otherProps
}: React.PropsWithChildren<TabLabelProps>) {
  return (
    <TabImpl
      className={cn(
        'h-full',
        'px-3 py-1 flex items-center justify-center gap-1',
        'cc-animate-color duration-select text-muted-foreground',
        'text-sm whitespace-nowrap font-controls',
        'select-none',
        'outline-hidden',
        !disabled && 'hover:cursor-pointer cc-hover-text',
        disabled && 'bg-secondary',
        className
      )}
      tabIndex='-1'
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      role={role}
      disabled={disabled}
      selectedClassName={selectedClassName}
      {...otherProps}
    >
      {label}
      {children}
    </TabImpl>
  );
}

TabLabel.tabsRole = 'Tab';
