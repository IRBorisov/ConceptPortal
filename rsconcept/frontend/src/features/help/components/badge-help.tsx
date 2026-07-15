'use client';

import React, { Suspense } from 'react';
import { toast } from 'react-toastify';

import { globalTx } from '@/i18n/format-app-message';
import { useTx } from '@/i18n/use-tx';

import { emitOnboardingEvent } from '@/features/onboarding/models/events';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding';
import { ensureTourLoaded } from '@/features/onboarding/tours';

import { type PlacesType, Tooltip } from '@/components/container';
import { MiniButton, TextURL } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconHelp, IconTour } from '@/components/icons';
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
   * Optional onboarding tour. When set, click opens Quick guide / Read manual.
   * Without a tour, click opens the manual page.
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
 * Help button with optional tour entry.
 * Shows `IconTour` when `tourID` is set, otherwise `IconHelp`.
 * Hover shows the manual preview when inline help is on.
 * Click: dropdown (tour + manual) when a tour is wired; otherwise open the manuals page.
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
  const { elementRef, isOpen, handleBlur, toggle, hide } = useDropdown();

  const hasTour = Boolean(tourID);
  if (!showHelp && !hasTour) {
    return null;
  }

  const showManualTooltip = showHelp && !isOpen;
  const manualHref = `/manuals?topic=${topic}`;
  const anchorId = `help-${topic}`;
  const menuId = `${anchorId}-menu`;
  const buttonLabel = hasTour ? tx('tx.help.menu.hint') : tx('tx.general.help.hint');

  function handleStartTour(event?: React.SyntheticEvent) {
    if (!tourID) {
      return;
    }
    event?.preventDefault();
    event?.stopPropagation();
    hide();
    void startHelpTour(tourID, restartTour);
  }

  function handleOpenManual(event?: React.SyntheticEvent) {
    event?.preventDefault();
    event?.stopPropagation();
    hide();
    window.location.assign(manualHref);
  }

  function handleHelpActivate(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (hasTour) {
      toggle();
      return;
    }
    window.location.assign(manualHref);
  }

  return (
    <div
      ref={elementRef}
      tabIndex={-1}
      onBlur={hasTour ? handleBlur : undefined}
      id={anchorId}
      className={cn('relative inline-flex items-center justify-center leading-none', padding, className)}
      style={style}
    >
      <MiniButton
        noPadding
        tabIndex={0}
        title={buttonLabel}
        hideTitle
        aria-haspopup={hasTour ? 'menu' : undefined}
        aria-expanded={hasTour ? isOpen : undefined}
        aria-controls={hasTour ? menuId : undefined}
        onClick={handleHelpActivate}
        icon={
          hasTour ? (
            <IconTour size={size} className='hover:text-primary' />
          ) : (
            <IconHelp size={size} className='hover:text-primary' />
          )
        }
      />
      {hasTour ? (
        <Dropdown id={menuId} isOpen={isOpen} margin='mt-1'>
          <DropdownButton
            text={tx('tx.help.quickGuide')}
            icon={<IconTour size='1rem' className='icon-primary' />}
            onClick={handleStartTour}
          />
          <DropdownButton
            text={tx('tx.help.readManual')}
            icon={<IconHelp size='1rem' className='text-muted-foreground' />}
            onClick={handleOpenManual}
          />
        </Dropdown>
      ) : null}
      {showManualTooltip ? (
        <Tooltip
          delayShow={500}
          clickable
          anchorSelect={`#${anchorId}`}
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
                {hasTour ? (
                  <>
                    <TextURL
                      text={tx('tx.help.quickGuide')}
                      title={tx('tx.onboarding.show.hint')}
                      onClick={() => handleStartTour()}
                    />
                    <span className='text-muted-foreground/40 select-none' aria-hidden>
                      ·
                    </span>
                  </>
                ) : null}
                <TextURL text={tx('tx.general.help')} title={tx('tx.general.help.hint')} href={manualHref} />
              </div>
              <div className={hasTour ? '[&_h1]:pr-28' : '[&_h1]:pr-20'}>
                <TopicPage topic={topic} popover />
              </div>
            </div>
          </Suspense>
        </Tooltip>
      ) : null}
    </div>
  );
}

async function startHelpTour(tourID: string, restartTour: (id: string) => void) {
  const tour = await ensureTourLoaded(tourID);
  const locale = usePreferencesStore.getState().locale;
  const route = typeof window === 'undefined' ? '' : window.location.pathname;
  if (!tour) {
    toast.error(globalTx('tx.onboarding.load.fail'));
    emitOnboardingEvent({
      name: 'load_failed',
      tourId: tourID,
      tourVersion: 0,
      locale,
      route,
      source: 'manual'
    });
    return;
  }
  restartTour(tourID);
  emitOnboardingEvent({
    name: 'tour_restarted',
    tourId: tour.id,
    tourVersion: tour.version,
    stepCount: tour.steps.length,
    stepIndex: 0,
    locale,
    route,
    source: 'manual'
  });
}
