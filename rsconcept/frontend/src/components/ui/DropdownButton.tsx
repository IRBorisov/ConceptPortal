import clsx from 'clsx';
import { motion } from 'framer-motion';

import { animateDropdownItem } from '@/styling/animations';
import { globals } from '@/utils/constants';

import { CProps } from '../props';

interface DropdownButtonProps extends CProps.AnimatedButton {
  text?: string;
  icon?: React.ReactNode;

  children?: React.ReactNode;
}

function DropdownButton({
  text,
  icon,
  className,
  title,
  titleHtml,
  hideTitle,
  onClick,
  children,
  ...restProps
}: DropdownButtonProps) {
  return (
    <motion.button
      tabIndex={-1}
      type='button'
      onClick={onClick}
      className={clsx(
        'px-3 py-1 inline-flex items-center gap-2',
        'text-left text-sm overflow-ellipsis whitespace-nowrap',
        'disabled:clr-text-controls',
        {
          'clr-hover': onClick,
          'cursor-pointer disabled:cursor-auto': onClick,
          'cursor-default': !onClick
        },
        className
      )}
      variants={animateDropdownItem}
      data-tooltip-id={!!title || !!titleHtml ? globals.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      {...restProps}
    >
      {children ? children : null}
      {!children && icon ? icon : null}
      {!children && text ? <span>{text}</span> : null}
    </motion.button>
  );
}

export default DropdownButton;
