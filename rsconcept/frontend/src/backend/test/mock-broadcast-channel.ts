import { vi } from 'vitest';

/** In-memory BroadcastChannel mock for cross-tab sync tests. */
export class MockBroadcastChannel {
  static readonly byName = new Map<string, Set<MockBroadcastChannel>>();

  readonly name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  private closed = false;

  constructor(name: string) {
    this.name = name;
    if (!MockBroadcastChannel.byName.has(name)) {
      MockBroadcastChannel.byName.set(name, new Set());
    }
    MockBroadcastChannel.byName.get(name)!.add(this);
  }

  postMessage(data: unknown): void {
    const peers = MockBroadcastChannel.byName.get(this.name);
    if (!peers) {
      return;
    }
    for (const peer of peers) {
      if (peer !== this && !peer.closed && peer.onmessage) {
        peer.onmessage({ data } as MessageEvent);
      }
    }
  }

  close(): void {
    this.closed = true;
    MockBroadcastChannel.byName.get(this.name)?.delete(this);
  }

  static reset(): void {
    MockBroadcastChannel.byName.clear();
  }

  /** Deliver a message to every listener on a channel (simulates another tab). */
  static deliverToAll(channelName: string, data: unknown): void {
    for (const channel of MockBroadcastChannel.byName.get(channelName) ?? []) {
      channel.onmessage?.({ data } as MessageEvent);
    }
  }
}

export function installMockBroadcastChannel(): void {
  MockBroadcastChannel.reset();
  vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
}

export function uninstallMockBroadcastChannel(): void {
  vi.unstubAllGlobals();
  MockBroadcastChannel.reset();
}
