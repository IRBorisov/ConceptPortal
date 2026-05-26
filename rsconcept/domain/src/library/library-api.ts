const LOCATION_REGEXP = /^\/[PLUS]((\/[!\d\p{L}]([!\d\p{L}\- ]*[!\d\p{L}])?)*)?$/u; // cspell:disable-line

/** Combining head and body into location. */
export function combineLocation(head: string, body?: string): string {
  return body ? `${head}/${body}` : head;
}

/** Validation location against regexp. */
export function validateLocationFormat(location: string): boolean {
  return LOCATION_REGEXP.test(location);
}
