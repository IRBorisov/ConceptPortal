'use client';

import React, { Suspense } from 'react';

import { useTx } from '@/i18n/use-tx';

import { useOnboardingStore } from '@/features/onboarding/stores/onboarding';
import { ensureTourLoaded } from '@/features/onboarding/tours';

import { type PlacesType, Tooltip } from '@/components/container';
import { MiniButton, TextURL } from '@/components/control';
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

  /**
   * Optional onboarding tour started by clicking the icon or the tooltip Guide link.
   * When set, the help icon is a button and Guide appears beside Manuals.
   */
  tourID?: string;

  /** Offset from the cursor to the tooltip. */
  offset?: number;

  /** Classname for padding. */
  padding?: string;

  /** Size class for the tooltip. */
  size?: string;

  /** Place of the tooltip in relation to the cursor. */
  place?: PlacesType;

  /** Classname for content wrapper. */
  contentClass?: string;
}

/**
 * Display help icon with a manual page tooltip.
 * Optionally starts an onboarding tour on icon click or via a tooltip link.
 */
export function BadgeHelp({
  topic,
  tourID,
  padding = 'p-1',
  size = '1.25rem',
  className,
  contentClass,
  style,
  ...restProps
}: BadgeHelpProps) {
  const showHelp = usePreferencesStore(state => state.showHelp);
  const restartTour = useOnboardingStore(state => state.restartTour);
  const tx = useTx();

  if (!showHelp) {
    return null;
  }

  function startTour(event?: React.SyntheticEvent) {
    if (!tourID) {
      return;
    }
    event?.preventDefault();
    event?.stopPropagation();
    void ensureTourLoaded(tourID).then(function startLoadedTour(tour) {
      if (!tour) {
        console.warn(`Tour "${tourID}" is not registered`);
        return;
      }
      restartTour(tourID);
    });
  }

  return (
    <div
      tabIndex={-1}
      id={`help-${topic}`}
      className={cn('inline-flex items-center justify-center leading-none', padding, className)}
      style={style}
    >
      {tourID ? (
        <MiniButton
          noPadding
          aria-label={tx('tx.onboarding.show')}
          onClick={startTour}
          icon={<IconHelp size={size} className='hover:text-primary' />}
        />
      ) : (
        <IconHelp size={size} className='text-muted-foreground hover:text-primary cc-animate-color' />
      )}
      <Tooltip
        delayShow={500}
        clickable
        anchorSelect={`#help-${topic}`}
        layer='z-topmost'
        className={cn('max-w-120', contentClass)}
        {...restProps}
      >
        <Suspense
          fallback={
            <div className={cn('w-full min-w-80', contentClass)}>
              <Loader />
            </div>
          }
        >
          <div className='cc-fade-in relative'>
            <div
              className='absolute right-2 top-1 z-1 flex items-center gap-1.5 text-sm whitespace-nowrap'
              onClick={event => event.stopPropagation()}
            >
              {tourID ? (
                <>
                  <TextURL
                    text={tx('tx.onboarding.guide')}
                    title={tx('tx.onboarding.show.hint')}
                    onClick={() => startTour()}
                  />
                  <span className='text-muted-foreground/40 select-none' aria-hidden>
                    ·
                  </span>
                </>
              ) : null}
              <TextURL
                text={tx('tx.general.help')}
                title={tx('tx.general.help.hint')}
                href={`/manuals?topic=${topic}`}
              />
            </div>
            <div className={tourID ? '[&_h1]:pr-28' : '[&_h1]:pr-20'}>
              <TopicPage topic={topic} popover />
            </div>
          </div>
        </Suspense>
      </Tooltip>
    </div>
  );
}
