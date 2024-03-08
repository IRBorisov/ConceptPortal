import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

import { CProps } from '../props';

interface ButtonProps extends CProps.Control, CProps.Colors, CProps.Button {
  text?: string;
  icon?: React.ReactNode;
  titleHtml?: string;

  dense?: boolean;
  hideTitle?: boolean;
  loading?: boolean;
}

function Button({
  text,
  icon,
  title,
  titleHtml,
  loading,
  dense,
  disabled,
  hideTitle,
  noBorder,
  noOutline,
  colors = 'clr-btn-default',
  className,
  ...restProps
}: ButtonProps) {
  return (
    <button
      type='button'
      disabled={disabled ?? loading}
      className={clsx(
        'inline-flex gap-2 items-center justify-center',
        'select-none disabled:cursor-not-allowed',
        {
          'border rounded': !noBorder,
          'px-1': dense,
          'px-3 py-1': !dense,
          'cursor-progress': loading,
          'cursor-pointer': !loading,
          'outline-none': noOutline,
          'clr-outline': !noOutline
        },
        className,
        colors
      )}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      {...restProps}
    >
      {icon ? icon : null}
      {text ? <span className='font-medium'>{text}</span> : null}
    </button>
  );
}

export default Button;
