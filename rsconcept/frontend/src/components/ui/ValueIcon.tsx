import clsx from 'clsx';
import { useMemo } from 'react';

import { globals } from '@/utils/constants';

import { CProps } from '../props';
import MiniButton from './MiniButton';

interface ValueIconProps extends CProps.Styling, CProps.Titled {
  /** Id of the component. */
  id?: string;

  /** Value to display. */
  value: string | number;

  /** Icon to display. */
  icon: React.ReactNode;

  /** Classname for the text. */
  textClassName?: string;

  /** Callback to be called when the component is clicked. */
  onClick?: (event: CProps.EventMouse) => void;

  /** Number of symbols to display in a small size. */
  smallThreshold?: number;

  /** Indicates that padding should be minimal. */
  dense?: boolean;

  /** Disable interaction. */
  disabled?: boolean;
}

/**
 * Displays a value with an icon that can be clicked.
 */
function ValueIcon({
  id,
  dense,
  icon,
  value,
  textClassName,
  disabled = true,
  title,
  titleHtml,
  hideTitle,
  className,
  smallThreshold,
  onClick,
  ...restProps
}: ValueIconProps) {
  const isSmall = useMemo(() => !smallThreshold || String(value).length < smallThreshold, [value, smallThreshold]);
  return (
    <div
      className={clsx(
        'flex items-center',
        'text-right',
        'hover:cursor-default',
        { 'justify-between gap-6': !dense, 'gap-1': dense },
        className
      )}
      {...restProps}
      data-tooltip-id={!!title || !!titleHtml ? globals.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
    >
      <MiniButton noHover noPadding icon={icon} disabled={disabled} onClick={onClick} />
      <span id={id} className={clsx({ 'text-xs': !isSmall }, textClassName)}>
        {value}
      </span>
    </div>
  );
}

export default ValueIcon;
