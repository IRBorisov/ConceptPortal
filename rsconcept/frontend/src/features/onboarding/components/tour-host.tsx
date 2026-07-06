'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router';

import { type AppLocale } from '@/i18n';

import { useConceptNavigation } from '@/app/navigation/navigation-context';

import { cn } from '@/components/utils';
import { usePreferencesStore } from '@/stores/preferences';

import { type Tour, type TourStepContent } from '../models/tour';
import { shouldOfferTour, useOnboardingStore } from '../stores/onboarding';
import { findAutoStartTour, getTourByID } from '../tours';
import { rectsAlmostEqual, waitForAnchorElement } from '../utils/anchors';
import { computeCardPosition, computeCenteredCardPosition, ESTIMATED_CARD_HEIGHT } from '../utils/card-position';

import { TourCard } from './tour-card';

const SPOTLIGHT_PADDING = 6;
const TAB_TOOLS_OBSTACLE_SELECTOR = '.cc-tab-tools';

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
  const pauseActiveTour = useOnboardingStore(state => state.pauseActiveTour);
  const skipActiveTour = useOnboardingStore(state => state.skipActiveTour);
  const completeActiveTour = useOnboardingStore(state => state.completeActiveTour);

  const tour = activeTourID ? getTourByID(activeTourID) : null;
  const step = tour ? (tour.steps[activeStep] ?? null) : null;

  // Keyed by tour/step so stale async resolutions and rects are ignored without clearing state in effects.
  const [resolvedAnchor, setResolvedAnchor] = useState<ResolvedAnchor | null>(null);
  const [trackedRect, setTrackedRect] = useState<TrackedRect | null>(null);
  const [cardHeight, setCardHeight] = useState(ESTIMATED_CARD_HEIGHT);
  const [direction, setDirection] = useState<1 | -1>(1);

  const anchorElement =
    resolvedAnchor?.tourID === activeTourID && resolvedAnchor?.stepIndex === activeStep ? resolvedAnchor.element : null;
  const anchorRect = anchorElement !== null && trackedRect?.element === anchorElement ? trackedRect.rect : null;
  const layoutAnchorRect = anchorRect ?? (step?.anchor && trackedRect ? trackedRect.rect : null);
  const hasSpotlight = layoutAnchorRect !== null;
  const [animateSpotlight, setAnimateSpotlight] = useState(false);
  const spotlightWasVisibleRef = useRef(false);

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
      const fromStep = progress?.status === 'pending' ? Math.min(progress.resumeStep, candidate.steps.length - 1) : 0;
      startTour(candidate.id, fromStep);
    },
    [location.pathname, activeTourID, tourRecords, sessionDismissed, startTour]
  );

  useEffect(
    function pauseTourOnRouteLeave() {
      if (tour && location.pathname !== tour.route) {
        pauseActiveTour();
      }
    },
    [location.pathname, tour, pauseActiveTour]
  );

  const onActivateStep = useEffectEvent(function activateStep(
    currentTour: Tour,
    stepIndex: number,
    moveDirection: 1 | -1,
    signal: AbortSignal
  ) {
    const currentStep = currentTour.steps[stepIndex];
    if (!currentStep) {
      return;
    }
    currentStep.onEnter?.({ changeTab: router.changeTab, gotoEditActive: router.gotoEditActive });
    if (!currentStep.anchor) {
      return;
    }
    void waitForAnchorElement(currentStep.anchor, 3000, signal).then(function resolveAnchor(element) {
      const state = useOnboardingStore.getState();
      if (state.activeTourID !== currentTour.id || state.activeStep !== stepIndex) {
        return;
      }
      if (!element) {
        console.warn(
          `Tour "${currentTour.id}": anchor "${currentStep.anchor}" not found; skipping step "${currentStep.id}"`
        );
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
      if (location.pathname !== currentTour?.route) {
        return;
      }
      const controller = new AbortController();
      onActivateStep(currentTour, activeStep, direction, controller.signal);
      return function abortAnchorWait() {
        controller.abort();
      };
    },
    [activeTourID, activeStep, direction, location.pathname]
  );

  useEffect(
    function resetCardHeightOnStepChange() {
      let frame = 0;
      frame = requestAnimationFrame(function resetEstimatedCardHeight() {
        setCardHeight(ESTIMATED_CARD_HEIGHT);
      });
      return function cancelResetCardHeight() {
        cancelAnimationFrame(frame);
      };
    },
    [activeStep]
  );

  useEffect(
    function trackAnchorRect() {
      if (!anchorElement) {
        return;
      }
      const element: HTMLElement = anchorElement;
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
    function enableSpotlightTransitionAfterFirstPaint() {
      if (!hasSpotlight) {
        spotlightWasVisibleRef.current = false;
        let frame = 0;
        frame = requestAnimationFrame(function disableSpotlightTransition() {
          setAnimateSpotlight(false);
        });
        return function cancelDisableSpotlightTransition() {
          cancelAnimationFrame(frame);
        };
      }
      if (spotlightWasVisibleRef.current) {
        return;
      }
      spotlightWasVisibleRef.current = true;
      let frame1 = 0;
      let frame2 = 0;
      frame1 = requestAnimationFrame(function waitForSpotlightPaint() {
        frame2 = requestAnimationFrame(function enableSpotlightTransition() {
          setAnimateSpotlight(true);
        });
      });
      return function cancelEnableSpotlightTransition() {
        cancelAnimationFrame(frame1);
        cancelAnimationFrame(frame2);
      };
    },
    [hasSpotlight, activeStep]
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

  useEffect(
    function markAppInertWhileTourActive() {
      if (!activeTourID) {
        return;
      }
      const root = document.getElementById('root');
      if (!root) {
        return;
      }
      root.setAttribute('inert', '');
      return function clearAppInert() {
        root.removeAttribute('inert');
      };
    },
    [activeTourID]
  );

  if (!tour || !step) {
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
    setCardHeight(ESTIMATED_CARD_HEIGHT);
    if (activeStep >= totalSteps - 1) {
      completeActiveTour(currentTourVersion);
    } else {
      setActiveStep(activeStep + 1);
    }
  }

  function handleBack() {
    setDirection(-1);
    setCardHeight(ESTIMATED_CARD_HEIGHT);
    setActiveStep(activeStep - 1);
  }

  function handleSkip() {
    skipActiveTour(currentTourVersion);
  }

  const isCenteredCard = layoutAnchorRect === null;
  const cardPosition = isCenteredCard
    ? computeCenteredCardPosition(cardHeight)
    : computeCardPosition(
        layoutAnchorRect,
        step.placement ?? 'bottom',
        cardHeight,
        undefined,
        TAB_TOOLS_OBSTACLE_SELECTOR
      );

  return createPortal(
    <div className='fixed inset-0 z-topmost isolate pointer-events-none' data-testid='tour-layer'>
      <div className='fixed inset-0 z-0 pointer-events-auto' data-testid='tour-overlay' />
      {hasSpotlight ? (
        <div
          className={cn(
            'fixed z-0 rounded-md pointer-events-none',
            animateSpotlight && 'transition-[top,left,width,height] duration-300 ease-in-out'
          )}
          style={{
            top: layoutAnchorRect.top - SPOTLIGHT_PADDING,
            left: layoutAnchorRect.left - SPOTLIGHT_PADDING,
            width: layoutAnchorRect.width + 2 * SPOTLIGHT_PADDING,
            height: layoutAnchorRect.height + 2 * SPOTLIGHT_PADDING,
            boxShadow: '0 0 0 2px var(--color-primary), 0 0 0 9999px rgb(0 0 0 / 45%)'
          }}
        />
      ) : (
        <div className='fixed inset-0 z-0 bg-[rgb(0_0_0/45%)]' />
      )}
      <TourCard
        title={content.title}
        body={content.body}
        stepIndex={activeStep}
        totalSteps={tour.steps.length}
        onNext={handleNext}
        onBack={handleBack}
        onSkip={handleSkip}
        className='pointer-events-auto z-10'
        style={{ left: cardPosition.left, top: cardPosition.top }}
        onLayout={setCardHeight}
      />
    </div>,
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
