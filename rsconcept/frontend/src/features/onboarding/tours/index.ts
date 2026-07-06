import { type Tour } from '../models/tour';

import { sandboxIntroTour } from './sandbox-intro';

/** All registered tours. Add new tours here; the engine requires no other changes. */
export const allTours: readonly Tour[] = [sandboxIntroTour];

export function getTourByID(tourID: string): Tour | null {
  return allTours.find(tour => tour.id === tourID) ?? null;
}

export function findAutoStartTour(pathname: string): Tour | null {
  return allTours.find(tour => tour.autoStart && tour.route === pathname) ?? null;
}
