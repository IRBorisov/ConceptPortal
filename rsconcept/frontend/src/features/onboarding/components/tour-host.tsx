'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router';

import { type AppLocale } from '@/i18n';

import { useConceptNavigation } from '@/app/navigation/navigation-context';

import { usePreferencesStore } from '@/stores/preferences';

import { type Tour, type TourPlacement, type TourStepContent } from '../models/tour';
import { shouldOfferTour, useOnboardingStore } from '../stores/onboarding';
import { findAutoStartTour, getTourByID } from '../tours';
import { rectsAlmostEqual, waitForAnchorElement } from '../utils/anchors';

import { TourCard } from './tour-card';

const SPOTLIGHT_PADDING = 6;
const CARD_OFFSET = 12;
const CARD_WIDTH = 320;
const CARD_MARGIN = 8;
const ESTIMATED_CARD_HEIGHT = 240;

/** Renders the active onboarding tour: spotlight, step card, and auto-start logic. Mount once per app shell. */
export function TourHost() {
  const location = useLocation();
  const router = useConceptNavigation();
  const locale = usePreferencesStore(state => state.locale);

  const activeTourID = useOnboardingStore(state => state.activeTourID);
  const activeStep = useOnboardingStore(state => state.activeStep);
  const tourRecords = useOnboardingStore(state => state.tours);
  const sessionDismissed = useOnboardingStore(state => state.sessionDismissed);
  const startTour = useOnboardingStore(state => state.startTour);
  const setActiveStep = useOnboardingStore(state => state.setActiveStep);
  const dismissActiveTour = useOnboardingStore(state => state.dismissActiveTour);
  const skipActiveTour = useOnboardingStore(state => state.skipActiveTour);
  const completeActiveTour = useOnboardingStore(state => state.completeActiveTour);

  const tour = activeTourID ? getTourByID(activeTourID) : null;
  const step = tour ? (tour.steps[activeStep] ?? null) : null;

  // Keyed by tour/step so stale async resolutions and rects are ignored without clearing state in effects.
  const [resolvedAnchor, setResolvedAnchor] = useState<ResolvedAnchor | null>(null);
  const [trackedRect, setTrackedRect] = useState<TrackedRect | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);

  const anchorElement =
    resolvedAnchor?.tourID === activeTourID && resolvedAnchor?.stepIndex === activeStep
      ? resolvedAnchor.element
      : null;
  const anchorRect = anchorElement !== null && trackedRect?.element === anchorElement ? trackedRect.rect : null;

  useEffect(
    function autoStartTourOnRoute() {
      if (activeTourID) {
        return;
      }
      const candidate = findAutoStartTour(location.pathname);
      if (!candidate || sessionDismissed[candidate.id]) {
        return;
      }
      const progress = tourRecords[candidate.id];
      if (!shouldOfferTour(progress, candidate.version)) {
        return;
      }
      const fromStep =
        progress?.status === 'pending' ? Math.min(progress.resumeStep, candidate.steps.length - 1) : 0;
      startTour(candidate.id, fromStep);
    },
    [location.pathname, activeTourID, tourRecords, sessionDismissed, startTour]
  );

  useEffect(
    function dismissTourOnRouteLeave() {
      if (tour && location.pathname !== tour.route) {
        dismissActiveTour();
      }
    },
    [location.pathname, tour, dismissActiveTour]
  );

  const onActivateStep = useEffectEvent(function activateStep(currentTour: Tour, stepIndex: number, moveDirection: 1 | -1) {
    const currentStep = currentTour.steps[stepIndex];
    if (!currentStep) {
      return;
    }
    currentStep.onEnter?.({ changeTab: router.changeTab });
    if (!currentStep.anchor) {
      return;
    }
    void waitForAnchorElement(currentStep.anchor).then(function resolveAnchor(element) {
      const state = useOnboardingStore.getState();
      if (state.activeTourID !== currentTour.id || state.activeStep !== stepIndex) {
        return;
      }
      if (!element) {
        console.warn(`Tour "${currentTour.id}": anchor "${currentStep.anchor}" not found; skipping step "${currentStep.id}"`);
        const nextIndex = stepIndex + moveDirection;
        if (nextIndex < 0 || nextIndex >= currentTour.steps.length) {
          state.dismissActiveTour();
        } else {
          state.setActiveStep(nextIndex);
        }
        return;
      }
      element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      setResolvedAnchor({ tourID: currentTour.id, stepIndex, element });
    });
  });

  useEffect(
    function enterActiveStep() {
      if (!activeTourID) {
        return;
      }
      const currentTour = getTourByID(activeTourID);
      if (currentTour) {
        onActivateStep(currentTour, activeStep, direction);
      }
    },
    [activeTourID, activeStep, direction]
  );

  useEffect(
    function trackAnchorRect() {
      const element = anchorElement;
      if (!element) {
        return;
      }
      let frame = 0;
      let lastRect: DOMRect | null = null;
      function measureAnchor() {
        const rect = element.getBoundingClientRect();
        if (!rectsAlmostEqual(rect, lastRect)) {
          lastRect = rect;
          setTrackedRect({ element, rect });
        }
        frame = requestAnimationFrame(measureAnchor);
      }
      frame = requestAnimationFrame(measureAnchor);
      return function stopTrackingAnchor() {
        cancelAnimationFrame(frame);
      };
    },
    [anchorElement]
  );

  useEffect(
    function dismissOnEscape() {
      if (!activeTourID) {
        return;
      }
      function onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
          event.stopPropagation();
          useOnboardingStore.getState().dismissActiveTour();
        }
      }
      window.addEventListener('keydown', onKeyDown, true);
      return function removeEscapeListener() {
        window.removeEventListener('keydown', onKeyDown, true);
      };
    },
    [activeTourID]
  );

  if (!tour || !step) {
    return null;
  }
  if (step.anchor && !anchorRect) {
    return null;
  }

  const content = resolveStepContent(tour, step.id, locale);
  if (!content) {
    return null;
  }

  const currentTourVersion = tour.version;
  const totalSteps = tour.steps.length;

  function handleNext() {
    setDirection(1);
    if (activeStep >= totalSteps - 1) {
      completeActiveTour(currentTourVersion);
    } else {
      setActiveStep(activeStep + 1);
    }
  }

  function handleBack() {
    setDirection(-1);
    setActiveStep(activeStep - 1);
  }

  function handleSkip() {
    skipActiveTour(currentTourVersion);
  }

  return createPortal(
    <>
      <div className='fixed inset-0 z-tour' data-testid='tour-overlay' />
      {anchorRect ? (
        <div
          className='fixed z-tour rounded-md pointer-events-none'
          style={{
            top: anchorRect.top - SPOTLIGHT_PADDING,
            left: anchorRect.left - SPOTLIGHT_PADDING,
            width: anchorRect.width + 2 * SPOTLIGHT_PADDING,
            height: anchorRect.height + 2 * SPOTLIGHT_PADDING,
            boxShadow: '0 0 0 2px var(--color-primary), 0 0 0 9999px rgb(0 0 0 / 45%)'
          }}
        />
      ) : (
        <div className='fixed inset-0 z-tour bg-[rgb(0_0_0/45%)]' />
      )}
      <TourCard
        title={content.title}
        body={content.body}
        stepIndex={activeStep}
        totalSteps={tour.steps.length}
        onNext={handleNext}
        onBack={handleBack}
        onSkip={handleSkip}
        className={!anchorRect ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' : undefined}
        style={anchorRect ? computeCardStyle(anchorRect, step.placement ?? 'bottom') : undefined}
      />
    </>,
    document.body
  );
}

// ====== Internals =========
interface ResolvedAnchor {
  tourID: string;
  stepIndex: number;
  element: HTMLElement;
}

interface TrackedRect {
  element: HTMLElement;
  rect: DOMRect;
}

function resolveStepContent(tour: Tour, stepID: string, locale: AppLocale): TourStepContent | null {
  const localized = tour.content[locale]?.[stepID];
  return localized ?? tour.content.en[stepID] ?? null;
}

function computeCardStyle(rect: DOMRect, placement: TourPlacement): React.CSSProperties {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const centeredLeft = Math.min(
    Math.max(rect.left + rect.width / 2 - CARD_WIDTH / 2, CARD_MARGIN),
    Math.max(viewportWidth - CARD_WIDTH - CARD_MARGIN, CARD_MARGIN)
  );

  let effective = placement;
  if (placement === 'bottom' && rect.bottom + CARD_OFFSET + ESTIMATED_CARD_HEIGHT > viewportHeight) {
    effective = 'top';
  } else if (placement === 'top' && rect.top - CARD_OFFSET - ESTIMATED_CARD_HEIGHT < 0) {
    effective = 'bottom';
  }

  switch (effective) {
    case 'top':
      return { left: centeredLeft, top: rect.top - CARD_OFFSET, transform: 'translateY(-100%)' };
    case 'left':
      return { left: Math.max(rect.left - CARD_OFFSET - CARD_WIDTH, CARD_MARGIN), top: rect.top };
    case 'right':
      return {
        left: Math.min(rect.right + CARD_OFFSET, viewportWidth - CARD_WIDTH - CARD_MARGIN),
        top: rect.top
      };
    case 'bottom':
    default:
      return { left: centeredLeft, top: rect.bottom + CARD_OFFSET };
  }
}
