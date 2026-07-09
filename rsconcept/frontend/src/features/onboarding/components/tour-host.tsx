'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router';

import { type AppLocale } from '@/i18n';

import { useConceptNavigation } from '@/app/navigation/navigation-context';

import { cn } from '@/components/utils';
import { usePreferencesStore } from '@/stores/preferences';
import { useTooltipsStore } from '@/stores/tooltips';

import { type Tour, tourMatchesRoute, type TourStepContent } from '../models/tour';
import { shouldOfferTour, useOnboardingStore } from '../stores/onboarding';
import { ensureTourLoaded, findAutoStartTour, getTourByID } from '../tours';
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
  const hideTooltips = useTooltipsStore(state => state.hideTooltips);
  const showTooltips = useTooltipsStore(state => state.showTooltips);

  const activeTourID = useOnboardingStore(state => state.activeTourID);
  const activeStep = useOnboardingStore(state => state.activeStep);
  const tourStack = useOnboardingStore(state => state.tourStack);
  const startTour = useOnboardingStore(state => state.startTour);
  const setActiveStep = useOnboardingStore(state => state.setActiveStep);
  const enterSubtour = useOnboardingStore(state => state.enterSubtour);
  const returnFromSubtour = useOnboardingStore(state => state.returnFromSubtour);
  const pauseActiveTour = useOnboardingStore(state => state.pauseActiveTour);
  const skipActiveTour = useOnboardingStore(state => state.skipActiveTour);
  const completeActiveTour = useOnboardingStore(state => state.completeActiveTour);

  // Keyed by tour/step so stale async resolutions and rects are ignored without clearing state in effects.
  const [resolvedAnchor, setResolvedAnchor] = useState<ResolvedAnchor | null>(null);
  const [trackedRect, setTrackedRect] = useState<TrackedRect | null>(null);
  const [cardHeight, setCardHeight] = useState(ESTIMATED_CARD_HEIGHT);
  const [direction, setDirection] = useState<1 | -1>(1);
  /** Bumps when a lazy tour finishes loading so sync `getTourByID` is re-read. */
  const [tourLoadRevision, setTourLoadRevision] = useState(0);

  const tour = activeTourID ? getTourByID(activeTourID) : null;
  const step = tour ? (tour.steps[activeStep] ?? null) : null;

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
      let cancelled = false;

      /** Offer the first eligible auto-start tour after persist hydration. */
      async function offerAutoStartTour() {
        // Persist rehydration is async; offering before it finishes ignores done/skipped/resume.
        if (!useOnboardingStore.persist.hasHydrated()) {
          /** Resolve when zustand onboarding state has rehydrated from localStorage. */
          await new Promise<void>(function waitForHydration(resolve) {
            const unsubscribe = useOnboardingStore.persist.onFinishHydration(function onHydrated() {
              unsubscribe();
              resolve();
            });
            // Hydration may finish between the check and subscribe.
            if (useOnboardingStore.persist.hasHydrated()) {
              unsubscribe();
              resolve();
            }
          });
        }
        if (cancelled) {
          return;
        }
        const candidate = await findAutoStartTour(location.pathname);
        if (cancelled || !candidate) {
          return;
        }
        const { sessionDismissed: dismissed, tours } = useOnboardingStore.getState();
        if (dismissed[candidate.id]) {
          return;
        }
        const progress = tours[candidate.id];
        if (!shouldOfferTour(progress, candidate.version)) {
          return;
        }
        const fromStep = progress?.status === 'pending' ? Math.min(progress.resumeStep, candidate.steps.length - 1) : 0;
        startTour(candidate.id, fromStep);
      }

      void offerAutoStartTour();
      return function cancelAutoStart() {
        cancelled = true;
      };
    },
    // Intentionally omit tourRecords/sessionDismissed: hydration updates would cancel the in-flight offer.
    // Progress is always read from getState() after hydration + async load.
    [location.pathname, activeTourID, startTour]
  );

  useEffect(
    function loadActiveTourContent() {
      if (!activeTourID || getTourByID(activeTourID)) {
        return;
      }
      let cancelled = false;
      void ensureTourLoaded(activeTourID).then(function refreshAfterLoad(loaded) {
        if (cancelled || !loaded) {
          return;
        }
        setTourLoadRevision(revision => revision + 1);
      });
      return function cancelLoad() {
        cancelled = true;
      };
    },
    [activeTourID]
  );

  useEffect(
    function pauseTourOnRouteLeave() {
      if (tour && !tourMatchesRoute(tour, location.pathname)) {
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
    currentStep.onEnter?.({
      pathname: location.pathname,
      changeTab: router.changeTab,
      gotoEditActive: router.gotoEditActive
    });
    if (!currentStep.anchor) {
      return;
    }
    void waitForAnchorElement(currentStep.anchor, 800, signal).then(function resolveAnchor(element) {
      const state = useOnboardingStore.getState();
      if (state.activeTourID !== currentTour.id || state.activeStep !== stepIndex) {
        return;
      }
      if (!element) {
        // Conditional UI (e.g. structure tools) may omit anchors — skip without blocking the tour.
        const nextIndex = stepIndex + moveDirection;
        if (nextIndex < 0) {
          state.dismissActiveTour();
        } else if (nextIndex >= currentTour.steps.length) {
          state.completeActiveTour(currentTour.version);
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
      if (!currentTour || !tourMatchesRoute(currentTour, location.pathname)) {
        return;
      }
      const controller = new AbortController();
      onActivateStep(currentTour, activeStep, direction, controller.signal);
      return function abortAnchorWait() {
        controller.abort();
      };
    },
    [activeTourID, activeStep, direction, location.pathname, tourLoadRevision]
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

  useEffect(
    function hideUiTooltipsWhileTourActive() {
      if (!activeTourID) {
        return;
      }
      hideTooltips();
      return function restoreUiTooltips() {
        showTooltips();
      };
    },
    [activeTourID, hideTooltips, showTooltips]
  );

  if (!tour || !step) {
    return null;
  }

  const activeTour = tour;
  const activeStepDef = step;

  const content = resolveStepContent(activeTour, activeStepDef.id, locale);
  if (!content) {
    return null;
  }

  const currentTourVersion = activeTour.version;
  const totalSteps = activeTour.steps.length;

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
    if (activeStep <= 0) {
      returnFromSubtour();
      return;
    }
    setActiveStep(activeStep - 1);
  }

  function handleSkip() {
    skipActiveTour(currentTourVersion);
  }

  function handleExplore() {
    const subtourID = activeStepDef.subtour;
    if (!subtourID) {
      return;
    }
    void ensureTourLoaded(subtourID).then(function openSubtour(subtour) {
      if (!subtour) {
        console.warn(`Tour "${activeTour.id}": subtour "${subtourID}" is not registered`);
        return;
      }
      setDirection(1);
      setCardHeight(ESTIMATED_CARD_HEIGHT);
      enterSubtour(subtourID);
    });
  }

  const canExplore = Boolean(activeStepDef.subtour);
  const canGoBack = activeStep > 0 || tourStack.length > 0;

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
        showBack={canGoBack}
        onExplore={canExplore ? handleExplore : undefined}
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
