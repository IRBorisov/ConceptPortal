import clsx from 'clsx';

import { CProps } from '@/components/props';
import { globalIDs } from '@/utils/constants';

interface IndicatorProps extends CProps.Titled, CProps.Styling {
  /** Icon to display. */
  icon: React.ReactNode;

  /** Indicates whether the indicator should have no padding. */
  noPadding?: boolean;
}

/**
 * Displays a status `icon` with a tooltip.
 */
export function Indicator({ icon, title, titleHtml, hideTitle, noPadding, className, ...restProps }: IndicatorProps) {
  return (
    <div
      className={clsx(
        'clr-text-controls',
        'outline-none',
        {
          'px-1 py-1': !noPadding
        },
        className
      )}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      {...restProps}
    >
      {icon}
    </div>
  );
}
