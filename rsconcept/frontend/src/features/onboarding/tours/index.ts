import { collectSubtourIDs, type Tour, tourMatchesRoute } from '../models/tour';

import {
  DialogTourID,
  EDITOR_TOUR_ROUTES,
  EditorTourID,
  LibraryTourID,
  MODEL_TOUR_ROUTES,
  ModelTourID,
  OssTourID,
  PassportTourID,
  SandboxTourID
} from './editor-tours';

/**
 * Sync catalog: ids, routes, and auto-start flags without pulling tour content into the main bundle.
 * Content loads via `ensureTourLoaded` when a tour is offered or started.
 */
interface TourRegistration {
  autoStart: boolean;
  route: Tour['route'];
  load: () => Promise<Tour>;
}

const tourRegistrations: Record<string, TourRegistration> = {
  [SandboxTourID.INTRO]: {
    autoStart: true,
    route: '/sandbox',
    load: () => import('./sandbox-intro').then(module => module.sandboxIntroTour)
  },
  [PassportTourID.SANDBOX]: {
    autoStart: false,
    route: '/sandbox',
    load: () => import('./sandbox-passport').then(module => module.sandboxPassportTour)
  },
  [PassportTourID.SCHEMA]: {
    autoStart: false,
    route: '/rsforms',
    load: () => import('./schema-passport').then(module => module.schemaPassportTour)
  },
  [PassportTourID.MODEL]: {
    autoStart: false,
    route: '/models',
    load: () => import('./model-passport').then(module => module.modelPassportTour)
  },
  [PassportTourID.OSS]: {
    autoStart: false,
    route: '/oss',
    load: () => import('./oss-passport').then(module => module.ossPassportTour)
  },
  [OssTourID.GRAPH]: {
    autoStart: false,
    route: '/oss',
    load: () => import('./oss-graph').then(module => module.ossGraphTour)
  },
  [ModelTourID.VALUE]: {
    autoStart: false,
    route: MODEL_TOUR_ROUTES,
    load: () => import('./model-value').then(module => module.modelValueTour)
  },
  [ModelTourID.EVALUATOR]: {
    autoStart: false,
    route: MODEL_TOUR_ROUTES,
    load: () => import('./model-evaluator').then(module => module.modelEvaluatorTour)
  },
  [EditorTourID.CONSTITUENTS_LIST]: {
    autoStart: false,
    route: EDITOR_TOUR_ROUTES,
    load: () => import('./constituents-list').then(module => module.constituentsListTour)
  },
  [EditorTourID.CONCEPT_EDITOR]: {
    autoStart: false,
    route: EDITOR_TOUR_ROUTES,
    load: () => import('./concept-editor').then(module => module.conceptEditorTour)
  },
  [EditorTourID.TERM_GRAPH]: {
    autoStart: false,
    route: EDITOR_TOUR_ROUTES,
    load: () => import('./term-graph').then(module => module.termGraphTour)
  },
  [LibraryTourID.INTRO]: {
    autoStart: false,
    route: '/library',
    load: () => import('./library-intro').then(module => module.libraryIntroTour)
  },
  [DialogTourID.FORMULA_TREE]: {
    autoStart: false,
    route: EDITOR_TOUR_ROUTES,
    load: () => import('./formula-tree').then(module => module.formulaTreeTour)
  },
  [DialogTourID.STRUCTURE_PLANNER]: {
    autoStart: false,
    route: EDITOR_TOUR_ROUTES,
    load: () => import('./structure-planner').then(module => module.structurePlannerTour)
  },
  [DialogTourID.CST_TEMPLATE]: {
    autoStart: false,
    route: EDITOR_TOUR_ROUTES,
    load: () => import('./cst-template').then(module => module.cstTemplateTour)
  },
  [DialogTourID.RELOCATE_CST]: {
    autoStart: false,
    route: '/oss',
    load: () => import('./relocate-cst').then(module => module.relocateCstTour)
  },
  [DialogTourID.CREATE_SYNTHESIS]: {
    autoStart: false,
    route: '/oss',
    load: () => import('./create-synthesis').then(module => module.createSynthesisTour)
  },
  'engine-fixture': {
    autoStart: false,
    route: '/sandbox',
    load: () => import('./engine-fixture').then(module => module.engineFixtureTour)
  }
};

const loadedTours = new Map<string, Tour>();
const loadingPromises = new Map<string, Promise<Tour | null>>();

/** Known tour ids from the catalog (loaded or not). */
export function isKnownTourID(tourID: string): boolean {
  return tourID in tourRegistrations;
}

/** Sync lookup of an already-loaded tour. Returns null until `ensureTourLoaded` finishes. */
export function getTourByID(tourID: string): Tour | null {
  return loadedTours.get(tourID) ?? null;
}

/** Tours currently in memory (for tests / diagnostics). */
export function getLoadedTours(): readonly Tour[] {
  return [...loadedTours.values()];
}

/**
 * Load tour content into the registry (cached). Safe to call repeatedly.
 * Returns null for unknown ids or failed imports.
 */
export async function ensureTourLoaded(tourID: string): Promise<Tour | null> {
  const cached = loadedTours.get(tourID);
  if (cached) {
    return cached;
  }

  const registration = tourRegistrations[tourID];
  if (!registration) {
    return null;
  }

  const pending = loadingPromises.get(tourID);
  if (pending) {
    return pending;
  }

  const loadPromise = registration
    .load()
    .then(function cacheTour(tour) {
      if (tour.id !== tourID) {
        console.warn(`Tour loader for "${tourID}" returned tour id "${tour.id}"`);
      }
      loadedTours.set(tourID, tour);
      loadingPromises.delete(tourID);
      return tour;
    })
    .catch(function handleTourLoadError(error: unknown) {
      loadingPromises.delete(tourID);
      console.warn(`Failed to load tour "${tourID}"`, error);
      return null;
    });

  loadingPromises.set(tourID, loadPromise);
  return loadPromise;
}

/** Load every registered tour (tests / validation). */
export async function loadAllTours(): Promise<readonly Tour[]> {
  await Promise.all(Object.keys(tourRegistrations).map(ensureTourLoaded));
  return getLoadedTours();
}

/** Sync auto-start candidate id from catalog metadata (no content load). */
export function findAutoStartTourID(pathname: string): string | null {
  for (const [tourID, registration] of Object.entries(tourRegistrations)) {
    if (registration.autoStart && tourMatchesRoute({ route: registration.route }, pathname)) {
      return tourID;
    }
  }
  return null;
}

/**
 * Session pause candidate: the tour left via route leave, if it still matches this pathname.
 * Used so contextual (`autoStart: false`) guides can show Resume after help → back.
 */
export function findResumeOfferTourID(pathname: string, resumeOfferTourID: string | null): string | null {
  if (!resumeOfferTourID) {
    return null;
  }
  const registration = tourRegistrations[resumeOfferTourID];
  if (!registration || !tourMatchesRoute({ route: registration.route }, pathname)) {
    return null;
  }
  return resumeOfferTourID;
}

/**
 * Resolve a tour to offer on this pathname: paused resume candidate first, else auto-start.
 * Returns null when none matches or the load fails.
 */
export async function findTourToOffer(pathname: string, resumeOfferTourID: string | null): Promise<Tour | null> {
  const resumeID = findResumeOfferTourID(pathname, resumeOfferTourID);
  if (resumeID) {
    return ensureTourLoaded(resumeID);
  }
  return findAutoStartTour(pathname);
}

/**
 * Resolve an auto-start tour for the pathname, loading content if needed.
 * Returns null when none matches or the load fails.
 */
export async function findAutoStartTour(pathname: string): Promise<Tour | null> {
  const tourID = findAutoStartTourID(pathname);
  if (!tourID) {
    return null;
  }
  return ensureTourLoaded(tourID);
}

/** True when every `subtour` reference points at a registered tour id. */
export function validateSubtourLinks(tours: readonly Tour[]): string[] {
  const ids = new Set(Object.keys(tourRegistrations));
  const problems: string[] = [];
  for (const tour of tours) {
    for (const subtourID of collectSubtourIDs(tour)) {
      if (!ids.has(subtourID)) {
        problems.push(`tour "${tour.id}" references unknown subtour "${subtourID}"`);
      }
    }
  }
  return problems;
}

/** Catalog vs loaded tour consistency (route / autoStart / id). */
export function validateTourRegistrations(tours: readonly Tour[]): string[] {
  const problems: string[] = [];
  const byID = new Map(tours.map(tour => [tour.id, tour]));

  for (const [tourID, registration] of Object.entries(tourRegistrations)) {
    const tour = byID.get(tourID);
    if (!tour) {
      problems.push(`registration "${tourID}" did not load`);
      continue;
    }
    if (tour.autoStart !== registration.autoStart) {
      problems.push(
        `tour "${tourID}": autoStart mismatch (catalog ${registration.autoStart} vs tour ${tour.autoStart})`
      );
    }
    if (JSON.stringify(tour.route) !== JSON.stringify(registration.route)) {
      problems.push(`tour "${tourID}": route mismatch between catalog and tour definition`);
    }
  }

  for (const tour of tours) {
    if (!(tour.id in tourRegistrations)) {
      problems.push(`loaded tour "${tour.id}" is missing from tourRegistrations`);
    }
  }

  return problems;
}
