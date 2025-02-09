import React, { Suspense } from 'react';

import { PlacesType, Tooltip } from '@/components/Container';
import { TextURL } from '@/components/Control';
import { IconHelp } from '@/components/Icons';
import { Loader } from '@/components/Loader';
import { CProps } from '@/components/props';
import { HelpTopic } from '@/features/help/models/helpTopic';
import { usePreferencesStore } from '@/stores/preferences';

const TopicPage = React.lazy(() => import('@/features/help/pages/ManualsPage/TopicPage'));

interface BadgeHelpProps extends CProps.Styling {
  /** Topic to display in a tooltip. */
  topic: HelpTopic;

  /** Offset from the cursor to the tooltip. */
  offset?: number;

  /** Classname for padding. */
  padding?: string;

  /** Place of the tooltip in relation to the cursor. */
  place?: PlacesType;
}

/**
 * Display help icon with a manual page tooltip.
 */
function BadgeHelp({ topic, padding = 'p-1', ...restProps }: BadgeHelpProps) {
  const showHelp = usePreferencesStore(state => state.showHelp);

  if (!showHelp) {
    return null;
  }
  return (
    <div tabIndex={-1} id={`help-${topic}`} className={padding}>
      <IconHelp size='1.25rem' className='icon-primary' />
      <Tooltip clickable anchorSelect={`#help-${topic}`} layer='z-modalTooltip' {...restProps}>
        <Suspense fallback={<Loader />}>
          <div className='relative' onClick={event => event.stopPropagation()}>
            <div className='absolute right-0 text-sm top-[0.4rem] clr-input'>
              <TextURL text='Справка...' href={`/manuals?topic=${topic}`} />
            </div>
          </div>
          <TopicPage topic={topic} />
        </Suspense>
      </Tooltip>
    </div>
  );
}

export default BadgeHelp;
