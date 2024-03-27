import clsx from 'clsx';

import { CProps } from '@/components/props';
import { globals } from '@/utils/constants';

interface NavigationButtonProps extends CProps.Titled {
  text?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

function NavigationButton({ icon, title, titleHtml, hideTitle, onClick, text }: NavigationButtonProps) {
  return (
    <button
      type='button'
      tabIndex={-1}
      data-tooltip-id={!!title || !!titleHtml ? globals.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
      data-tooltip-hidden={hideTitle}
      onClick={onClick}
      className={clsx(
        'mr-1 h-full', // prettier: split lines
        'flex items-center gap-1',
        'clr-btn-nav',
        'font-controls whitespace-nowrap',
        {
          'px-2': text,
          'px-4': !text
        }
      )}
    >
      {icon ? <span>{icon}</span> : null}
      {text ? <span className='hidden sm:inline'>{text}</span> : null}
    </button>
  );
}

export default NavigationButton;
