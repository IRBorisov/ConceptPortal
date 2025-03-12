import React, { Suspense } from 'react';
import clsx from 'clsx';

import { type PlacesType, Tooltip } from '@/components/container1';
import { TextURL } from '@/components/control1';
import { IconHelp } from '@/components/icons1';
import { Loader } from '@/components/loader1';
import { type Styling } from '@/components/props';
import { usePreferencesStore } from '@/stores/preferences';
import { PARAMETER } from '@/utils/constants';

import { type HelpTopic } from '../models/help-topic';

const TopicPage = React.lazy(() =>
  import('@/features/help/pages/manuals-page/topic-page').then(module => ({ default: module.TopicPage }))
);

interface BadgeHelpProps extends Styling {
  /** Topic to display in a tooltip. */
  topic: HelpTopic;

  /** Offset from the cursor to the tooltip. */
  offset?: number;

  /** Classname for padding. */
  padding?: string;

  /** Place of the tooltip in relation to the cursor. */
  place?: PlacesType;

  /** Classname for content wrapper. */
  contentClass?: string;
}

/**
 * Display help icon with a manual page tooltip.
 */
export function BadgeHelp({ topic, padding = 'p-1', className, contentClass, style, ...restProps }: BadgeHelpProps) {
  const showHelp = usePreferencesStore(state => state.showHelp);

  if (!showHelp) {
    return null;
  }
  return (
    <div tabIndex={-1} id={`help-${topic}`} className={clsx(padding, className)} style={style}>
      <IconHelp size='1.25rem' className='icon-primary' />
      <Tooltip
        clickable
        anchorSelect={`#help-${topic}`}
        layer='z-topmost'
        className={clsx(PARAMETER.TOOLTIP_WIDTH, contentClass)}
        {...restProps}
      >
        <Suspense fallback={<Loader />}>
          <div className='absolute right-1 text-sm top-2 clr-input' onClick={event => event.stopPropagation()}>
            <TextURL text='Справка...' href={`/manuals?topic=${topic}`} />
          </div>
          <TopicPage topic={topic} />
        </Suspense>
      </Tooltip>
    </div>
  );
}
