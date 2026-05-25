/** 32-bit FNV-1a hash */
export function applyHash_fnv1a(str: string): number {
  let hash = 0x811c9dc5;

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

/** Generates stub ID for text. */
export function generateStub(text: string): string {
  const hash = applyHash_fnv1a(text);
  return hash.toString(16).padStart(8, '0').slice(0, 8);
}
