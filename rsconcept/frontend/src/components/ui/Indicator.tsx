import clsx from 'clsx';

import { globals } from '@/utils/constants';

import { CProps } from '../props';

interface IndicatorProps extends CProps.Titled, CProps.Styling {
  icon: React.ReactNode;
  noPadding?: boolean;
}

function Indicator({ icon, title, titleHtml, hideTitle, noPadding, className, ...restProps }: IndicatorProps) {
  return (
    <div
      className={clsx(
        'clr-btn-clear',
        'outline-none',
        {
          'px-1 py-1': !noPadding
        },
        className
      )}
      data-tooltip-id={!!title || !!titleHtml ? globals.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      {...restProps}
    >
      {icon}
    </div>
  );
}

export default Indicator;
