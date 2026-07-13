import { describe, expect, test } from 'vitest';

import { validateTour } from '../models/tour';

import { EditorTourID, LibraryTourID, PassportTourID, SandboxTourID } from './editor-tours';
import {
  ensureTourLoaded,
  findAutoStartTour,
  findAutoStartTourID,
  getTourByID,
  isKnownTourID,
  loadAllTours,
  validateSubtourLinks,
  validateTourRegistrations
} from './index';

describe('tour registry', () => {
  test('catalog knows registered ids without loading content', () => {
    expect(isKnownTourID(SandboxTourID.INTRO)).toBe(true);
    expect(isKnownTourID(EditorTourID.CONSTITUENTS_LIST)).toBe(true);
    expect(isKnownTourID(PassportTourID.SCHEMA)).toBe(true);
    expect(isKnownTourID('missing-tour')).toBe(false);
  });

  test('findAutoStartTourID is sync and does not require content', () => {
    expect(findAutoStartTourID('/sandbox')).toBe(SandboxTourID.INTRO);
    expect(findAutoStartTourID('/library')).toBe(LibraryTourID.INTRO);
    expect(findAutoStartTourID('/unknown')).toBeNull();
  });

  test('every registered tour loads, validates, and matches catalog metadata', async () => {
    const allTours = await loadAllTours();
    expect(allTours.length).toBeGreaterThan(0);

    for (const tour of allTours) {
      expect(validateTour(tour)).toEqual([]);
    }

    const ids = allTours.map(tour => tour.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(validateSubtourLinks(allTours)).toEqual([]);
    expect(validateTourRegistrations(allTours)).toEqual([]);
  }, 15_000);

  test('getTourByID returns loaded tours and null for unknown', async () => {
    await loadAllTours();
    expect(getTourByID(SandboxTourID.INTRO)?.id).toBe(SandboxTourID.INTRO);
    expect(getTourByID(EditorTourID.CONSTITUENTS_LIST)?.id).toBe(EditorTourID.CONSTITUENTS_LIST);
    expect(getTourByID(EditorTourID.CONCEPT_EDITOR)?.id).toBe(EditorTourID.CONCEPT_EDITOR);
    expect(getTourByID(EditorTourID.TERM_GRAPH)?.id).toBe(EditorTourID.TERM_GRAPH);
    expect(getTourByID(LibraryTourID.INTRO)?.id).toBe(LibraryTourID.INTRO);
    expect(getTourByID(PassportTourID.SCHEMA)?.id).toBe(PassportTourID.SCHEMA);
    expect(getTourByID(PassportTourID.MODEL)?.id).toBe(PassportTourID.MODEL);
    expect(getTourByID(PassportTourID.OSS)?.id).toBe(PassportTourID.OSS);
    expect(getTourByID(PassportTourID.SANDBOX)?.id).toBe(PassportTourID.SANDBOX);
    expect(getTourByID('missing-tour')).toBeNull();
  });

  test('findAutoStartTour loads sandbox and library intro content', async () => {
    const sandbox = await findAutoStartTour('/sandbox');
    expect(sandbox?.id).toBe(SandboxTourID.INTRO);
    expect(sandbox?.autoStart).toBe(true);
    const library = await findAutoStartTour('/library');
    expect(library?.id).toBe(LibraryTourID.INTRO);
    expect(library?.autoStart).toBe(true);
  });

  test('ensureTourLoaded caches and returns null for unknown ids', async () => {
    const first = await ensureTourLoaded(LibraryTourID.INTRO);
    const second = await ensureTourLoaded(LibraryTourID.INTRO);
    expect(first?.id).toBe(LibraryTourID.INTRO);
    expect(second).toBe(first);
    expect(await ensureTourLoaded('missing-tour')).toBeNull();
  });

  test('shared editor and passport tours are not auto-started', async () => {
    await loadAllTours();
    expect(getTourByID(EditorTourID.CONSTITUENTS_LIST)?.autoStart).toBe(false);
    expect(getTourByID(EditorTourID.CONCEPT_EDITOR)?.autoStart).toBe(false);
    expect(getTourByID(EditorTourID.TERM_GRAPH)?.autoStart).toBe(false);
    expect(getTourByID(LibraryTourID.INTRO)?.autoStart).toBe(true);
    expect(getTourByID(PassportTourID.SCHEMA)?.autoStart).toBe(false);
    expect(getTourByID(PassportTourID.MODEL)?.autoStart).toBe(false);
    expect(getTourByID(PassportTourID.OSS)?.autoStart).toBe(false);
    expect(getTourByID(PassportTourID.SANDBOX)?.autoStart).toBe(false);
  });
});
