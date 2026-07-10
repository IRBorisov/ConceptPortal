/**
 * Inline synthesis helpers for library item selection.
 */

import { type LibraryItem } from '../library';
import { type RSForm } from '../rsform';

/** Sorts library items relevant for InlineSynthesis with specified {@link RSForm}. */
export function sortItemsForInlineSynthesis(receiver: RSForm, items: readonly LibraryItem[]): LibraryItem[] {
  const result = items.filter(item => item.location === receiver.location);
  for (const item of items) {
    if (item.visible && item.owner === receiver.owner && !result.includes(item)) {
      result.push(item);
    }
  }
  for (const item of items) {
    if (item.visible && !result.includes(item)) {
      result.push(item);
    }
  }
  for (const item of items) {
    if (!result.includes(item)) {
      result.push(item);
    }
  }
  return result;
}
