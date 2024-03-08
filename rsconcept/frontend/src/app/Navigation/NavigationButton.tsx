import clsx from 'clsx';

import { globalIDs } from '@/utils/constants';

interface NavigationButtonProps {
  text?: string;
  icon: React.ReactNode;
  title?: string;
  titleHtml?: string;
  onClick?: () => void;
}

function NavigationButton({ icon, title, titleHtml, onClick, text }: NavigationButtonProps) {
  return (
    <button
      type='button'
      tabIndex={-1}
      data-tooltip-id={!!title || !!titleHtml ? globalIDs.tooltip : undefined}
      data-tooltip-html={titleHtml}
      data-tooltip-content={title}
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
