import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

import { MiniButton } from '../control';
import { type Styling, type Titled } from '../props';

interface ValueIconProps extends Styling, Titled {
  /** Id of the component. */
  id?: string;

  /** Value to display. */
  value: string | number;

  /** Icon to display. */
  icon: React.ReactNode;

  /** Callback to be called when the component is clicked. */
  onClick?: (event: React.MouseEvent<Element>) => void;

  /** Indicates that padding should be minimal. */
  dense?: boolean;

  /** Disable interaction. */
  disabled?: boolean;
}

/**
 * Displays a value with an icon that can be clicked.
 */
export function ValueIcon({
  id,
  dense,
  icon,
  value,
  disabled = true,
  title,
  titleHtml,
  hideTitle,
  className,
  onClick,
  ...restProps
}: ValueIconProps) {
  // TODO: do not add button if onClick is disabled
  return (
    <div
      className={clsx(
        'flex items-center',
        'text-right',
        'hover:cursor-default',
        dense ? 'gap-1' : 'justify-between gap-6',
        className
      )}
      {...restProps}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      aria-label={title}
    >
      {onClick ? <MiniButton noHover noPadding icon={icon} onClick={onClick} disabled={disabled} /> : icon}
      <span id={id}>{value}</span>
    </div>
  );
}
