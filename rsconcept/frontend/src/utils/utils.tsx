export function assertIsNode(e: EventTarget | null): asserts e is Node {
  if (!e || !('nodeType' in e)) {
    throw new Error('Node expected');
  }
}

export async function delay(ms: number) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}

export function trimString(target: string, maxLen: number): string {
  if (target.length < maxLen) {
    return target;
  } else {
    return target.substring(0, maxLen) + '...';
  }
}