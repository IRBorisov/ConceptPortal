import clsx from 'clsx';

import { CProps } from '../props';
import MiniButton from './MiniButton';

interface IconValueProps extends CProps.Styling, CProps.Titled {
  id?: string;
  icon: React.ReactNode;
  value: string | number;
  onClick?: (event: CProps.EventMouse) => void;
  dense?: boolean;
  disabled?: boolean;
}

function IconValue({
  id,
  dense,
  value,
  icon,
  disabled = true,
  title,
  titleHtml,
  hideTitle,
  className,
  onClick,
  ...restProps
}: IconValueProps) {
  return (
    <div
      className={clsx('flex items-center', { 'justify-between gap-6 text-right': !dense, 'gap-2': dense }, className)}
      {...restProps}
    >
      <MiniButton
        noHover
        noPadding
        title={title}
        titleHtml={titleHtml}
        hideTitle={hideTitle}
        icon={icon}
        disabled={disabled}
        onClick={onClick}
      />
      <span id={id}>{value}</span>
    </div>
  );
}

export default IconValue;
