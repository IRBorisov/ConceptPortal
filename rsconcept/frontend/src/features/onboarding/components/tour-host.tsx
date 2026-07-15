'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router';
import { toast } from 'react-toastify';

import { type AppLocale } from '@/i18n';
import { globalTx } from '@/i18n/format-app-message';

import { useConceptNavigation } from '@/app/navigation/navigation-context';

import { cn } from '@/components/utils';
import { usePreferencesStore } from '@/stores/preferences';
import { useTooltipsStore } from '@/stores/tooltips';

import { subscribeOnboardingActions } from '../models/actions';
import {
  createStepViewGate,
  emitOnboardingEvent,
  type OnboardingEventName,
  type TourEntrySource
} from '../models/events';
import {
  resolveInteractionRegionAnchor,
  resolveTourStepMode,
  type Tour,
  tourMatchesRoute,
  type TourStepContent
} from '../models/tour';
import { shouldOfferTour, useOnboardingStore } from '../stores/onboarding';
import { ensureTourLoaded, findAutoStartTour, findResumeOfferTourID, getTourByID } from '../tours';
import { DEFAULT_ANCHOR_TIMEOUT_MS, rectsAlmostEqual, waitForAnchorElement } from '../utils/anchors';
import {
  computeBottomSheetPosition,
  computeCardPosition,
  computeCenteredCardPosition,
  ESTIMATED_CARD_HEIGHT,
  readLayoutViewport,
  resolveTourCardLayoutMode,
  type TourCardLayoutMode
} from '../utils/card-position';
import { installInteractFocusContainment } from '../utils/focus-containment';
import { computeCutoutPanelRects, expandRectToCutout } from '../utils/interact-cutout';

import { TourCard } from './tour-card';
import { TourInteractOverlay } from './tour-interact-overlay';
import { TourInvitation } from './tour-invitation';

const SPOTLIGHT_PADDING = 6;
const TAB_TOOLS_OBSTACLE_SELECTOR = '.cc-tab-tools';

type AnchorStatus = 'idle' | 'loading' | 'ready' | 'unavailable';

interface AnchorResolution {
  key: string;
  status: 'loading' | 'ready' | 'unavailable';
  element: HTMLElement | null;
}

interface TourInvitationOffer {
  tour: Tour;
  resumeStep: number;
}

function buildStepAnchorKey(tourID: string, stepIndex: number, anchor?: string): string {
  return `${tourID}:${stepIndex}:${anchor ?? ''}`;
}

/** Wait until the next paint so route content can settle before showing an invitation. */
function waitForContentReady(signal: AbortSignal): Promise<void> {
  return new Promise(function scheduleContentReady(resolve) {
    if (signal.aborted) {
      resolve();
      return;
    }
    requestAnimationFrame(function afterFirstFrame() {
      requestAnimationFrame(function afterSecondFrame() {
        resolve();
      });
    });
  });
}

/** Renders the active onboarding tour: spotlight, step card, invitation, and auto-offer logic. Mount once per app shell. */
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
  const dismissActiveTour = useOnboardingStore(state => state.dismissActiveTour);
  const skipActiveTour = useOnboardingStore(state => state.skipActiveTour);
  const completeActiveTour = useOnboardingStore(state => state.completeActiveTour);
  const declineTourOffer = useOnboardingStore(state => state.declineTourOffer);
  const resumeOfferTourID = useOnboardingStore(state => state.resumeOfferTourID);

  const [invitation, setInvitation] = useState<TourInvitationOffer | null>(null);
  const [anchorResolution, setAnchorResolution] = useState<AnchorResolution>({
    key: '',
    status: 'loading',
    element: null
  });
  const [regionResolution, setRegionResolution] = useState<AnchorResolution>({
    key: '',
    status: 'loading',
    element: null
  });
  const [trackedRect, setTrackedRect] = useState<TrackedRect | null>(null);
  const [trackedRegionRect, setTrackedRegionRect] = useState<TrackedRect | null>(null);
  const [cardElement, setCardElement] = useState<HTMLDivElement | null>(null);
  const [cardHeight, setCardHeight] = useState(ESTIMATED_CARD_HEIGHT);
  /** Bumps when a lazy tour finishes loading so sync `getTourByID` is re-read. */
  const [tourLoadRevision, setTourLoadRevision] = useState(0);
  /** Bumps to re-run anchor resolution after Retry. */
  const [anchorRetryToken, setAnchorRetryToken] = useState(0);
  /** Bumps on window/visualViewport resize, scroll, or orientation change. */
  const [viewportRevision, setViewportRevision] = useState(0);

  const tour = activeTourID ? getTourByID(activeTourID) : null;
  const step = tour ? (tour.steps[activeStep] ?? null) : null;
  const stepContent = tour && step ? resolveStepContent(tour, step.id, locale) : null;
  const isTourRendered = Boolean(tour && step && stepContent);

  const stepAnchorKey = activeTourID && step ? buildStepAnchorKey(activeTourID, activeStep, step.anchor) : '';
  const stepMode = step ? resolveTourStepMode(step) : 'explain';
  const isInteractStep = stepMode === 'interact';
  const regionAnchorName = step ? resolveInteractionRegionAnchor(step) : undefined;
  const regionAnchorKey =
    activeTourID && step && regionAnchorName ? buildStepAnchorKey(activeTourID, activeStep, regionAnchorName) : '';
  const sharesRegionAndSpotlight = Boolean(stepAnchorKey) && stepAnchorKey === regionAnchorKey;
  const resolutionMatchesStep = Boolean(stepAnchorKey) && anchorResolution.key === stepAnchorKey;
  const regionResolutionMatchesStep = Boolean(regionAnchorKey) && regionResolution.key === regionAnchorKey;
  const anchorStatus: AnchorStatus = !step?.anchor
    ? 'idle'
    : resolutionMatchesStep
      ? anchorResolution.status
      : 'loading';
  const regionStatus: AnchorStatus =
    !isInteractStep || !regionAnchorName
      ? 'idle'
      : sharesRegionAndSpotlight
        ? anchorStatus
        : regionResolutionMatchesStep
          ? regionResolution.status
          : 'loading';
  const anchorElement = resolutionMatchesStep && anchorResolution.status === 'ready' ? anchorResolution.element : null;
  const regionElement =
    isInteractStep && regionAnchorName
      ? sharesRegionAndSpotlight
        ? anchorElement
        : regionResolutionMatchesStep && regionResolution.status === 'ready'
          ? regionResolution.element
          : null
      : null;
  const anchorRect = anchorElement !== null && trackedRect?.element === anchorElement ? trackedRect.rect : null;
  const regionRect =
    regionElement !== null
      ? regionElement === anchorElement && anchorRect !== null
        ? anchorRect
        : trackedRegionRect?.element === regionElement
          ? trackedRegionRect.rect
          : null
      : null;
  const layoutAnchorRect =
    anchorStatus === 'ready' ? anchorRect : isInteractStep && regionStatus === 'ready' ? regionRect : null;
  const [heldSpotlightRect, setHeldSpotlightRect] = useState<DOMRect | null>(null);
  const [animateSpotlight, setAnimateSpotlight] = useState(false);
  const spotlightWasVisibleRef = useRef(false);
  const stepViewGateRef = useRef(createStepViewGate());
  const lastUnavailableKeyRef = useRef<string | null>(null);
  const actionCompletedRef = useRef(false);

  const expectsSpotlight = Boolean(step?.anchor) && anchorStatus !== 'unavailable' && Boolean(activeTourID);
  if (layoutAnchorRect) {
    if (!rectsAlmostEqual(heldSpotlightRect, layoutAnchorRect)) {
      setHeldSpotlightRect(layoutAnchorRect);
    }
  } else if (!expectsSpotlight && heldSpotlightRect !== null) {
    setHeldSpotlightRect(null);
  }
  const spotlightRect = layoutAnchorRect ?? (expectsSpotlight ? heldSpotlightRect : null);
  const hasSpotlight = spotlightRect !== null;

  useEffect(
    function offerTourInvitationOnRoute() {
      if (activeTourID) {
        return;
      }
      let cancelled = false;
      const readiness = new AbortController();

      /** Show a non-blocking invitation after persist hydration and content readiness. */
      async function offerTourInvitation() {
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
        const { sessionDismissed: dismissed, tours, resumeOfferTourID } = useOnboardingStore.getState();
        /** Prefer a route-paused tour (contextual guides) over the page auto-start candidate. */
        async function resolveOfferCandidate(): Promise<Tour | null> {
          const resumeID = findResumeOfferTourID(location.pathname, resumeOfferTourID);
          if (resumeID) {
            const resumed = await ensureTourLoaded(resumeID);
            if (resumed && !dismissed[resumed.id] && shouldOfferTour(tours[resumed.id], resumed.version)) {
              return resumed;
            }
          }
          return findAutoStartTour(location.pathname);
        }

        const candidate = await resolveOfferCandidate();
        if (cancelled || !candidate) {
          if (!cancelled) {
            setInvitation(null);
          }
          return;
        }
        if (dismissed[candidate.id] || !shouldOfferTour(tours[candidate.id], candidate.version)) {
          if (!cancelled) {
            setInvitation(null);
          }
          return;
        }
        await waitForContentReady(readiness.signal);
        if (cancelled) {
          return;
        }
        const progress = useOnboardingStore.getState().tours[candidate.id];
        if (
          useOnboardingStore.getState().sessionDismissed[candidate.id] ||
          !shouldOfferTour(progress, candidate.version)
        ) {
          setInvitation(null);
          return;
        }
        const fromStep = progress?.status === 'pending' ? Math.min(progress.resumeStep, candidate.steps.length - 1) : 0;
        setInvitation({ tour: candidate, resumeStep: fromStep });
        emitOnboardingEvent({
          name: 'invitation_shown',
          tourId: candidate.id,
          tourVersion: candidate.version,
          stepCount: candidate.steps.length,
          route: location.pathname,
          locale,
          source: 'invitation'
        });
      }

      void offerTourInvitation();
      return function cancelTourInvitation() {
        cancelled = true;
        readiness.abort();
        setInvitation(null);
      };
    },
    // Intentionally omit tourRecords/sessionDismissed: hydration updates would cancel the in-flight offer.
    // Progress is always read from getState() after hydration + async load.
    // resumeOfferTourID: pause on the same route (load failure) must re-trigger the offer.
    [location.pathname, activeTourID, locale, resumeOfferTourID]
  );

  useEffect(
    function loadActiveTourContent() {
      if (!activeTourID || getTourByID(activeTourID)) {
        return;
      }
      let cancelled = false;
      void ensureTourLoaded(activeTourID).then(function refreshAfterLoad(loaded) {
        if (cancelled) {
          return;
        }
        if (!loaded) {
          toast.error(globalTx('tx.onboarding.load.fail'));
          emitOnboardingEvent({
            name: 'load_failed',
            tourId: activeTourID,
            tourVersion: 0,
            route: location.pathname,
            locale
          });
          pauseActiveTour();
          return;
        }
        setTourLoadRevision(revision => revision + 1);
      });
      return function cancelLoad() {
        cancelled = true;
      };
    },
    [activeTourID, pauseActiveTour, location.pathname, locale]
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

    const mode = resolveTourStepMode(currentStep);
    const regionAnchor = resolveInteractionRegionAnchor(currentStep);

    function resolveAnchorTarget(
      anchorName: string,
      resolutionKey: string,
      onResolved: (resolution: AnchorResolution) => void
    ) {
      void waitForAnchorElement(anchorName, DEFAULT_ANCHOR_TIMEOUT_MS, signal).then(function resolveAnchor(
        element: HTMLElement | null
      ) {
        const state = useOnboardingStore.getState();
        if (state.activeTourID !== currentTour.id || state.activeStep !== stepIndex) {
          return;
        }
        if (!element) {
          onResolved({ key: resolutionKey, status: 'unavailable', element: null });
          return;
        }
        element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        onResolved({ key: resolutionKey, status: 'ready', element });
      });
    }

    if (currentStep.anchor) {
      const resolutionKey = buildStepAnchorKey(currentTour.id, stepIndex, currentStep.anchor);
      resolveAnchorTarget(currentStep.anchor, resolutionKey, function applySpotlightResolution(resolution) {
        setAnchorResolution(resolution);
        if (resolution.status === 'unavailable' && lastUnavailableKeyRef.current !== resolution.key) {
          lastUnavailableKeyRef.current = resolution.key;
          emitTourLifecycle('anchor_unavailable', currentTour, {
            route: location.pathname,
            locale,
            stepId: currentStep.id,
            stepIndex
          });
        }
      });
    }

    if (mode === 'interact' && regionAnchor) {
      const regionKey = buildStepAnchorKey(currentTour.id, stepIndex, regionAnchor);
      if (currentStep.anchor === regionAnchor) {
        return;
      }
      resolveAnchorTarget(regionAnchor, regionKey, function applyRegionResolution(resolution) {
        setRegionResolution(resolution);
        if (resolution.status === 'unavailable' && lastUnavailableKeyRef.current !== resolution.key) {
          lastUnavailableKeyRef.current = resolution.key;
          emitTourLifecycle('anchor_unavailable', currentTour, {
            route: location.pathname,
            locale,
            stepId: currentStep.id,
            stepIndex
          });
        }
      });
    }
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
      onActivateStep(currentTour, activeStep, controller.signal);
      return function abortAnchorWait() {
        controller.abort();
      };
    },
    [activeTourID, activeStep, location.pathname, tourLoadRevision, anchorRetryToken]
  );

  useEffect(
    function trackRegionRect() {
      if (!regionElement || regionElement === anchorElement) {
        return;
      }
      const element: HTMLElement = regionElement;
      let frame = 0;
      let lastRect: DOMRect | null = null;
      function measureRegion() {
        const rect = element.getBoundingClientRect();
        if (!rectsAlmostEqual(rect, lastRect)) {
          lastRect = rect;
          setTrackedRegionRect({ element, rect });
        }
        frame = requestAnimationFrame(measureRegion);
      }
      frame = requestAnimationFrame(measureRegion);
      return function stopTrackingRegion() {
        cancelAnimationFrame(frame);
      };
    },
    [regionElement, anchorElement]
  );

  useEffect(
    function resetActionCompletionOnStepChange() {
      actionCompletedRef.current = false;
    },
    [activeStep, activeTourID, step?.completeAction]
  );

  const onAdvanceFromAction = useEffectEvent(function advanceFromAction(
    targetTour: Tour,
    stepIndex: number,
    stepId: string,
    actionId: string,
    layout: TourCardLayoutMode
  ) {
    if (actionCompletedRef.current) {
      return;
    }
    const state = useOnboardingStore.getState();
    if (state.activeTourID !== targetTour.id || state.activeStep !== stepIndex) {
      return;
    }
    actionCompletedRef.current = true;
    emitTourLifecycle('action_completed', targetTour, {
      route: location.pathname,
      locale,
      stepId,
      stepIndex,
      layout,
      actionId
    });
    if (stepIndex >= targetTour.steps.length - 1) {
      emitTourLifecycle('completed', targetTour, {
        route: location.pathname,
        locale,
        stepId,
        stepIndex,
        layout
      });
      completeActiveTour(targetTour.version);
      return;
    }
    setActiveStep(stepIndex + 1);
  });

  useEffect(
    function subscribeToPracticeActions() {
      const completeAction = step?.completeAction;
      if (!isTourRendered || !isInteractStep || !completeAction || !tour || !step) {
        return;
      }
      if (isInteractStep && regionAnchorName && regionStatus === 'unavailable') {
        return;
      }
      const expectedStepIndex = activeStep;
      const expectedStepId = step.id;
      const expectedAction = completeAction;
      const layout = resolveTourCardLayoutMode(layoutAnchorRect !== null, readLayoutViewport());

      return subscribeOnboardingActions(function handlePracticeAction(detail) {
        if (detail.actionId !== expectedAction) {
          return;
        }
        onAdvanceFromAction(tour, expectedStepIndex, expectedStepId, expectedAction, layout);
      });
    },
    [
      isTourRendered,
      isInteractStep,
      tour,
      step,
      activeStep,
      regionAnchorName,
      regionStatus,
      layoutAnchorRect,
      locale,
      location.pathname
    ]
  );

  useEffect(
    function containInteractFocus() {
      if (!isInteractStep || !isTourRendered || !cardElement || !regionElement) {
        return;
      }
      return installInteractFocusContainment({
        roots: [cardElement, regionElement],
        fallbackRoot: cardElement
      });
    },
    [isInteractStep, isTourRendered, cardElement, regionElement]
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
        let frame = 0;
        frame = requestAnimationFrame(function keepSpotlightTransition() {
          setAnimateSpotlight(true);
        });
        return function cancelKeepSpotlightTransition() {
          cancelAnimationFrame(frame);
        };
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
    [hasSpotlight]
  );

  useEffect(
    function resetStepViewGateWhenTourEnds() {
      if (!activeTourID) {
        stepViewGateRef.current.reset();
        lastUnavailableKeyRef.current = null;
      }
    },
    [activeTourID]
  );

  useEffect(
    function emitStepViewedOncePerStep() {
      if (!isTourRendered || !tour || !step) {
        return;
      }
      // Wait for anchored steps to finish resolving so layout metadata is meaningful.
      if (step.anchor && anchorStatus === 'loading') {
        return;
      }
      if (isInteractStep && regionAnchorName && regionStatus === 'loading') {
        return;
      }
      if (!stepViewGateRef.current.shouldEmit(tour.id, activeStep)) {
        return;
      }
      const layoutViewport = readLayoutViewport();
      const layout = resolveTourCardLayoutMode(layoutAnchorRect !== null, layoutViewport);
      emitTourLifecycle('step_viewed', tour, {
        route: location.pathname,
        locale,
        stepId: step.id,
        stepIndex: activeStep,
        layout
      });
    },
    [
      isTourRendered,
      tour,
      step,
      activeStep,
      layoutAnchorRect,
      anchorStatus,
      regionStatus,
      isInteractStep,
      regionAnchorName,
      location.pathname,
      locale
    ]
  );

  useEffect(
    function returnFromSubtourOnEscape() {
      if (!isTourRendered || tourStack.length === 0) {
        return;
      }
      function onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
          event.stopPropagation();
          dismissActiveTour();
        }
      }
      window.addEventListener('keydown', onKeyDown, true);
      return function removeEscapeListener() {
        window.removeEventListener('keydown', onKeyDown, true);
      };
    },
    [isTourRendered, tourStack.length, dismissActiveTour]
  );

  useEffect(
    function markAppInertWhileTourVisible() {
      if (!isTourRendered || isInteractStep) {
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
    [isTourRendered, isInteractStep]
  );

  useEffect(
    function hideUiTooltipsWhileTourActive() {
      if (!isTourRendered) {
        return;
      }
      const tooltipsWereEnabled = useTooltipsStore.getState().tooltipsEnabled;
      hideTooltips();
      return function restoreUiTooltips() {
        if (tooltipsWereEnabled) {
          showTooltips();
        } else {
          hideTooltips();
        }
      };
    },
    [isTourRendered, hideTooltips, showTooltips]
  );

  useEffect(
    function trackViewportChanges() {
      if (!isTourRendered) {
        return;
      }
      function bumpViewportRevision() {
        setViewportRevision(revision => revision + 1);
      }
      window.addEventListener('resize', bumpViewportRevision);
      window.addEventListener('orientationchange', bumpViewportRevision);
      const visualViewport = window.visualViewport;
      visualViewport?.addEventListener('resize', bumpViewportRevision);
      visualViewport?.addEventListener('scroll', bumpViewportRevision);
      return function stopTrackingViewport() {
        window.removeEventListener('resize', bumpViewportRevision);
        window.removeEventListener('orientationchange', bumpViewportRevision);
        visualViewport?.removeEventListener('resize', bumpViewportRevision);
        visualViewport?.removeEventListener('scroll', bumpViewportRevision);
      };
    },
    [isTourRendered]
  );

  if (!isTourRendered || !tour || !step || !stepContent) {
    if (!invitation) {
      return null;
    }
    const inviteTour = invitation.tour;
    const inviteResumeStep = invitation.resumeStep;
    const firstStep = inviteTour.steps[0];
    const inviteContent = firstStep ? resolveStepContent(inviteTour, firstStep.id, locale) : null;
    if (!inviteContent) {
      return null;
    }
    const canResume = inviteResumeStep > 0;

    function handleStartInvitation() {
      emitTourLifecycle('invitation_accepted', inviteTour, {
        route: location.pathname,
        locale,
        source: 'invitation'
      });
      emitTourLifecycle('tour_started', inviteTour, {
        route: location.pathname,
        locale,
        stepIndex: inviteResumeStep,
        source: 'invitation'
      });
      startTour(inviteTour.id, inviteResumeStep);
      setInvitation(null);
    }

    function handleDeclineInvitation() {
      emitTourLifecycle('invitation_not_now', inviteTour, {
        route: location.pathname,
        locale,
        source: 'invitation'
      });
      declineTourOffer(inviteTour.id);
      setInvitation(null);
    }

    return (
      <TourInvitation
        title={inviteContent.title}
        purpose={inviteContent.body}
        stepCount={inviteTour.steps.length}
        canResume={canResume}
        onStart={handleStartInvitation}
        onDecline={handleDeclineInvitation}
      />
    );
  }

  const activeTour = tour;
  const activeStepDef = step;
  const content = stepContent;

  const currentTourVersion = activeTour.version;
  const totalSteps = activeTour.steps.length;
  const anchorUnavailable = isInteractStep
    ? Boolean(regionAnchorName) && regionStatus === 'unavailable'
    : Boolean(activeStepDef.anchor) && anchorStatus === 'unavailable';
  const canExplore = Boolean(activeStepDef.subtour);
  const canGoBack = activeStep > 0 || tourStack.length > 0;

  const layoutViewport = readLayoutViewport();
  void viewportRevision;
  const cardLayoutMode = resolveTourCardLayoutMode(hasSpotlight, layoutViewport);
  const cardPosition =
    cardLayoutMode === 'bottom-sheet'
      ? computeBottomSheetPosition(cardHeight, layoutViewport)
      : cardLayoutMode === 'centered'
        ? computeCenteredCardPosition(cardHeight, layoutViewport)
        : computeCardPosition(
            spotlightRect!,
            step.placement ?? 'bottom',
            cardHeight,
            layoutViewport,
            TAB_TOOLS_OBSTACLE_SELECTOR
          );

  function advanceStep(moveDirection: 1 | -1) {
    if (moveDirection > 0) {
      if (activeStep >= totalSteps - 1) {
        emitTourLifecycle('completed', activeTour, {
          route: location.pathname,
          locale,
          stepId: activeStepDef.id,
          stepIndex: activeStep,
          layout: cardLayoutMode
        });
        completeActiveTour(currentTourVersion);
      } else {
        setActiveStep(activeStep + 1);
      }
      return;
    }
    if (activeStep <= 0) {
      returnFromSubtour();
      return;
    }
    setActiveStep(activeStep - 1);
  }

  function handleNext() {
    advanceStep(1);
  }

  function handleBack() {
    advanceStep(-1);
  }

  function handleSkip() {
    emitTourLifecycle('skipped', activeTour, {
      route: location.pathname,
      locale,
      stepId: activeStepDef.id,
      stepIndex: activeStep,
      layout: cardLayoutMode
    });
    skipActiveTour(currentTourVersion);
  }

  function handleRetryAnchor() {
    emitTourLifecycle('anchor_retried', activeTour, {
      route: location.pathname,
      locale,
      stepId: activeStepDef.id,
      stepIndex: activeStep,
      layout: cardLayoutMode
    });
    lastUnavailableKeyRef.current = null;
    if (stepAnchorKey) {
      setAnchorResolution({ key: stepAnchorKey, status: 'loading', element: null });
    }
    if (regionAnchorKey && !sharesRegionAndSpotlight) {
      setRegionResolution({ key: regionAnchorKey, status: 'loading', element: null });
    }
    setAnchorRetryToken(token => token + 1);
  }

  function handleExplore() {
    const subtourID = activeStepDef.subtour;
    if (!subtourID) {
      return;
    }
    void ensureTourLoaded(subtourID).then(function openSubtour(subtour) {
      if (!subtour) {
        toast.error(globalTx('tx.onboarding.load.fail'));
        emitOnboardingEvent({
          name: 'load_failed',
          tourId: subtourID,
          tourVersion: 0,
          route: location.pathname,
          locale
        });
        console.warn(`Tour "${activeTour.id}": subtour "${subtourID}" is not registered`);
        return;
      }
      setCardHeight(ESTIMATED_CARD_HEIGHT);
      emitTourLifecycle('subtour_entered', subtour, {
        route: location.pathname,
        locale,
        stepIndex: 0
      });
      enterSubtour(subtourID);
    });
  }

  const interactCutoutRect =
    isInteractStep && regionRect
      ? expandRectToCutout(regionRect, SPOTLIGHT_PADDING, layoutViewport)
      : isInteractStep && spotlightRect
        ? expandRectToCutout(spotlightRect, SPOTLIGHT_PADDING, layoutViewport)
        : null;
  const interactPanels =
    interactCutoutRect !== null ? computeCutoutPanelRects(interactCutoutRect, layoutViewport) : null;

  return createPortal(
    <div className='fixed inset-0 z-topmost isolate pointer-events-none' data-testid='tour-layer'>
      {isInteractStep ? (
        interactPanels ? (
          <TourInteractOverlay panels={interactPanels} />
        ) : null
      ) : (
        <div className='fixed inset-0 z-0 pointer-events-auto' data-testid='tour-overlay' />
      )}
      {hasSpotlight && spotlightRect ? (
        <div
          className={cn(
            'fixed z-0 rounded-md pointer-events-none',
            animateSpotlight &&
              'transition-[top,left,width,height] duration-500 ease-in-out motion-reduce:duration-1000'
          )}
          style={{
            top: spotlightRect.top - SPOTLIGHT_PADDING,
            left: spotlightRect.left - SPOTLIGHT_PADDING,
            width: spotlightRect.width + 2 * SPOTLIGHT_PADDING,
            height: spotlightRect.height + 2 * SPOTLIGHT_PADDING,
            boxShadow: isInteractStep
              ? '0 0 0 2px var(--color-primary)'
              : '0 0 0 2px var(--color-primary), 0 0 0 9999px rgb(0 0 0 / 45%)'
          }}
          data-testid='tour-spotlight'
        />
      ) : !isInteractStep ? (
        <div className='fixed inset-0 z-0 bg-[rgb(0_0_0/45%)]' />
      ) : null}
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
        anchorUnavailable={anchorUnavailable}
        onRetryAnchor={anchorUnavailable ? handleRetryAnchor : undefined}
        layoutMode={cardLayoutMode}
        onCardElement={setCardElement}
        className='pointer-events-auto z-10'
        style={
          cardLayoutMode === 'bottom-sheet'
            ? { top: cardPosition.top }
            : { left: cardPosition.left, top: cardPosition.top }
        }
        onLayout={setCardHeight}
      />
    </div>,
    document.body
  );
}

// ====== Internals =========
interface TrackedRect {
  element: HTMLElement;
  rect: DOMRect;
}

function emitTourLifecycle(
  name: OnboardingEventName,
  targetTour: Pick<Tour, 'id' | 'version' | 'steps'>,
  context: {
    route: string;
    locale: string;
    stepId?: string;
    stepIndex?: number;
    layout?: TourCardLayoutMode;
    source?: TourEntrySource;
    actionId?: string;
  }
) {
  emitOnboardingEvent({
    name,
    tourId: targetTour.id,
    tourVersion: targetTour.version,
    stepCount: targetTour.steps.length,
    route: context.route,
    locale: context.locale,
    stepId: context.stepId,
    stepIndex: context.stepIndex,
    layout: context.layout,
    source: context.source,
    actionId: context.actionId
  });
}

function resolveStepContent(tour: Tour, stepID: string, locale: AppLocale): TourStepContent | null {
  const localized = tour.content[locale]?.[stepID];
  return localized ?? tour.content.en[stepID] ?? null;
}
