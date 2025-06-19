import React, { Suspense } from 'react';

import { type PlacesType, Tooltip } from '@/components/container';
import { TextURL } from '@/components/control';
import { IconHelp } from '@/components/icons';
import { Loader } from '@/components/loader';
import { type Styling } from '@/components/props';
import { cn } from '@/components/utils';
import { usePreferencesStore } from '@/stores/preferences';

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
    <div tabIndex={-1} id={`help-${topic}`} className={cn(padding, className)} style={style}>
      <IconHelp size='1.25rem' className='text-muted-foreground hover:text-primary cc-animate-color' />
      <Tooltip
        clickable
        anchorSelect={`#help-${topic}`}
        layer='z-topmost'
        className={cn('max-w-120', contentClass)}
        {...restProps}
      >
        <Suspense fallback={<Loader />}>
          <div className='absolute right-1 text-sm top-2 bg-' onClick={event => event.stopPropagation()}>
            <TextURL text='Справка...' href={`/manuals?topic=${topic}`} />
          </div>
          <TopicPage topic={topic} />
        </Suspense>
      </Tooltip>
    </div>
  );
}
